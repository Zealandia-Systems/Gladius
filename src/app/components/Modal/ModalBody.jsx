import Modal from '@trendmicro/react-modal';
import React, { PureComponent } from 'react';

class ModalHeader extends PureComponent {
    static propTypes = {
        ...Modal.Body.propTypes,
    };

    static defaultProps = {
        ...Modal.Body.defaultProps,
    };

    render() {
        const { padding, children, ...props } = this.props;

        props.style = {
            padding: padding ? '10px' : '0px',
            minHeight: 'unset'
        };

        return (
            <Modal.Body
                {...props}
            >
                {children}
            </Modal.Body>
        );
    }
}

export default ModalHeader;
