import React from 'react';
import i18n from 'app/lib/i18n';
import styles from './index.styl';

const HelpContainer = () => {
    return (
        <div className={styles.helpContainer}>
            <button
                type="button"
                className="btn btn-default"
                onClick={() => {
                    const url = 'https://github.com/Zealandia-Systems/Gladius/releases';
                    window.open(url, '_blank');
                }}
            >
                {i18n._('Downloads')}
            </button>
            <button
                type="button"
                className="btn btn-default"
                onClick={() => {
                    const url = 'https://github.com/Zealandia-Systems/Gladius/issues';
                    window.open(url, '_blank');
                }}
            >
                {i18n._('Report an issue')}
            </button>
        </div>
    );
};

export default HelpContainer;
