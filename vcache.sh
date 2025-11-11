#!/usr/bin/env bash

source_dir="./node_modules/exampleSite/resources/_gen"
target_dir="./exampleSite/resources/_gen"

restore() {
  if [ -d "$source_dir" ]; then
    mkdir -p "$(dirname "$target_dir")"
    rm -rf "$target_dir"
    cp -a "$source_dir" "$target_dir"
    echo "restore: copied '$source_dir' to '$target_dir'."
  else
    echo "restore: source '$source_dir' not found, skipping."
  fi
}

create() {
  rm -rf "$source_dir"
  if [ -d "$target_dir" ]; then
    mkdir -p "$(dirname "$source_dir")"
    cp -a "$target_dir" "$source_dir"
    echo "create: copied '$target_dir' to '$source_dir'."
  else
    echo "create: source '$target_dir' not found, skipping copy."
  fi
}

case "${1:-}" in
restore) restore ;;
create) create ;;
*)
  echo "Usage: $0 {restore|create}"
  exit 1
  ;;
esac
