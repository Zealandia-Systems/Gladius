/* eslint-disable no-await-in-loop */
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execSync } from 'child_process';
import regeditSync from 'regedit';
import wmicSync from 'wmic';
import logger from '../lib/logger';
import Installer from '../lib/installer';

import {
    ERR_BAD_REQUEST,
    ERR_INTERNAL_SERVER_ERROR
} from '../constants';

const regedit = {
    list: promisify(regeditSync.list)
};

const wmic = {
    get_value: promisify(wmicSync.get_value)
};

const execAsync = promisify(execSync);

function exec(command, args = []) {
    return new Promise((resolve, reject) => {
        execAsync(
            `"${command}" ${args.join(' ')}`,
            {
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
}

const log = logger('api:posts');

const getInstalledPostVersion = async (application, postPath) => {
    try {
        log.info(`Checking for existance of ${application} post at '${postPath}'.`);

        const stat = await fs.stat(postPath);

        if (!stat.isFile()) {
            log.info(`Swordfish post for ${application} not found.`);

            return null;
        }

        const data = await fs.readFile(postPath, { encoding: 'utf8' });

        const versionRe = new RegExp('version = \"([0-9\.]+)\";');
        const versionMatch = data.match(versionRe);


        return versionMatch ? versionMatch[1] : 'unknown';
    } catch (err) {
        log.warn(err);
    }

    return 'unknown';
};

const getPostVersion = async (application, post) => {
    try {
        const postPath = path.join(process.cwd(), post);

        log.info(`Getting version of latest post for ${application} at ${postPath}`);

        const stat = await fs.stat(postPath);

        if (!stat.isFile()) {
            log.info(`Latest post for ${application} not found.`);

            return null;
        }

        const data = await fs.readFile(postPath, { encoding: 'utf8' });

        const versionRe = new RegExp('version = \"([0-9\.]+)\";');
        const versionMatch = data.match(versionRe);

        return versionMatch ? versionMatch[1] : 'unknown';
    } catch (err) {
        log.warn(err);
    }

    return 'unknown';
};

async function getMinimumPostProcessorVersion(post) {
    const postPath = path.join(process.cwd(), post);

    const stat = await fs.stat(postPath);

    if (!stat.isFile()) {
        return null;
    }

    const data = await fs.readFile(postPath, { encoding: 'utf8' });

    const mininumRevisionRe = new RegExp('minimumRevision = ([0-9]+);');
    const minimumRevisionMatch = data.match(mininumRevisionRe);

    return minimumRevisionMatch ? minimumRevisionMatch[1] : 'unknown';
}

async function getFusion360Version(rootPath, folder) {
    try {
        const candidatePath = path.join(rootPath, folder.name, 'Fusion360.exe');
        const stat = await fs.stat(candidatePath);

        if (!stat.isFile()) {
            return null;
        }

        const version = await wmic.get_value('datafile', 'version', `name='${candidatePath.replace(/\\/g, '\\\\')}'`);

        const parts = version.split('.');

        return [parts[1], parts[2], parts[0]].join('.');
    } catch (err) {
        log.warn(err);
    }

    return null;
}

async function getAutodeskCAM360Version(postProcessorPath) {
    const { error, stdout } = await exec(postProcessorPath, ['--version']);

    if (error) {
        throw error;
    }

    const re = new RegExp('^([A-Za-z0-9]+(?: +[A-Za-z0-9]+)*) ([1-9]\.[0-9]+)');

    const match = stdout.match(re);

    if (!match) {
        throw new Error('Couldn\'t determine post processor version.');
    }

    return [match[1], match[2].replace(/\./g, '')];
}

async function* getFusion360Installs(minimumPostProcessorVersion) {
    const post = 'Swordfish.cps';

    try {
        let rootPath = path.join(process.env.LOCALAPPDATA, 'Autodesk', 'webdeploy', 'production');

        let stat = await fs.stat(rootPath);

        if (!stat.isDirectory()) {
            return;
        }

        const folders = await fs.readdir(rootPath, { encoding: 'utf8', withFileTypes: true });

        const statPromises = [];

        for (const folder of folders) {
            statPromises.push(getFusion360Version(rootPath, folder));
        }

        const versions = await Promise.all(statPromises);

        const application = 'Fusion 360';

        for (const [index, version] of versions.entries()) {
            if (version) {
                const postPath = path.join(process.env.APPDATA, 'Autodesk', 'Fusion 360 CAM', 'Posts', 'Swordfish.cps');
                const postProcessorPath = path.join(process.env.LOCALAPPDATA, 'Autodesk', 'webdeploy', 'production', folders[index].name, 'Applications', 'CAM360', 'post.exe');

                const [postProcessor, postProcessorVersion] = await getAutodeskCAM360Version(postProcessorPath);

                yield {
                    company: 'Autodesk',
                    application,
                    applicationVersion: version,
                    applicationPath: path.join(rootPath, folders[index].name),
                    postProcessor,
                    postProcessorPath,
                    postProcessorVersion,
                    post,
                    postPath,
                    postVersion: await getPostVersion(application, post),
                    installedPostVersion: await getInstalledPostVersion(application, postPath),
                    minimumPostProcessorVersion: await getMinimumPostProcessorVersion(post)
                };
            }
        }
    } catch (err) {
        log.warn(err);
    }
}

async function getFusion360Install(minimumPostProcessorVersion) {
    const installs = [];

    for await (const install of getFusion360Installs(minimumPostProcessorVersion)) {
        installs.push(install);
    }

    return installs.reduce((prev, current) => {
        return (prev.version > current.version) ? prev : current;
    });
}

async function* getVectricInstalls() {
    const { 'HKCU\\SOFTWARE\\Vectric': { exists, keys } } = await regedit.list('HKCU\\SOFTWARE\\Vectric');
    const post = 'Swordfish.pp';

    if (!exists) {
        return;
    }

    const requests = [];

    for (const key of keys) {
        requests.push(regedit.list(`HKCU\\SOFTWARE\\Vectric\\${key}`));
    }

    const apps = (await Promise.all(requests)).map((app, i) => {
        return { key: keys[i], app: app[`HKCU\\SOFTWARE\\Vectric\\${keys[i]}`] };
    });

    for (const { key, app } of apps) {
        const { exists: appExists, keys: appKeys, values: appValues } = app;

        if (!appExists) {
            return;
        }

        if (appValues.postPath) {
            const postPath = path.join(appValues.postPath.value, post);

            yield {
                company: 'Vectric',
                application: key,
                applicationVersion: appKeys[0],
                applicationPath: appValues.InstallDir.value,
                post,
                postPath,
                postVersion: await getPostVersion(key, post),
                installedPostVersion: await getInstalledPostVersion(key, postPath)
            };
        }
    }
}

async function getHSMWorksVersion(installFolder) {
    try {
        const candidatePath = path.join(installFolder, 'HSMWorks.exe');
        const stat = await fs.stat(candidatePath);

        if (!stat.isFile()) {
            return null;
        }

        const version = await wmic.get_value('datafile', 'version', `name='${candidatePath.replace(/\\/g, '\\\\')}'`);

        return version;
    } catch (err) {
        log.warn(err);
    }

    return null;
}

async function getHSMWorksInstall() {
    const post = 'Swordfish.cps';

    const { 'HKCU\\SOFTWARE\\HSMWorks\\HSMWorks': { exists, values } } = await regedit.list('HKCU\\SOFTWARE\\HSMWorks\\HSMWorks');

    if (!exists) {
        return null;
    }

    if (values['installation folder']) {
        const installFolder = values['installation folder'].value;
        const postPath = path.join(installFolder, 'posts', 'Swordfish.cps');

        const postProcessorPath = path.join(installFolder, 'post.exe');

        const [postProcessor, postProcessorVersion] = await getAutodeskCAM360Version(postProcessorPath);

        return {
            company: 'Autodesk',
            application: 'HSMWorks',
            applicationVersion: await getHSMWorksVersion(installFolder),
            applicationPath: installFolder,
            postProcessor,
            postProcessorPath,
            postProcessorVersion,
            post,
            postPath,
            postVersion: await getPostVersion('HSMWorks', post),
            installedPostVersion: await getInstalledPostVersion('HSMWorks', postPath),
            minimumPostProcessorVersion: await getMinimumPostProcessorVersion(post)
        };
    }

    return null;
}

async function* getSupportedInstalls() {
    for await (const install of getVectricInstalls()) {
        yield install;
    }

    const fusion360Install = await getFusion360Install();

    if (fusion360Install) {
        yield fusion360Install;
    }

    const hsmWorksInstall = await getHSMWorksInstall();

    if (hsmWorksInstall) {
        yield hsmWorksInstall;
    }
}

export const get = async (req, res) => {
    const installs = [];

    for await (const install of getSupportedInstalls()) {
        installs.push(install);
    }

    installs.sort((a, b) => {
        if (a.application === b.application) {
            return a.applicationVersion > b.applicationVersion ? 1 : -1;
        }

        return a.application > b.application ? 1 : -1;
    });

    console.log(JSON.stringify(installs));
    res.send(
        installs
    );
};

export const install = async (req, res) => {
    try {
        const { application, applicationVersion } = req.body;
        let found = false;

        for await (const install of getSupportedInstalls()) {
            if (install.application === application && install.applicationVersion === applicationVersion) {
                const sourcePath = path.join(process.cwd(), install.post);
                const postFolder = path.dirname(install.postPath);

                await new Installer()
                    .mkdir(postFolder)
                    .copy(sourcePath, install.postPath)
                    .run();

                await get(req, res);

                found = true;

                break;
            }
        }

        if (!found) {
            res.status(ERR_BAD_REQUEST).send({
                msg: 'Application not found'
            });
        }
    } catch (err) {
        log.error(err);

        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: err
        });
    }
};
