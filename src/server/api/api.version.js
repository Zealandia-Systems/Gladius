import url from 'url';
import registryUrl from 'registry-url';
//import registryAuthToken from 'registry-auth-token';
import request from 'superagent';
import {
    ERR_INTERNAL_SERVER_ERROR
} from '../constants';

const pkgName = '@zealandia-systems/gladius';

export const getLatestVersion = async (req, res) => {
    const scope = pkgName.split('/')[0];
    const regUrl = registryUrl(scope);
    const pkgUrl = url.resolve(regUrl, encodeURIComponent(pkgName).replace(/^%40/, '@'));
    //const authInfo = registryAuthToken(regUrl);
    const headers = {};

    const result = await request.get('https://api.github.com/repos/Zealandia-Systems/Gladius/releases/latest');

    console.log(JSON.stringify(result));

    request
        .get(pkgUrl)
        .set(headers)
        .end((err, _res) => {
            if (err) {
                res.status(ERR_INTERNAL_SERVER_ERROR).send({
                    msg: `Failed to connect to ${pkgUrl}: code=${err.code}`
                });
                return;
            }

            const { body: data = {} } = { ..._res };
            data.time = data.time || {};
            data['dist-tags'] = data['dist-tags'] || {};
            data.versions = data.versions || {};

            const time = data.time[latest];
            const latest = data['dist-tags'].latest;
            const {
                name,
                version,
                description,
                homepage
            } = { ...data.versions[latest] };

            res.send({ time, name, version, description, homepage });
        });
};
