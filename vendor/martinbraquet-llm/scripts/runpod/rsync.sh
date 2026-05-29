#!/bin/bash

set -e

IP=204.15.42.29

folders=( "llm" "demo" "scripts/runpod" "pyproject.toml" )

for folder in "${folders[@]}"; do
  rsync -rvz -e 'ssh -o StrictHostKeyChecking=no -p 29111 -i ~/.ssh/runpod' --progress --exclude '*.pt' --exclude '__pycache__*' ../../$folder root@$IP:/workspace
done
