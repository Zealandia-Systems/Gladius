import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import i18n from 'app/lib/i18n';
import isNumber from 'app/lib/isNumber';
import SettingsTable from '../SettingsTable';


class CoordinateSystems extends PureComponent {
    static propTypes = {
        initialState: PropTypes.object,
        state: PropTypes.object,
        stateChanged: PropTypes.bool,
        actions: PropTypes.object,
        port: PropTypes.string
    };

    handleOffsetChanged = (component, event, axis) => {
        const { record, validation } = component.state;

        const value = event.target.value;
        const validationState = isNumber(value) ? 'success' : 'error';
        const valid = validationState === 'success';

        component.setState({
            record: {
                ...record,
                offset: {
                    ...record.offset,
                    [axis]: value
                },
            },
            validation: {
                ...validation,
                valid,
                offset: {
                    ...validation.offset,
                    [axis]: validationState
                }
            }
        });
    };

    render() {
        const { state, actions, port } = this.props;

        return (
            <SettingsTable
                state={state}
                actions={actions}
                port={port}
                canDelete={false}
                fields={
                    [
                        {
                            title: i18n._('Index'),
                            key: 'index',
                            sortable: true,
                            render: (_value, record, _index) => {
                                const { index } = record;
                                const suffix = index % 10 ? `.${index % 10}` : '';

                                return `5${Math.floor(index / 10) + 4}${suffix}`;
                            }
                        },
                        {
                            title: i18n._('Offset X'),
                            key: 'offset.x',
                            default: 0,
                            validationState: 'success',
                            render: (_value, record, _index) => {
                                const style = {
                                    background: 'inherit',
                                    border: 'none',
                                    margin: 0,
                                    padding: 0
                                };
                                const { offset } = record;

                                return (
                                    <span>
                                        <pre style={style}>
                                            {offset.x}
                                        </pre>
                                    </span>
                                );
                            },
                            renderForm: (component, record) => {
                                const { validation } = component.state;
                                const { offset } = record;

                                return (
                                    <FormGroup validationState={validation.offset.x}>
                                        <Col componentClass={ControlLabel} sm={2}>
                                            {i18n._('Offset X')}
                                        </Col>
                                        <Col sm={10}>
                                            <FormControl
                                                autoFocus
                                                id="offset_x"
                                                size="sm"
                                                type="text"
                                                value={offset.x}
                                                onChange={(event) => this.handleOffsetChanged(component, event, 'x')}
                                            />
                                            <FormControl.Feedback />
                                        </Col>
                                    </FormGroup>
                                );
                            }
                        },
                        {
                            title: i18n._('Offset Y'),
                            key: 'offset.y',
                            default: 0,
                            validationState: 'success',
                            render: (_value, record, _index) => {
                                const style = {
                                    background: 'inherit',
                                    border: 'none',
                                    margin: 0,
                                    padding: 0
                                };
                                const { offset } = record;

                                return (
                                    <span>
                                        <pre style={style}>
                                            {offset.y}
                                        </pre>
                                    </span>
                                );
                            },
                            renderForm: (component, record) => {
                                const { validation } = component.state;
                                const { offset } = record;

                                return (
                                    <FormGroup validationState={validation.offset.y}>
                                        <Col componentClass={ControlLabel} sm={2}>
                                            {i18n._('Offset Y')}
                                        </Col>
                                        <Col sm={10}>
                                            <FormControl
                                                id="offset_y"
                                                size="sm"
                                                type="text"
                                                value={offset.y}
                                                onChange={(event) => this.handleOffsetChanged(component, event, 'y')}
                                            />
                                            <FormControl.Feedback />
                                        </Col>
                                    </FormGroup>
                                );
                            }
                        },
                        {
                            title: i18n._('Offset Z'),
                            key: 'offset.z',
                            default: 0,
                            validationState: 'success',
                            render: (_value, record, _index) => {
                                const style = {
                                    background: 'inherit',
                                    border: 'none',
                                    margin: 0,
                                    padding: 0
                                };
                                const { offset } = record;

                                return (
                                    <span>
                                        <pre style={style}>
                                            {offset.z}
                                        </pre>
                                    </span>
                                );
                            },
                            renderForm: (component, record) => {
                                const { validation } = component.state;
                                const { offset } = record;

                                return (
                                    <FormGroup validationState={validation.offset.z}>
                                        <Col componentClass={ControlLabel} sm={2}>
                                            {i18n._('Offset Z')}
                                        </Col>
                                        <Col sm={10}>
                                            <FormControl
                                                id="offset_z"
                                                size="sm"
                                                type="text"
                                                value={offset.z}
                                                onChange={(event) => this.handleOffsetChanged(component, event, 'z')}
                                            />
                                            <FormControl.Feedback />
                                        </Col>
                                    </FormGroup>
                                );
                            }
                        }
                    ]}
            />
        );
    }
}

export default CoordinateSystems;
