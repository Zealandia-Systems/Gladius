import request from 'superagent';
import {
    ERR_INTERNAL_SERVER_ERROR
} from '../constants';

export const getLatestGladiusVersion = (req, res) => {
    const releaseUrl = 'https://api.github.com/repos/Zealandia-Systems/Gladius/releases/latest';

    request
        .get(releaseUrl)
        .end((err, _res) => {
            if (err) {
                res.status(ERR_INTERNAL_SERVER_ERROR).send({
                    msg: `Failed to connect to ${releaseUrl}: code=${err.code}`
                });
                return;
            }

            res.send({
                time: _res.body.published_at,
                name: _res.body.tag_name,
                version: _res.body.tag_name,
                description: _res.body.body,
                homepage: _res.body.url
            });
        });
};

export const getLatestSwordFishVersion = (req, res) => {
    const releaseUrl = 'https://api.github.com/repos/Zealandia-Systems/Swordfish/releases/latest';

    request
        .get(releaseUrl)
        .end((err, _res) => {
            if (err) {
                res.status(ERR_INTERNAL_SERVER_ERROR).send({
                    msg: `Failed to connect to ${releaseUrl}: code=${err.code}`
                });
                return;
            }

            res.send({
                time: _res.body.published_at,
                name: _res.body.tag_name,
                version: _res.body.tag_name,
                description: _res.body.body,
                homepage: _res.body.url
            });
        });
};
