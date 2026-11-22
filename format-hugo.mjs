import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { format } from 'oxfmt'

function actionEnd(source, start) {
  let quote = ''
  for (let index = start + 2; index < source.length; index++) {
    const character = source[index]
    if (quote) {
      if (character === '\\' && quote !== '`') index++
      else if (character === quote) quote = ''
    } else if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2)
      if (end === -1) throw new Error(`Unclosed Hugo comment at offset ${index}`)
      index = end + 1
    } else if ('"\'`'.includes(character)) {
      quote = character
    } else if (source.startsWith('}}', index)) {
      return index + 2
    }
  }
  throw new Error(`Unclosed Hugo action at offset ${start}`)
}

function actions(source) {
  const spans = []
  let cursor = 0
  while (true) {
    const start = source.indexOf('{{', cursor)
    if (start === -1) return spans
    cursor = actionEnd(source, start)
    spans.push({ start, end: cursor })
  }
}

function maskActions(source, save) {
  let masked = ''
  let cursor = 0
  for (const span of actions(source)) {
    let { start, end } = span
    // Go trim markers and untrimmed actions both depend on adjacent whitespace.
    while (start > cursor && /\s/.test(source[start - 1])) start--
    while (end < source.length && /\s/.test(source[end])) end++
    const action = source.slice(span.start, span.end)
    const lineStart = source.lastIndexOf('\n', span.start - 1) + 1
    const nextLine = source.indexOf('\n', span.end)
    const standalone =
      !source.slice(lineStart, span.start).trim() &&
      !source.slice(span.end, nextLine === -1 ? source.length : nextLine).trim()
    masked +=
      source.slice(cursor, start) +
      ` ${save(source.slice(start, end), {
        kind: 'action',
        standalone,
        keyword: /^{{-?\s*(if|range|with|define|block|else|end)\b/.exec(action)?.[1]
      })} `
    cursor = end
  }
  return masked + source.slice(cursor)
}

function maskRawText(source, save) {
  let masked = ''
  let cursor = 0
  let index = 0
  while ((index = source.indexOf('<', index)) !== -1) {
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4)
      if (end === -1) throw new Error('Unclosed HTML comment')
      index = end + 3
      continue
    }
    const tag = /^<(\/?)([a-z][\w:-]*)\b/i.exec(source.slice(index))
    if (!tag) {
      index++
      continue
    }
    let quote = ''
    let end = index + tag[0].length
    for (; end < source.length; end++) {
      const character = source[end]
      if (quote) {
        if (character === quote) quote = ''
      } else if (character === '"' || character === "'") quote = character
      else if (character === '>') break
    }
    if (end === source.length) throw new Error('Unclosed HTML tag')
    if (
      tag[1] ||
      !['script', 'style', 'pre', 'textarea'].includes(tag[2].toLowerCase())
    ) {
      index = end + 1
      continue
    }
    const close = new RegExp(`</${tag[2]}\\s*>`, 'gi')
    close.lastIndex = end + 1
    const closing = close.exec(source)
    if (!closing) throw new Error(`Unclosed ${tag[2]} element`)
    // Raw text, including indentation and template-generated code, is opaque.
    masked += source.slice(cursor, end + 1) + save(source.slice(end + 1, closing.index))
    cursor = closing.index
    index = close.lastIndex
  }
  return masked + source.slice(cursor)
}

function wrapBlocks(source, fragments, prefix) {
  const eligible = new Set()
  const marker = new RegExp(`${prefix}\\d+x`, 'y')
  // Only standalone actions outside tags and HTML comments describe HTML-level blocks.
  for (let index = 0; index < source.length; index++) {
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4)
      if (end === -1) throw new Error('Unclosed HTML comment')
      index = end + 2
    } else if (source[index] === '<') {
      let quote = ''
      for (index++; index < source.length; index++) {
        const character = source[index]
        if (quote) {
          if (character === quote) quote = ''
        } else if (character === '"' || character === "'") quote = character
        else if (character === '>') break
      }
    } else {
      marker.lastIndex = index
      const match = marker.exec(source)
      if (match) {
        eligible.add(match[0])
        index += match[0].length - 1
      }
    }
  }
  const replacements = []
  const stack = []
  for (const fragment of fragments.filter((fragment) => fragment.kind === 'action')) {
    if (!fragment.keyword) {
      if (fragment.standalone && eligible.has(fragment.token)) {
        replacements.push({ token: fragment.token, html: `<!-- ${fragment.token} -->` })
      }
      continue
    }
    if (fragment.keyword === 'else') {
      if (!stack.length) throw new Error('Hugo else without an opening block')
      stack.at(-1).push(fragment)
    } else if (fragment.keyword === 'end') {
      const group = stack.pop()
      if (!group) throw new Error('Hugo end without an opening block')
      group.push(fragment)
      if (!group.every((part) => part.standalone && eligible.has(part.token))) continue
      let previousTag
      for (const [index, part] of group.entries()) {
        const tag = `${prefix}block${replacements.length}`
        const html =
          index === 0
            ? `<${tag}>`
            : index === group.length - 1
              ? `</${previousTag}>`
              : `</${previousTag}>\n<${tag}>`
        replacements.push({ token: part.token, html })
        previousTag = tag
      }
    } else stack.push([fragment])
  }
  if (stack.length) throw new Error('Unclosed Hugo block')
  let wrapped = source
  for (const { token, html } of replacements) wrapped = wrapped.replace(token, html)
  return {
    wrapped,
    restore: (output) => {
      let restored = output
      for (const { token, html } of replacements) {
        const pattern = new RegExp(html.replaceAll('\n', '\\s*'), 'g')
        if ([...restored.matchAll(pattern)].length !== 1) {
          throw new Error('Formatter changed a protected template block')
        }
        restored = restored.replace(pattern, token)
      }
      return restored
    }
  }
}

async function formatOnce(source, options) {
  let prefix = 'hugofmt'
  while (source.includes(prefix)) prefix += 'x'
  const fragments = []
  const save = (text, details) => {
    const token = `${prefix}${fragments.length}x`
    fragments.push({ token, text, ...details })
    return token
  }
  const masked = maskRawText(maskActions(source, save), (text) =>
    save(text, { kind: 'raw' })
  )
  const { wrapped, restore } = wrapBlocks(masked, fragments, prefix)
  const result = await format('template.html', wrapped, {
    ...options,
    embeddedLanguageFormatting: 'off',
    htmlWhitespaceSensitivity: 'strict'
  })
  if (result.errors.length) {
    throw new Error(result.errors.map((error) => error.message).join('\n'))
  }

  let restored = restore(result.code)
  // Strip formatter-added whitespace before restoring a layer, never from restored text.
  // Raw-text fragments can contain action tokens, so restore their bodies first.
  for (const kind of ['raw', 'action']) {
    restored = restored.replace(new RegExp(`\\s*(${prefix}\\d+x)\\s*`, 'g'), '$1')
    for (const fragment of fragments.filter((fragment) => fragment.kind === kind)) {
      if (restored.split(fragment.token).length !== 2) {
        throw new Error('Formatter changed a protected fragment')
      }
      restored = restored.replace(fragment.token, () => fragment.text)
    }
  }
  const before = actions(source).map(({ start, end }) => source.slice(start, end))
  const after = actions(restored).map(({ start, end }) => restored.slice(start, end))
  if (JSON.stringify(before) !== JSON.stringify(after) || restored.includes(prefix)) {
    throw new Error('Formatter changed Hugo actions')
  }
  return restored
}

export async function formatHugo(source, options = {}) {
  const formatted = await formatOnce(source, options)
  if ((await formatOnce(formatted, options)) !== formatted) {
    throw new Error('Hugo formatting did not stabilize; file left unchanged')
  }
  return formatted
}

async function htmlFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await htmlFiles(file)))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file)
  }
  return files.sort((left, right) => left.localeCompare(right))
}

async function main() {
  const mode = process.argv[2]
  if (!['--check', '--write'].includes(mode) || process.argv.length !== 3) {
    throw new Error('Usage: node format-hugo.mjs --check|--write')
  }
  const options = JSON.parse(await readFile('.oxfmtrc.json', 'utf8'))
  const changed = []
  // Prepare every output before writing any template, so parse failures are non-destructive.
  for (const file of await htmlFiles('layouts')) {
    const source = await readFile(file, 'utf8')
    let formatted
    try {
      formatted = await formatHugo(source, options)
    } catch (error) {
      throw new Error(`${file}: ${error.message}`, { cause: error })
    }
    if (formatted !== source) changed.push({ file, formatted })
  }
  for (const { file, formatted } of changed) {
    if (mode === '--write') await writeFile(file, formatted)
    console.log(file)
  }
  if (mode === '--check' && changed.length) process.exitCode = 1
}

if (import.meta.main) {
  await main()
}
