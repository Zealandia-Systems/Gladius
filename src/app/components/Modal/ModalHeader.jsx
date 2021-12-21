import PropTypes from 'prop-types';
import Modal from '@trendmicro/react-modal';
import React, { PureComponent } from 'react';
import styles from './index.styl';

class ModalHeader extends PureComponent {
    static propTypes = {
        ...Modal.Header.propTypes,
        onClose: PropTypes.func,
        __TYPE: PropTypes.string
    };

    static defaultProps = {
        ...Modal.Header.defaultProps,
        __TYPE: 'ModalHeader',
    };

    constructor(props) {
        super(props);

        this.handleClose = null;
    }

    render() {
        const { onClose, children } = this.props;

        return (
            <div
                className={styles.header}
            >
                {children}
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    <i className="fa fa-times fa-2x" />
                </button>
            </div>
        );
    }
}

export default ModalHeader;
