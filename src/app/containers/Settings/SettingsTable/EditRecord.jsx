import PropTypes from 'prop-types';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'app/components/Modal';
import { ToastNotification } from 'app/components/Notifications';
import i18n from 'app/lib/i18n';

class EditRecord extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object,
        fields: PropTypes.arrayOf(PropTypes.object),
        create: PropTypes.bool
    };

    static defaultProps = {
        create: false
    };

    constructor(props) {
        super(props);

        const { fields, create } = this.props;

        let defaults = {

        };

        fields.forEach(field => {
            _.set(defaults, field.key, field.default);
        });

        const validationFields = fields.filter(field => field.validationState !== undefined);

        let validation = {
            valid: !create || !validationFields.some(field => field.validationState !== 'success')
        };

        fields.filter(field => field.validationState !== undefined).forEach(field => {
            _.set(validation, field.key, field.validationState);
        });

        if (create) {
            this.state = {
                record: {
                    ...defaults
                },
                validation
            };
        } else {
            this.state = {
                id: props.state.modal.params.index,
                record: {
                    ...props.state.modal.params
                },
                validation
            };
        }
    }

    onKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();

            this.onSubmit(event);
        }
    }

    onSubmit = (event) => {
        event.preventDefault();

        const { actions } = this.props;
        const { record } = this.state;

        if (this.props.create) {
            actions.createRecord(record);
        } else {
            const { id } = this.state;

            actions.updateRecord(id, record);
        }
    }

    render() {
        const { state, actions, fields, create } = this.props;
        const { modal } = state;
        const { validation, record } = this.state;
        const { alertMessage } = modal.params;

        return (
            <Modal disableOverlay size="sm" onClose={actions.closeModal}>
                <Modal.Header>
                    <Modal.Title>
                        {create && i18n._(`Create ${state.recordName}`)}
                        {!create && i18n._(`Edit ${state.recordName}`)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alertMessage && (
                        <ToastNotification
                            style={{ margin: '-16px -24px 10px -24px' }}
                            type="error"
                            onDismiss={() => {
                                actions.updateModalParams({ alertMessage: '' });
                            }}
                        >
                            {alertMessage}
                        </ToastNotification>
                    )}
                    <Form
                        horizontal
                        onSubmit={this.onSubmit}
                        onKeyDown={this.onKeyDown}
                    >
                        {fields.filter(field => typeof field.renderForm === 'function').map(field => {
                            return (
                                <div key={field.key}>
                                    {field.renderForm(this, record)}
                                </div>
                            );
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={actions.closeModal}
                    >
                        {i18n._('Cancel')}
                    </Button>
                    <Button
                        disabled={!validation.valid}
                        onClick={this.onSubmit}
                    >
                        {i18n._('OK')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default EditRecord;
