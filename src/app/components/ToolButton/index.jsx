import React from 'react';
import cx from 'classnames';
import styles from './index.styl';


const ToolButton = ({ className, icon = 'fas fa-info', children, ...props }) => {
    return (
        <button className={cx(styles.toolButton, className)} {...props}>
            <div className={styles.toolButtonIcon}>
                <i className={icon} />
            </div>
            <div className={styles.toolButtonContent}>
                {children}
            </div>
        </button>
    );
};

export default ToolButton;
