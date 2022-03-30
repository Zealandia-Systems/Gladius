import store from '../store';
import { getPagingRange } from './paging';
import {
    ERR_BAD_REQUEST
} from '../constants';

export default (path) => {
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

    const compare = (sortColumn, sortOrder, a, b) => {
        if (a[sortColumn] > b[sortColumn]) {
            return sortOrder === 'asc' ? 1 : -1;
        }

        if (a[sortColumn] < b[sortColumn]) {
            return sortOrder === 'asc' ? -1 : 1;
        }

        return 0;
    };

    const encode = (arg) => {
        if (Array.isArray(arg)) {
            return [...arg.map(e => encode(e))];
        } else if (typeof arg === 'object') {
            let result = {};

            for (const key of Object.keys(arg)) {
                result[key] = encode(arg[key]);
            }

            return result;
        } else if (typeof arg === 'string') {
            return encodeURIComponent(arg);
        } else {
            return arg;
        }
    };

    return {
        fetch: async (req, res) => {
            try {
                const controller = getController(req, res);

                if (!controller) {
                    return;
                }

                const result = await controller.request(`M2000 O1 ?${path}\n`);

                let records = result?.table?.records;

                if (!records) {
                    return;
                }

                const paging = req.query.paging === 'true';
                const sorting = req.query.sorting === 'true';

                let response = {};

                if (sorting) {
                    const { sortColumn = 'index', sortOrder = 'asc' } = req.query;

                    records = records.sort((a, b) => compare(sortColumn, sortOrder, a, b));

                    response = {
                        ...response,
                        sorting: {
                            sortColumn,
                            sortOrder
                        }
                    };
                }

                if (paging) {
                    const { page = 1, pageLength = 10 } = req.query;
                    const totalRecords = records.length;
                    const [begin, end] = getPagingRange({ page, pageLength, totalRecords });

                    records = records.slice(begin, end);

                    response = {
                        ...response,
                        pagination: {
                            page: Number(page),
                            pageLength: Number(pageLength),
                            totalRecords: Number(totalRecords)
                        }
                    };
                }

                res.send({
                    ...response,
                    records
                });
            } catch (err) {
                console.error(err.message);

                res.status(500).send({
                    message: err.message
                });
            }
        },

        create: async (req, res) => {
            const index = Number(req.body.record.index);

            try {
                const controller = getController(req, res);

                if (!controller) {
                    return;
                }

                res.send(await controller.request(`M2000 O0 ?${path}/${index} >${JSON.stringify(encode(req.body.record))}\n`));
            } catch (err) {
                console.error(err.message);

                res.status(500).send({
                    message: err.message
                });
            }
        },

        read: async (req, res) => {
            const index = Number(req.params.id);

            try {
                const controller = getController(req, res);

                if (!controller) {
                    return;
                }

                res.send(await controller.request(`M2000 O1 ?${path}/${index}\n`));
            } catch (err) {
                console.error(err.message);

                res.status(500).send({
                    message: err.message
                });
            }
        },

        update: async (req, res) => {
            const index = Number(req.params.id);

            try {
                const controller = getController(req, res);

                if (!controller) {
                    return;
                }

                res.send(await controller.request(`M2000 O2 ?${path}/${index} >${JSON.stringify(encode(req.body.record))}\n`));
            } catch (err) {
                console.error(err.message);

                res.status(500).send({
                    message: err.message
                });
            }
        },

        __delete: async (req, res) => {
            const index = Number(req.params.id);

            try {
                const controller = getController(req, res);

                if (!controller) {
                    return;
                }

                res.send(await controller.request(`M2000 O3 ?${path}/${index}\n`));
            } catch (err) {
                console.error(err.message);

                res.status(500).send({
                    message: err.message
                });
            }
        }
    };
};
