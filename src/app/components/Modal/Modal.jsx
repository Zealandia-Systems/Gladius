import '@trendmicro/react-modal/dist/react-modal.css';
import Modal from '@trendmicro/react-modal';
import chainedFunction from 'chained-function';
import React, { PureComponent } from 'react';
import styles from './index.styl';

class ModalWrapper extends PureComponent {
    static propTypes = {
        ...Modal.propTypes
    };

    static defaultProps = {
        ...Modal.defaultProps
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.show !== this.props.show) {
            if (nextProps.show) {
                this.blockScrolling();
            } else {
                this.unblockScrolling();
            }
        }
    }

    componentDidMount() {
        this.blockScrolling();
    }

    componentWillUnmount() {
        this.unblockScrolling();
    }

    blockScrolling() {
        const body = document.querySelector('body');
        body.style.overflowY = 'hidden';
    }

    unblockScrolling() {
        const body = document.querySelector('body');
        body.style.overflowY = 'auto';
    }

    render() {
        const { onClose, children, ...props } = this.props;

        return (
            <Modal
                {...props}
                showCloseButton={false}
                onClose={chainedFunction(onClose, this.unblockScrolling)}
                className={styles.content}
            >
                {React.Children.map(children, child => {
                    if (child.props.__TYPE === 'ModalHeader') {
                        return React.cloneElement(child,
                            { onClose }, child.props.children);
                    } else {
                        return React.cloneElement(child, null, child.props.children);
                    }
                })}
            </Modal>
        );
    }
}

export default ModalWrapper;
