import PropTypes from 'prop-types';
import React from 'react';
import ModalTemplate from 'app/components/ModalTemplate';
import Modal from 'app/components/Modal';
import { Button } from 'react-bootstrap';
import i18n from 'app/lib/i18n';

const SoftwareUpdates = (props) => (
    <Modal
        size="xs"
        disableOverlay={true}
        showCloseButton={false}
    >
        <Modal.Body>
            <ModalTemplate type="warning">
                <h5>{props.title}</h5>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Software</th>
                            <th scope="col">Current</th>
                            <th scope="col">Latest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.versions.map((version, index) => {
                            return (
                                <tr>
                                    <td>{version.name}</td>
                                    <td>{version.current}</td>
                                    <a target="_blank" href={version.link}><td>{version.new}</td></a>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </ModalTemplate>
        </Modal.Body>
        <Modal.Footer>
            <input
                type="checkbox"
                checked={ props.checked }
                onchange={ () => { props.checked = !props.checked; } }
            />

            <Button
                onClick={chainedFunction(
                    () => {
                        this.setState(workspace.updateNotifications.showUpdates, props.checked);
                    },
                    props.onClose
                )}
            >
                {i18n._('Continue')}
            </Button>
        </Modal.Footer>
    </Modal>
);

SoftwareUpdates.propTypes = {
    onClose: PropTypes.func,
    title: PropTypes.string,
    versions: PropTypes.array,
    checked: PropTypes.bool
};

export default SoftwareUpdates;
