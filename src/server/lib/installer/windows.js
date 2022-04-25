import { promises as fs } from 'fs';
import { promisify } from 'util';
import { exec as execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const exec = promisify(execSync);

export default class Installer {
    #uuid;

    #commands = [];

    #env = {};

    constructor(env) {
        this.#uuid = uuid();
        this.#env = env ?? this.#env;
    }

    mkdir = (path) => {
        this.#commands.push(`mkdir "${path}"`);

        return this;
    }

    copy = (sources, destination) => {
        if (typeof sources === 'string') {
            sources = [sources];
        }

        this.#commands.push(`copy ${sources.map(p => `"${p}"`).join(' ')} "${destination}"`);

        return this;
    };

    run = async () => {
        const script = [
            //'@echo off',
            'setlocal enableextensions',
            'chcp 65001 > nul'
        ];

        for (const key in this.#env) {
            if (Object.hasOwnProperty.apply(this.#env, key)) {
                const value = this.#env[key];

                script.push(`set ${key} = ${value.replace(/([<>\\|&^])/g, '^$1')}`);
            }
        }

        script.push(...this.#commands);
        script.push('endlocal');

        const tmpFolder = await fs.mkdtemp(path.join(os.tmpdir(), `gladius-${this.#uuid}`));
        const installScriptPath = path.join(tmpFolder, 'install.bat');

        await fs.writeFile(installScriptPath, script.join('\r\n'), 'utf-8');
        /*await fs.writeFile(path.join(tmpFolder, 'execute.bat'), [
            'call install.bat > stdout.txt 2> stderr.txt',
            '(echo %ERRORLEVEL%) > error.txt'
        ].join('\r\n'), 'utf-8');*/

        const { error, stdout, stderr } = await new Promise((resolve, reject) => {
            exec(
                `powershell.exe Start-Process -FilePath "${installScriptPath}" -WindowStyle hidden -Verb runas`,
                {
                    env: this.#env,
                    encoding: 'utf-8',
                    windowsHide: true
                },
                (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ error, stdout, stderr });
                    }
                }
            );
        });

        console.log(error);
        console.log(stdout);
        console.log(stderr);
    }
}
