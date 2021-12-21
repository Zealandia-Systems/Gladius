import find from 'lodash/find';
import uuid from 'uuid';
import store from '../store';
import settings from '../config/settings';
import { getPagingRange } from './paging';
import {
    ERR_BAD_REQUEST,
    ERR_NOT_FOUND,
    ERR_INTERNAL_SERVER_ERROR,
} from '../constants';
import { getMacros, setMacros } from '../services/macros';

const getController = (req, res) => {
    const port = req.query.port ? req.query.port : req.body.port;

    if (!port) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'No port specified'
        });

        return null;
    }

    const controller = store.get('controllers["' + port + '"]');

    if (!controller) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'Controller not found'
        });

        return null;
    }

    return controller;
};

export const fetch = (req, res) => {
    const controller = getController(req, res);

    if (!controller) {
        return;
    }

    const records = getMacros(controller);
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
                totalRecords: Number(totalRecords),
            },
            records: pagedRecords.map((record) => {
                const { id, mtime, name, content } = { ...record };
                return { id, mtime, name, content };
            }),
        });
    } else {
        res.send({
            records: records.map((record) => {
                const { id, mtime, name, content } = { ...record };
                return { id, mtime, name, content };
            }),
        });
    }
};

export const create = (req, res) => {
    const { name, content } = { ...req.body };

    if (!name) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "name" parameter must not be empty',
        });
        return;
    }

    if (!content) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "content" parameter must not be empty',
        });
        return;
    }

    try {
        const controller = getController(req, res);

        if (!controller) {
            return;
        }

        const records = getMacros(controller);
        const record = {
            id: uuid.v4(),
            mtime: new Date().getTime(),
            name: name,
            content: content,
        };

        records.push(record);
        setMacros(records);

        res.send({ err: null });
    } catch (err) {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
        });
    }
};

export const read = (req, res) => {
    const id = req.params.id;
    const controller = getController(req, res);

    if (!controller) {
        return;
    }

    const records = getMacros(controller);
    const record = find(records, { id: id });

    if (!record) {
        res.status(ERR_NOT_FOUND).send({
            msg: 'Not found',
        });
        return;
    }

    const { mtime, name, content } = { ...record };
    res.send({ id, mtime, name, content });
};

export const update = (req, res) => {
    const id = req.params.id;
    const controller = getController(req, res);

    if (!controller) {
        return;
    }

    const records = getMacros(controller);
    const record = find(records, { id: id });

    if (!record) {
        res.status(ERR_NOT_FOUND).send({
            msg: 'Not found',
        });
        return;
    }

    const { name = record.name, content = record.content } = { ...req.body };

    /*
    if (!name) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "name" parameter must not be empty'
        });
        return;
    }

    if (!content) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "content" parameter must not be empty'
        });
        return;
    }
    */

    try {
        record.mtime = new Date().getTime();
        record.name = String(name || '');
        record.content = String(content || '');

        setMacros(records);

        res.send({ err: null });
    } catch (err) {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
        });
    }
};

export const __delete = (req, res) => {
    const id = req.params.id;
    const controller = getController(req, res);

    if (!controller) {
        return;
    }

    const records = getMacros(controller);

    try {
        let found = false;

        const filteredRecords = records.filter((record) => {
            if (record.id === id) {
                found = true;

                return false;
            }

            return true;
        });

        if (!found) {
            res.status(ERR_NOT_FOUND).send({
                msg: 'Not found',
            });
            return;
        }

        setMacros(filteredRecords);

        res.send({ err: null });
    } catch (err) {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
        });
    }
};
