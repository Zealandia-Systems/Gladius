import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import find from 'lodash/find';
import settings from '../config/settings';
import logger from '../lib/logger';
import taskRunner from '../services/taskrunner';
import { getPagingRange } from './paging';
import {
    ERR_NOT_FOUND,
} from '../constants';

const log = logger('api:probe-cycles');

const getSanitizedRecords = () => {
    const rootPath = settings.probeCycles.path;
    const records = [];

    log.debug(rootPath);

    try {
        const entries = fs.readdirSync(rootPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                log.debug(`checking ${entry.name}`);

                const cyclePath = path.join(rootPath, entry.name);
                const configPath = path.join(cyclePath, 'cycle.json');
                const gcodePath = path.join(cyclePath, 'cycle.gcode');
                const imagePath = path.join(cyclePath, 'cycle.png');
                const thumbnailPath = path.join(cyclePath, 'thumbnail.png');

                try {
                    const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
                    const gcode = fs.readFileSync(gcodePath, { encoding: 'utf8' });

                    const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
                    const imageMimeType = mime.lookup(imagePath);
                    const thumbnailData = fs.readFileSync(thumbnailPath, { encoding: 'base64' });
                    const thumbnailMimeType = mime.lookup(thumbnailPath);

                    records.push({ id: entry.name, path: cyclePath, image: `data:${imageMimeType};base64, ${imageData}`, thumbnail: `data:${thumbnailMimeType};base64, ${thumbnailData}`, ...config, gcode });
                } catch (err) {
                    log.error(err);
                }
            }
        }
    } catch (err) {
        log.error(err);
    }

    return records;
};

export const fetch = (req, res) => {
    const records = getSanitizedRecords();
    const paging = !!req.query.paging;

    if (paging) {
        const { page = 1, pageLength = 10 } = req.query;
        const totalRecords = records.length;
        const [begin, end] = getPagingRange({ page, pageLength, totalRecords });
        const pagedRecords = records.slice(begin, end);

        res.send({
            pagination: {
                page: Number(page),
                pageLength: Number(pageLength),
                totalRecords: Number(totalRecords)
            },
            records: pagedRecords
        });
    } else {
        res.send({
            records: records
        });
    }
};

export const read = (req, res) => {
    const id = req.params.id;
    const records = getSanitizedRecords();
    const record = find(records, { id: id });

    if (!record) {
        res.status(ERR_NOT_FOUND).send({
            msg: 'Not found'
        });
        return;
    }

    const { mtime, enabled, title, commands } = { ...record };
    res.send({ id, mtime, enabled, title, commands });
};

export const run = (req, res) => {
    const id = req.params.id;
    const records = getSanitizedRecords();
    const record = find(records, { id: id });

    if (!record) {
        res.status(ERR_NOT_FOUND).send({
            msg: 'Not found'
        });
        return;
    }

    const title = record.title;
    const commands = record.commands;

    log.info(`run: title="${title}", commands="${commands}"`);

    const taskId = taskRunner.run(commands, title);

    res.send({ taskId: taskId });
};
