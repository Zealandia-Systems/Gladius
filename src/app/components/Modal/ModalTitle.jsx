import Modal from '@trendmicro/react-modal';
import React, { PureComponent } from 'react';
import styles from './index.styl';

class ModalTitle extends PureComponent {
    static propTypes = {
        ...Modal.Title.propTypes
    };

    static defaultProps = {
        ...Modal.Title.defaultProps
    };

    render() {
        const { children, ...props } = this.props;

        return (
            <h1
                {...props}
                className={styles.title}
            >
                {children}
            </h1>
        );
    }
}

export default ModalTitle;
