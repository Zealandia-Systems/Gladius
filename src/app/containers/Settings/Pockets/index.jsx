import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import Toggle from 'react-toggle';
import api from 'app/api';
import i18n from 'app/lib/i18n';
import isNumber from 'app/lib/isNumber';
import SettingsTable from '../SettingsTable';


class Pockets extends PureComponent {
    static propTypes = {
        initialState: PropTypes.object,
        state: PropTypes.object,
        stateChanged: PropTypes.bool,
        actions: PropTypes.object,
        port: PropTypes.string
    };

    handleIndexChanged = (component, event) => {
        const value = event.target.value;
        const validationState = isNumber(value) ? 'success' : 'error';
        const valid = validationState === 'success';

        const { record, validation } = component.state;

        component.setState({
            record: {
                ...record,
                index: Number(value) - 1
            },
            validation: {
                ...validation,
                valid,
                index: validationState
            }
        });
    };

    handleEnabledChanged = (component, event) => {
        const { record } = component.state;

        const value = event.target.checked;

        component.setState({
            record: {
                ...record,
                enabled: value
            }
        });
    }

    handleToolChanged = (component, value) => {
        const { record } = component.state;

        const index = value.index;

        component.setState({
            record: {
                ...record,
                tool: Number(index)
            }
        });
    }

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

    handleDepthChanged = (component, event) => {
        const { record, validation } = component.state;

        const value = event.target.value;
        const validationState = (isNumber(value) && Number(value) >= 0) ? 'success' : 'error';
        const valid = validationState === 'success';

        component.setState({
            record: {
                ...record,
                depth: value,
            },
            validation: {
                ...validation,
                valid,
                depth: validationState
            }
        });
    };

    render() {
        const { state, actions, port } = this.props;

        return (
            <SettingsTable
                state={state}
                actions={actions}
                canCreate
                canDelete
                port={port}
                fields={[
                    {
                        title: i18n._('Index'),
                        key: 'index',
                        sortable: true,
                        default: -1,
                        render: (_value, record, _index) => {
                            const { index } = record;

                            return index === -2 ? 'Spindle' : Number(index) + 1;
                        },
                        renderForm: (component, record) => {
                            const { validation } = component.state;
                            const { index } = record;

                            return (
                                <FormGroup validationState={validation.index}>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Index')}
                                    </Col>
                                    <Col sm={10}>
                                        <FormControl
                                            autoFocus
                                            type="text"
                                            name="index"
                                            value={Number(index) + 1}
                                            onChange={(event) => this.handleIndexChanged(component, event)}
                                        />
                                        <FormControl.Feedback />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    {
                        title: i18n._('Enabled'),
                        key: 'enabled',
                        default: true,
                        render: (value, record, _index) => {
                            const { enabled } = record;

                            return enabled ? i18n._('Yes') : i18n._('No');
                        },
                        renderForm: (component, record) => {
                            const { enabled, tool } = record;

                            return (
                                <FormGroup validationState="success">
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Enabled')}
                                    </Col>
                                    <Col sm={10}>
                                        <Toggle
                                            disabled={tool >= 0}
                                            size="sm"
                                            checked={enabled}
                                            onChange={(event) => this.handleEnabledChanged(component, event)}
                                        />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    {
                        title: i18n._('Tool'),
                        key: 'tool',
                        render: (value, record, index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { tool } = record;

                            return (
                                <pre style={style}>{tool === -1 ? 'Empty' : Number(tool + 1)}</pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { index } = record;

                            const loadTools = (input, callback) => {
                                api.tools.fetch({ port: this.props.port, paging: false, sorting: true, sortColumn: 'index', sortOrder: 'asc' })
                                    .then((res) => {
                                        const { records } = res.body;

                                        callback(null, {
                                            options: [
                                                { index: -1 },
                                                ...records.map(t => {
                                                    return {
                                                        ...t,
                                                        disabled: t.fixed || (t.pocket !== -1 && t.pocket !== index)
                                                    };
                                                })
                                            ]
                                        });
                                    })
                                    .catch((res) => {
                                        this.setState({
                                            tools: {
                                                ...this.state.tools,
                                                api: {
                                                    ...this.state.tools.api,
                                                    err: true,
                                                    fetching: false
                                                },
                                                records: []
                                            }
                                        });
                                    });
                            };

                            const renderValue = (tool) => {
                                const { index, description } = tool;

                                if (index === -1) {
                                    return 'None';
                                } else {
                                    return `${index + 1}: ${description}`;
                                }
                            };

                            const renderOption = (tool) => {
                                const { index, description } = tool;

                                if (index === -1) {
                                    return (<p style={{ margin: '0px' }}>None</p>);
                                } else {
                                    return (
                                        <p style={{ margin: '0px' }}>
                                            {`${index + 1}: ${description}`}
                                        </p>
                                    );
                                }
                            };

                            return (
                                <FormGroup validationState="success">
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Tool')}
                                    </Col>
                                    <Col sm={10}>
                                        <Select.Async
                                            value={record.tool}
                                            valueKey="index"
                                            valueRenderer={renderValue}
                                            searchable={false}
                                            clearable={false}
                                            onChange={(value) => this.handleToolChanged(component, value)}
                                            loadOptions={loadTools}
                                            optionRenderer={renderOption}
                                            menuContainerStyle={{ zIndex: 9999 }}
                                        />
                                    </Col>
                                </FormGroup>
                            );
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
                    },
                    {
                        title: i18n._('Depth'),
                        key: 'depth',
                        default: 150,
                        validationState: 'success',
                        render: (_value, record, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { depth } = record;

                            return (
                                <pre style={style}>{Number(depth)}</pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { validation } = component.state;
                            const { depth } = record;

                            return (
                                <FormGroup validationState={validation.depth}>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Depth')}
                                    </Col>
                                    <Col sm={10}>
                                        <FormControl
                                            id="depth"
                                            size="sm"
                                            type="text"
                                            value={depth}
                                            onChange={(event) => this.handleDepthChanged(component, event)}
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

export default Pockets;
