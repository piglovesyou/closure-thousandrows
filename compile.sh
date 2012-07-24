#!/bin/bash
./closure-library-read-only/closure/bin/build/closurebuilder.py \
  --root=./closure-library-read-only/ \
  --root=./piglovesyou/goog/ \
  --root=./third_party/ \
  --root=./tmp/ \
  --namespace="my.app" \
  --output_mode=compiled \
  --compiler_jar=./closure-compiler/compiler.jar \
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS"  \
  --output_file=./tmp/min.js
