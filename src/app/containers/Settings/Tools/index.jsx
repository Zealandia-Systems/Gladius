import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import Toggle from 'react-toggle';
import api from 'app/api';
import i18n from 'app/lib/i18n';
import isNumber from 'app/lib/isNumber';
import isEmptyString from 'app/lib/isEmptyString';
import SettingsTable from '../SettingsTable';

class Tools extends PureComponent {
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

    handleDescriptionChanged = (component, event) => {
        const value = event.target.value;
        const validationState = !isEmptyString(value) ? 'success' : 'error';
        const valid = validationState === 'success';

        const { record, validation } = component.state;

        component.setState({
            record: {
                ...record,
                description: value
            },
            validation: {
                ...validation,
                valid,
                description: validationState
            }
        });
    };

    handlePocketChanged = (component, value) => {
        const { record } = component.state;

        component.setState({
            record: {
                ...record,
                pocket: value.index
            }
        });
    };

    handleFixedChanged = (component, event) => {
        const value = event.target.checked;
        const { record } = component.state;

        component.setState({
            record: {
                ...record,
                fixed: Boolean(value)
            }
        });
    };

    handleNeedsProbeChanged = (component, event) => {
        const value = event.target.checked;
        const { record } = component.state;

        component.setState({
            record: {
                ...record,
                needsProbe: Boolean(value)
            }
        });
    };

    handleGeometryChanged = (component, event, axis) => {
        const value = event.target.value;
        const validationState = isNumber(value) ? 'success' : 'error';
        const valid = validationState === 'success';

        const { record, validation } = component.state;

        component.setState({
            record: {
                ...record,
                geometry: {
                    ...record.geometry,
                    [axis]: value
                }
            },
            validation: {
                ...validation,
                valid,
                geometry: {
                    ...validation.geometry,
                    [axis]: validationState
                }
            }
        });
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
                canCreate
                canReorder
                port={port}
                fields={[
                    {
                        title: i18n._('Index'),
                        key: 'index',
                        sortable: true,
                        validationState: 'success',
                        render: (_value, row, _index) => {
                            const { index } = row;

                            return Number(index) + 1;
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
                        title: i18n._('Description'),
                        key: 'description',
                        sortable: true,
                        default: '',
                        validationState: 'success',
                        render: (_value, row, _index) => {
                            const { description } = row;

                            return description;
                        },
                        renderForm: (component, record) => {
                            const { validation } = component.state;
                            const { description } = record;

                            return (
                                <FormGroup validationState={validation.description}>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Description')}
                                    </Col>
                                    <Col sm={10}>
                                        <FormControl
                                            type="text"
                                            name="description"
                                            value={description}
                                            onChange={(event) => this.handleDescriptionChanged(component, event)}
                                        />
                                        <FormControl.Feedback />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    {
                        title: i18n._('Pocket'),
                        key: 'pocket',
                        sortable: true,
                        default: -1,
                        render: (_value, row, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { pocket } = row;
                            const value = {
                                '-2': 'Spindle',
                                '-1': 'None'
                            }[pocket] ?? pocket + 1;

                            return (
                                <pre style={style}>{value}</pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { index } = record;

                            const loadPockets = (input, callback) => {
                                api.pockets.fetch({ port: this.props.port, paging: false, sorting: true, sortColumn: 'index', sortOrder: 'asc' })
                                    .then((res) => {
                                        const { records } = res.body;

                                        callback(null, {
                                            options: [
                                                { index: -1 },
                                                ...records.map(p => {
                                                    return {
                                                        ...p,
                                                        disabled: p.tool !== -1 && p.tool !== index
                                                    };
                                                })
                                            ]
                                        });
                                    })
                                    .catch((res) => {
                                        this.setState({
                                            pockets: {
                                                ...this.state.pockets,
                                                api: {
                                                    ...this.state.pockets.api,
                                                    err: true,
                                                    fetching: false
                                                },
                                                records: []
                                            }
                                        });
                                    });
                            };

                            const renderValue = (pocket) => {
                                const { index } = pocket;

                                if (index === -1) {
                                    return 'None';
                                } else if (index === -2) {
                                    return 'Spindle';
                                } else {
                                    return index + 1;
                                }
                            };

                            const renderOption = (pocket) => {
                                if (pocket.index === -1) {
                                    return (<p style={{ margin: '0px' }}>None</p>);
                                } else if (pocket.index === -2) {
                                    return (<p style={{ margin: '0px' }}>Spindle</p>);
                                } else {
                                    return (
                                        <p style={{ margin: '0px' }}>
                                            Pocket {pocket.index + 1}
                                            <br />
                                            <small>
                                                Depth: {pocket.depth}, Tool: {pocket.tool === -1 ? 'Empty' : pocket.tool}
                                            </small>
                                        </p>
                                    );
                                }
                            };

                            return (
                                <FormGroup validationState="success">
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Pocket')}
                                    </Col>
                                    <Col sm={10}>
                                        <Select.Async
                                            value={record.pocket}
                                            valueKey="index"
                                            valueRenderer={renderValue}
                                            searchable={false}
                                            clearable={false}
                                            onChange={(value) => this.handlePocketChanged(component, value)}
                                            loadOptions={loadPockets}
                                            optionRenderer={renderOption}
                                            menuContainerStyle={{ zIndex: 9999 }}
                                        />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    /*{
                        title: i18n._('Fixed'),
                        key: 'fixed',
                        sortable: true,
                        default: false,
                        render: (_value, record, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { fixed } = record;

                            return (
                                <pre style={style}>{Boolean(fixed) ? i18n._('Fixed') : i18n._('No')}</pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { fixed } = record;

                            return (
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Fixed')}
                                    </Col>
                                    <Col sm={10}>
                                        <Toggle
                                            size="sm"
                                            icons={false}
                                            checked={fixed}
                                            onChange={(event) => this.handleFixedChanged(component, event)}
                                        />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },*/
                    {
                        title: i18n._('Needs Probe'),
                        key: 'needsProbe',
                        sortable: true,
                        default: true,
                        render: (_value, record, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { needsProbe } = record;

                            return (
                                <pre style={style}>{Boolean(needsProbe) ? i18n._('Yes') : i18n._('No')}</pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { needsProbe } = record;

                            return (
                                <FormGroup validationState="success">
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Needs Probe')}
                                    </Col>
                                    <Col sm={10}>
                                        <Toggle
                                            size="sm"
                                            icons={false}
                                            checked={needsProbe}
                                            onChange={(event) => this.handleNeedsProbeChanged(component, event)}
                                        />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    {
                        title: i18n._('Diameter'),
                        key: 'geometry.diameter',
                        default: 0,
                        validationState: 'success',
                        render: (_value, row, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { geometry } = row;

                            return (
                                <pre style={style}>
                                    {geometry.diameter}
                                </pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { validation } = component.state;
                            const { geometry } = record;

                            return (
                                <FormGroup validationState={validation.geometry.diameter}>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Diameter')}
                                    </Col>
                                    <Col sm={10}>
                                        <FormControl
                                            id="geometry_diameter"
                                            size="sm"
                                            type="text"
                                            value={geometry.diameter}
                                            onChange={(event) => this.handleGeometryChanged(component, event, 'diameter')}
                                        />
                                        <FormControl.Feedback />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },
                    /*{
                        title: i18n._('Length'),
                        key: 'geometry.length',
                        default: 0,
                        validationState: 'success',
                        render: (_value, row, _index) => {
                            const style = {
                                background: 'inherit',
                                border: 'none',
                                margin: 0,
                                padding: 0
                            };
                            const { geometry } = row;

                            return (
                                <pre style={style}>
                                    {geometry.length}
                                </pre>
                            );
                        },
                        renderForm: (component, record) => {
                            const { validation } = component.state;
                            const { geometry } = record;

                            return (
                                <FormGroup validationState={validation.geometry.length}>
                                    <Col componentClass={ControlLabel} sm={2}>
                                        {i18n._('Length')}
                                    </Col>
                                    <Col sm={10}>
                                        <FormControl
                                            id="geometry_length"
                                            size="sm"
                                            type="text"
                                            value={geometry.length}
                                            onChange={(event) => this.handleGeometryChanged(component, event, 'length')}
                                        />
                                        <FormControl.Feedback />
                                    </Col>
                                </FormGroup>
                            );
                        }
                    },*/
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

export default Tools;
