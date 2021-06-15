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
    newUpdateAvailable = null
}) => {
    return (
        <Anchor
            className={`navbar-brand ${styles['navbar-brand']}`}
            style={{
                padding: '0px 5px 0px 5px',
                position: 'relative',
                height: 64,
                width: 64
            }}
            href={releases}
            target="_blank"
            title={`${settings.productName} ${settings.version}`}
        >
            <img
                style={{
                    margin: '4px auto 0 auto'
                }}
                src="images/gladius-logo-64x64.png"
                alt=""
            />
            {/*<div
                style={{
                    fontSize: '50%',
                    lineHeight: '14px',
                    textAlign: 'center'
                }}
            >
                {settings.version}
            </div>*/}
            {newUpdateAvailable && (
                <span
                    className="label label-primary"
                    style={{
                        fontSize: '50%',
                        position: 'absolute',
                        top: 2,
                        right: 2
                    }}
                >
                N
                </span>
            )}
        </Anchor>
    );
};
