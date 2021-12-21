import chainedFunction from 'chained-function';
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import ModalTemplate from 'app/components/ModalTemplate';
import Modal from 'app/components/Modal';
import controller from 'app/lib/controller';


const Prompt = (props) => (
    <Modal
        size="xs"
        disableOverlay={true}
        showCloseButton={false}
    >
        <Modal.Body>
            <ModalTemplate type="warning">
                <h5>{props.title}</h5>
            </ModalTemplate>
        </Modal.Body>
        <Modal.Footer>
            {props.buttons.map(button => {
                return (
                    <Button
                        autoFocus
                        key={button.response}
                        onClick={chainedFunction(
                            () => {
                                controller.command('prompt:response', { resume: props.resume, response: button.response });
                            },
                            props.onClose
                        )}
                    >
                        {button.label}
                    </Button>
                );
            })}


        </Modal.Footer>
    </Modal>
);

Prompt.propTypes = {
    title: PropTypes.string,
    onClose: PropTypes.func,
    resume: PropTypes.bool,
    buttons: PropTypes.array
};

export default Prompt;
