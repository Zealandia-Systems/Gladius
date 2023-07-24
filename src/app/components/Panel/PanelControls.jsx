import classNames from 'classnames';
import React from 'react';
import styles from './index.styl';

const PanelControls = ({ className, ...props }) => (
    <div
        {...props}
        className={classNames(className, styles.panelControls)}
    />
);

export default PanelControls;
