#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

/* eslint max-len: 0 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const findImports = require('find-imports');
const variableReplacerSync = require('variable-replacer');
const rimraf = require('rimraf');
const execFileSync = require('child_process').execFile;
const { promisify } = require('util');

const execFile = promisify(execFileSync);
const variableReplacer = promisify(variableReplacerSync);

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

const getDirectories = source =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

//rimraf.sync('dist');
//rimraf.sync('output');

fs.mkdirSync('dist/gladius/server', { recursive: true });
fs.mkdirSync('output/server', { recursive: true });

(async () => {
    const postsPath = path.join(__dirname, '..', 'posts');

    for (const name of getDirectories(postsPath)) {
        const postDir = path.join(postsPath, name);

        console.log(`Updating post ${name}`);

        await execFile('git', ['-C', postDir, 'pull']);

        const { stdout } = await execFile('git', ['-C', postDir, 'config', '--get', 'remote.origin.url']);

        const homepage = stdout.trim();

        const postPkg = require(path.join(postsPath, name, 'package.json'));
        const postPath = path.join(postDir, postPkg['zealandia.systems'].post);
        const version = postPkg.version;

        await variableReplacer({
            source: postPath,
            dest: 'dist/gladius/server/',
            inlineData: {
                version,
                homepage
            }
        });

        await variableReplacer({
            source: postPath,
            dest: 'output/server/',
            inlineData: {
                version,
                homepage
            }
        });
    }
})();
