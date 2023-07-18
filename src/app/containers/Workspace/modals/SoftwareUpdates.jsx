import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ModalTemplate from 'app/components/ModalTemplate';
import Modal from 'app/components/Modal';
import { Button } from 'react-bootstrap';
import i18n from 'app/lib/i18n';

class SoftwareUpdates extends PureComponent {
    state = {
        checked: true
    };

    render() {
        const { versions, title, onClose } = this.props;
        const { checked } = this.state;

        return (
            <Modal
                size="xs"
                disableOverlay={true}
                showCloseButton={false}
            >
                <Modal.Body>
                    <ModalTemplate type="warning">
                        <h5>{title}</h5>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Software</th>
                                    <th scope="col">Current</th>
                                    <th scope="col">Latest</th>
                                </tr>
                            </thead>
                            <tbody>
                                {versions.map((version, index) => {
                                    return (
                                        <tr>
                                            <td>{version.name}</td>
                                            <td>{version.current}</td>
                                            <td><a target="_blank" href={version.link}>{version.new}</a></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </ModalTemplate>
                </Modal.Body>
                <Modal.Footer>
                    <label>Do not show this update again: </label>
                    <input
                        type="checkbox"
                        checked={ !checked }
                        onChange={ () => {
                            this.setState({ checked: !checked });
                        } }
                    />

                    <Button
                        onClick={
                            () => {
                                onClose(checked, versions[0].new);
                            }
                        }
                    >
                        {i18n._('Continue')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

SoftwareUpdates.propTypes = {
    onClose: PropTypes.func,
    title: PropTypes.string,
    versions: PropTypes.array,
    checked: PropTypes.bool
};

export default SoftwareUpdates;
