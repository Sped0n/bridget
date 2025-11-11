#!/usr/bin/env bash
set -euo pipefail

node_modules_generated_dir="./node_modules/exampleSite/resources/_gen"
project_generated_dir="./exampleSite/resources/_gen"

copy_generated_assets_to_project() {
  if [ -d "${node_modules_generated_dir}" ]; then
    rm -rf "${project_generated_dir}"
    mkdir -p "${project_generated_dir}"
    cp -a "${node_modules_generated_dir}/." "${project_generated_dir}"
    echo "Copied '${node_modules_generated_dir}' to '${project_generated_dir}'."
  else
    echo "Source '${node_modules_generated_dir}' not found, skipping copy to project."
  fi
}

run_site_build() {
  pnpm run vite:build && hugo --logLevel info --source=exampleSite --gc --minify
}

copy_generated_assets_to_node_modules() {
  rm -rf "${node_modules_generated_dir}"
  if [ -d "${project_generated_dir}" ]; then
    mkdir -p "${node_modules_generated_dir}"
    cp -a "${project_generated_dir}/." "${node_modules_generated_dir}"
    echo "Copied '${project_generated_dir}' back to '${node_modules_generated_dir}'."
  else
    echo "Source '${project_generated_dir}' not found, skipping copy to node_modules."
  fi
}

copy_generated_assets_to_project
run_site_build
copy_generated_assets_to_node_modules
