import React from 'react';
import ReactDOM from 'react-dom';
import Settings from './Settings';

// @param {string} targetContainer The target container: primary|secondary
export const show = (port, callback) => {
    const el = document.body.appendChild(document.createElement('div'));
    const handleClose = (e) => {
        ReactDOM.unmountComponentAtNode(el);
        setTimeout(() => {
            el.remove();
        }, 0);
    };

    ReactDOM.render(
        <Settings port={port} onSave={callback} onClose={handleClose} />,
        el
    );
};
