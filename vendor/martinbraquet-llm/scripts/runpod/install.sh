#!/bin/bash

set -e

IP=18b0wvoqrdxhyb-64410f4a@ssh.runpod.io

ssh -tt $IP -i ~/.ssh/runpod << EOF
  set -e
  apt update
  apt install -y rsync
  exit
EOF

cd $(dirname "$0")
./rsync.sh

ssh -tt $IP -i ~/.ssh/runpod << EOF
  cd workspace
  pip install -e .
  exit
EOF