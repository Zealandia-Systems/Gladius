import PropTypes from 'prop-types';
import React from 'react';
import store from 'app/store';
import Modal from 'app/components/Modal';
import { Button } from 'react-bootstrap';
import ModalTemplate from 'app/components/ModalTemplate';
import i18n from 'app/lib/i18n';
import * as settings from 'app/containers/Settings';

const OutdatedPosts = ({ port, posts, outdated, onClose }) => (
    <Modal
        size="xs"
        disableOverlay={true}
        showCloseButton={false}
    >
        <Modal.Body>
            <ModalTemplate type="warning">
                <h5>{outdated.length > 1 ? i18n._('Some post processors are out of date.') : i18n._('A post processor is out of date.')}</h5>
                <p>{i18n._('One or more of your post processors is out of date and requires updating. Outdated post processors will not be supported unless explicitly recommended.')}</p>
            </ModalTemplate>
        </Modal.Body>
        <Modal.Footer>
            <Button
                bsStyle="danger"
                onClick={() => {
                    const ignore = posts.reduce((prev, current) => {
                        const { application, applicationVersion } = current;

                        const id = `${application}:${applicationVersion}`;

                        return { [id]: true, ...prev };
                    }, {});

                    store.set('containers.settings.posts.ignore', ignore);

                    onClose();
                }}
            >
                {i18n._('Ignore')}
            </Button>
            <Button
                bsStyle="primary"
                onClick={() => {
                    settings.show(port, 'posts');

                    onClose();
                }}
            >
                {i18n._('Go to Settings')}
            </Button>
        </Modal.Footer>
    </Modal>
);

OutdatedPosts.propTypes = {
    port: PropTypes.string,
    posts: PropTypes.arrayOf(PropTypes.object),
    outdated: PropTypes.arrayOf(PropTypes.object),
    onClose: PropTypes.func
};

export default OutdatedPosts;
