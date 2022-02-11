/* eslint-disable no-await-in-loop */
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';
import regeditSync from 'regedit';
import wmicSync from 'wmic';
import logger from '../lib/logger';

import {
    ERR_BAD_REQUEST,
    ERR_INTERNAL_SERVER_ERROR
} from '../constants';

//const fs = promises;

const regedit = {
    list: util.promisify(regeditSync.list)
};

const wmic = {
    get_value: util.promisify(wmicSync.get_value)
};

const log = logger('api:posts');

const getPostProcessorVersion = async (application, postProcessorPath) => {
    try {
        log.info(`Checking for existance of ${application} post processors at '${postProcessorPath}'.`);

        const stat = await fs.stat(postProcessorPath);

        if (!stat.isFile()) {
            log.info(`Swordfish post processor for ${application} not found.`);

            return null;
        }

        const re = new RegExp('version = \"([0-9\.]+)\";');

        const data = await fs.readFile(postProcessorPath, { encoding: 'utf8' });
        const match = data.match(re);

        return match ? match[1] : 'unknown';
    } catch (err) {
        log.warn(err);
    }

    return null;
};

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

async function* getFusion360Installs() {
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
                const postProcessorPath = path.join(process.env.APPDATA, 'Autodesk', 'Fusion 360 CAM', 'Posts', 'Swordfish.cps');

                yield {
                    company: 'Autodesk',
                    application,
                    applicationVersion: version,
                    applicationPath: path.join(rootPath, folders[index].name),
                    postProcessor: 'Swordfish.cps',
                    postProcessorPath,
                    postProcessorVersion: await getPostProcessorVersion(application, postProcessorPath),
                };
            }
        }
    } catch (err) {
        log.warn(err);
    }
}

async function getFusion360Install() {
    const installs = [];

    for await (const install of getFusion360Installs()) {
        installs.push(install);
    }

    return installs.reduce((prev, current) => {
        return (prev.version > current.version) ? prev : current;
    });
}

async function* getVectricInstalls() {
    const { 'HKCU\\SOFTWARE\\Vectric': { exists, keys } } = await regedit.list('HKCU\\SOFTWARE\\Vectric');

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

        if (appValues.PostProcessorPath) {
            const postProcessorPath = path.join(appValues.PostProcessorPath.value, 'Swordfish.pp');

            yield {
                company: 'Vectric',
                application: key,
                applicationVersion: appKeys[0],
                applicationPath: appValues.InstallDir.value,
                postProcessor: 'Swordfish.pp',
                postProcessorPath,
                postProcessorVersion: await getPostProcessorVersion(key, postProcessorPath)
            };
        }
    }
}

async function* getSupportedInstalls() {
    for await (const install of getVectricInstalls()) {
        yield install;
    }

    const fusion360Install = await getFusion360Install();

    if (fusion360Install) {
        yield fusion360Install;
    }
}

export const get = async (req, res) => {
    const installs = [];

    for await (const install of getSupportedInstalls()) {
        log.silly(install);

        installs.push(install);
    }

    installs.sort((a, b) => {
        if (a.application === b.application) {
            return a.applicationVersion > b.applicationVersion ? 1 : -1;
        }

        return a.application > b.application ? 1 : -1;
    });

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
                const source = path.join(process.cwd(), install.postProcessor);
                const postProcessorFolder = path.dirname(install.postProcessorPath);

                await fs.mkdir(postProcessorFolder, { recursive: true });
                await fs.copyFile(source, install.postProcessorPath);

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
