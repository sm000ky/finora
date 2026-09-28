#!/bin/bash
set -e
cd /root/finora
taskset -c 0,1 ./node_modules/vite/bin/vite.js build
