/* eslint-disable max-len */
/* eslint-disable no-prototype-builtins */
import PropTypes from 'prop-types';
import keys from 'lodash/keys';
import React, { PureComponent } from 'react';
import { Col, ControlLabel, Form, FormControl, InputGroup, Grid, Image, Row } from 'react-bootstrap';
import Select from 'react-select';
import FieldSet from 'app/components/FieldSet';
import api from 'app/api';
import store from 'app/store';
import Setting from './Setting';

const distanceHelp = {
    title: 'Probe Distance',
    bodyJsx: (
        <div>
            <p>The distance to move in the axis currently being probed.</p>
            <p>If contact is not made after moving this distance, an error occurs and the probe cycle is stopped without making any changes.</p>
        </div>
    )
};

const wcsHelp = {
    title: 'Work Coordinate System',
    bodyJsx: (
        <div>
            <p>
                The work coordinate system to apply changes to.
            </p>
        </div>
    )
};

const feedrateHelp = {
    title: 'Probe Feedrate',
    bodyJsx: (
        <div>
            <p>
                The feedrate the probe operation is made at.
            </p>
        </div>
    )
};

const adjustXHelp = {
    title: 'X Adjustment',
    bodyJsx: (
        <div>
            <p>
                An additional offset to apply to the X axis after probing.
            </p>
        </div>
    )
};

const adjustYHelp = {
    title: 'Y Adjustment',
    bodyJsx: (
        <div>
            <p>
                An additional offset to apply to the Y axis after probing.
            </p>
        </div>
    )
};

const adjustZHelp = {
    title: 'Z Adjustment',
    bodyJsx: (
        <div>
            <p>
                An additional offset to apply to the Z axis after probing.
            </p>
        </div>
    )
};

export default class extends PureComponent {
    static propTypes = {
        cycle: PropTypes.object.isRequired,
        port: PropTypes.string.isRequired,
        wcs: PropTypes.string.isRequired
    };

    state = {
        fields: {
            wcs: Number(this.props.wcs),
            adjustX: 0,
            adjustY: 0,
            adjustZ: 0,
            probeDistance: store.get('probe.probeDistance') ?? 10,
            probeFeedrate: store.get('probe.probeFeedrate') ?? 500
        },
        checked: {

        }
    };

    generateWCSOptions = () => {
        return [4, 5, 6, 7, 8, 9].flatMap(code => {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(subcode => {
                return { value: ((code - 4) * 10) + subcode + 1 };
            });
        });
    };

    handleWCSChange = (value) => {
        // eslint-disable-next-line no-unused-vars
        const { fields: { wcs: _, ...other } } = this.state;

        this.setState({ fields: { wcs: value.value, ...other } });
    };

    handleFieldChange = (event, fieldId) => {
        // eslint-disable-next-line no-unused-vars
        const { fields: { [fieldId]: _, ...other } } = this.state;

        if (['probeDistance', 'probeFeedrate'].includes(fieldId)) {
            store.set(`probe.${fieldId}`, event.target.value);
        }

        this.setState({ fields: { [fieldId]: event.target.value, ...other } });
    };

    handleSelected = (mutexGroup, id) => {
        // eslint-disable-next-line no-unused-vars
        const { fields: { [mutexGroup]: checked, ...otherFields } } = this.state;

        this.setState({
            fields: {
                [mutexGroup]: id,
                ...otherFields
            }
        });
    };

    handleGenerate = () => {
        const { cycle, port } = this.props;
        const { wcs, adjustX, adjustY, adjustZ, probeDistance, probeFeedrate, ...otherFields } = this.state.fields;

        const context = cycle.fields.reduce((fields, field) => {
            if (field.mutexGroup !== undefined) {
                return { ...fields, [field.id]: Number(otherFields.hasOwnProperty(field.id) ? otherFields[field.id] : field.default), [field.mutexGroup]: otherFields[field.mutexGroup] };
            } else {
                return { ...fields, [field.id]: Number(otherFields.hasOwnProperty(field.id) ? otherFields[field.id] : field.default) };
            }
        }, { wcs: Number(wcs), adjustX: Number(adjustX), adjustY: Number(adjustY), adjustZ: Number(adjustZ), probeDistance: Number(probeDistance), probeFeedrate: Number(probeFeedrate) });

        const gcode = keys(context).map((key) => `%${key} = ${context[key]}`).join('\n') + '\n' + cycle.gcode;

        api.loadGCode({ port, name: `probe-${cycle.id}.gcode`, gcode });
    };

    renderField = (field) => {
        const {
            fields: { [field.id]: value = field.default, [field.mutexGroup]: checkedId }
        } = this.state;

        const showMutex = field.mutexGroup !== undefined;

        const checked = checkedId === undefined ? field.defaultChecked : field.id === checkedId;

        return (
            <InputGroup>
                {showMutex && (
                    <InputGroup.Addon>
                        <input
                            type="radio"
                            name={field.mutexGroup}
                            checked={checked}
                            onChange={() => this.handleSelected(field.mutexGroup, field.id)}
                        />
                    </InputGroup.Addon>
                )}
                <FormControl
                    type="number"
                    id={field.id}
                    onChange={(event) => this.handleFieldChange(event, field.id)}
                    value={value}
                    disabled={showMutex && !checked}
                />
                <InputGroup.Addon>
                    {field.unit}
                </InputGroup.Addon>
            </InputGroup>
        );
    };

    render() {
        const { cycle } = this.props;
        const { fields: { probeDistance, probeFeedrate, wcs, adjustX, adjustY, adjustZ } } = this.state;

        const renderWCSValue = (wcs) => {
            return `G5${Math.trunc((wcs.value - 1) / 10) + 4}.${((wcs.value - 1) % 10)} (P${wcs.value})`;
        };

        return (
            <Grid fluid>
                <Row>
                    <Col sm={8}>
                        <Image src={cycle.image} />
                    </Col>
                    <Col sm={4} style={{ borderLeft: '1px solid #ccc' }}>
                        <Form horizontal>
                            <FieldSet title="Cycle Settings">
                                {cycle.fields.map(field => (
                                    <Setting controlId={field.id} key={field.id} help={field.help}>
                                        <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>{field.label}</Col>
                                        <Col sm={9}>
                                            {this.renderField(field)}
                                        </Col>
                                    </Setting>
                                ))}
                            </FieldSet>
                            <FieldSet title="General Settings">
                                <Setting controlId="probeDistance" help={distanceHelp}>
                                    <Col sm={3}><ControlLabel style={{ whiteSpace: 'pre' }}>Distance</ControlLabel></Col>
                                    <Col sm={9}>
                                        <InputGroup style={{ paddingLeft: '0px' }}>
                                            <FormControl
                                                type="number"
                                                id="probeDistance"
                                                value={probeDistance}
                                                onChange={(event) => this.handleFieldChange(event, 'probeDistance')}
                                            />
                                            <InputGroup.Addon>mm</InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </Setting>
                                <Setting controlId="probeFeedrate" help={feedrateHelp}>
                                    <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>Feedrate</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="probeFeedrate"
                                                value={probeFeedrate}
                                                onChange={(event) => this.handleFieldChange(event, 'probeFeedrate')}
                                            />
                                            <InputGroup.Addon><sup>mm</sup>/<sub>min</sub></InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </Setting>
                                <Setting controlId="wcs" help={wcsHelp}>
                                    <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>WCS</Col>
                                    <Col sm={9}>
                                        <Select
                                            name="wcs"
                                            value={wcs}
                                            clearable={false}
                                            searchable={false}
                                            valueRenderer={renderWCSValue}
                                            optionRenderer={renderWCSValue}
                                            options={this.generateWCSOptions()}
                                            onChange={(value) => this.handleWCSChange(value)}
                                            menuContainerStyle={{ zIndex: 9999 }}
                                        />
                                    </Col>
                                </Setting>
                                <Setting controlId="adjustX" help={adjustXHelp}>
                                    <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>X</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustX"
                                                value={adjustX}
                                                onChange={(event) => this.handleFieldChange(event, 'adjustX')}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </Setting>
                                <Setting controlId="adjustY" help={adjustYHelp}>
                                    <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>Y</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustY"
                                                value={adjustY}
                                                onChange={(event) => this.handleFieldChange(event, 'adjustY')}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </Setting>
                                <Setting controlId="adjustZ" help={adjustZHelp}>
                                    <Col sm={3} componentClass={ControlLabel} style={{ whiteSpace: 'pre' }}>Z</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustZ"
                                                value={adjustZ}
                                                onChange={(event) => this.handleFieldChange(event, 'adjustZ')}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </Setting>
                            </FieldSet>
                        </Form>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
