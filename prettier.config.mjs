/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  useTabs: false,
  tabWidth: 2,
  printWidth: 88,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  semi: false,
  plugins: ['prettier-plugin-go-template', 'prettier-plugin-organize-imports'],
  overrides: [
    {
      files: ['*.html'],
      options: {
        parser: 'go-template'
      }
    }
  ]
}
export default config
