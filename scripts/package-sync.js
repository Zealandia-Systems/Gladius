#!/usr/bin/env node

/* eslint max-len: 0 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const findImports = require('find-imports');
const variableReplacer = require('variable-replacer');
const rimraf = require('rimraf');

// Copy necessary properties from 'package.json' to 'src/package.json'
const pkg = require('../package.json');
const pkgApp = require('../src/package.json');

const files = [
    'src/*.js',
    'src/server/**/*.{js,jsx}'
];
const deps = [
    '@babel/runtime', // 'babel-runtime' is required for electron app
    'debug' // 'debug' is required for electron app
].concat(findImports(files, { flatten: true })).sort();

//pkgApp.name = pkg.name; // Exclude the name field
pkgApp.version = pkg.version;
pkgApp.homepage = pkg.homepage;
pkgApp.author = pkg.author;
pkgApp.license = pkg.license;
pkgApp.repository = pkg.repository;

// Copy only Node.js dependencies to application package.json
pkgApp.dependencies = _.pick(pkg.dependencies, deps);

const target = path.resolve(__dirname, '../src/package.json');
const content = JSON.stringify(pkgApp, null, 2);
fs.writeFileSync(target, content + '\n', 'utf8');

rimraf.sync('dist');

fs.mkdirSync('dist/gladius/server', { recursive: true} );

variableReplacer({
    source: ['Swordfish.cps', 'Swordfish.pp'],
    dest: 'dist/gladius/server/',
    inlineData: {
        version : pkg.version,
        homepage : pkg.homepage
    }
});

rimraf.sync('output');

fs.mkdirSync('output/server', { recursive: true });

variableReplacer({
    source: ['Swordfish.cps', 'Swordfish.pp'],
    dest: 'output/server/',
    inlineData: {
        version : pkg.version,
        homepage : pkg.homepage
    }
});
