import classNames from 'classnames';
import React from 'react';
import styles from './index.styl';

const PanelTitle = ({ className, ...props }) => (
    <div
        {...props}
        className={classNames(className, styles.panelTitle)}
    />
);

export default PanelTitle;
