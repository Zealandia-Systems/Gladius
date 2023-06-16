import classNames from 'classnames';
import React from 'react';
import Anchor from 'app/components/Anchor';
import styles from './index.styl';

const releases = 'https://github.com/Zealandia-Systems/Gladius/releases';

export default ({
    children = [],
    to = null,
    className = null,
    placement = null,
    positionLeft = null,
    positionTop = null,
    arrowOffsetLeft = null,
    arrowOffsetTop = null,
    settings = null,
    newUpdateAvailable = null,
    newSwordfishUpdateAvailable = null
}) => {
    return (
        <Anchor
            style={{
                //padding: '5px 5px 5px 5px',
                //float: 'left',
                display: 'block',
                padding: '0px',
                margin: '0px'
            }}
            href={releases}
            target="_blank"
            title={`${settings.productName} ${settings.version}`}
        >
            <img
                style={{
                    margin: '3px'
                }}
                src="images/gladius-logo-64x64.png"
                alt=""
            />
            <div
                className={classNames({
                    [styles.logoVersion]: true,
                    [styles.pulse]: newUpdateAvailable
                })}
            >
                {settings.version}
            </div>
            <div
                className={classNames({
                    [styles.logoTitle]: true,
                    [styles.pulse]: newUpdateAvailable
                })}
            >
                {settings.productName}
            </div>
            <div
                className={classNames({
                    [styles.logoTitle]: true,
                    [styles.pulse]: newSwordfishUpdateAvailable
                })}
            >
                {newSwordfishUpdateAvailable}
            </div>
        </Anchor>
    );
};
