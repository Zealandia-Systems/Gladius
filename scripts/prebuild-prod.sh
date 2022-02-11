#!/bin/bash

pushd src
mkdir -p ../dist/gladius/
cp -af package.json ../dist/gladius/
cross-env NODE_ENV=production babel "*.js" \
    --config-file ../babel.config.js \
    --out-dir ../dist/gladius
cross-env NODE_ENV=production babel "electron-app/**/*.js" \
    --config-file ../babel.config.js \
    --out-dir ../dist/gladius/electron-app
popd
