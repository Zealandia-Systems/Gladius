import PropTypes from 'prop-types';
import keys from 'lodash/keys';
import React, { PureComponent } from 'react';
import { Col, ControlLabel, Form, FormControl, FormGroup, Grid, Image, InputGroup, Row } from 'react-bootstrap';
import Select from 'react-select';
import FieldSet from 'app/components/FieldSet';
import api from 'app/api';

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
            probeDistance: 10,
            probeFeedrate: 500
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

    handleFocusChange = (event) => {
        // TODO: change help image
    };

    handleFieldChange = (event, field) => {
        // eslint-disable-next-line no-unused-vars
        const { fields: { [field.id]: _, ...other } } = this.state;
        this.setState({ fields: { [field.id]: event.target.value, ...other } });
    };

    handleChecked = (mutexGroup, id) => {
        this.setState({ [`${mutexGroup}_checkedId`]: id });
    };

    handleGenerate = () => {
        const { cycle, port } = this.props;
        const { wcs, adjustX, adjustY, adjustZ, probeDistance, probeFeedrate, ...otherFields } = this.state.fields;

        const context = cycle.fields.reduce((fields, field) => {
            return { ...fields, [field.id]: Object.hasOwn(otherFields, field.id) ? otherFields[field.id] : field.default };
        }, { wcs, adjustX, adjustY, adjustZ, probeDistance, probeFeedrate });

        const gcode = keys(context).map((key) => `; ${key} = ${context[key]}`).join('\n') + '\n' + cycle.gcode;

        api.loadGCode({ port, name: `probe-${cycle.id}.gcode`, gcode, context });
    };

    renderField = (field) => {
        const {
            fields: { [field.id]: value = field.default },
            [`${field.mutexGroup}_checkedId`]: checkedId
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
                            onChange={() => this.handleChecked(field.mutexGroup, field.id)}
                        />
                    </InputGroup.Addon>
                )}
                <FormControl
                    type="number"
                    id={field.id}
                    onFocus={this.handleFocusChange}
                    onChange={(event) => this.handleFieldChange(event, field)}
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
        const { fields: { wcs, adjustX, adjustY, adjustZ } } = this.state;

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
                            <FieldSet title="Settings">
                                <FormGroup controlId="probeDistance">
                                    <Col sm={3} componentClass={ControlLabel}>Distance</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="probeDistance"
                                                value={10}
                                                onFocus={this.handleFocusChange}
                                            />
                                            <InputGroup.Addon>mm</InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="probeFeedrate">
                                    <Col sm={3} componentClass={ControlLabel}>Feedrate</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="probeFeedrate"
                                                value={500}
                                                onFocus={this.handleFocusChange}
                                            />
                                            <InputGroup.Addon>mm/min</InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </FormGroup>
                                {cycle.fields.map(field => (
                                    <FormGroup controlId={field.id} key={field.id}>
                                        <Col sm={3} componentClass={ControlLabel}>{field.title}</Col>
                                        <Col sm={9}>
                                            {this.renderField(field)}
                                        </Col>
                                    </FormGroup>
                                ))}
                            </FieldSet>
                            <FieldSet title="Offset">
                                <FormGroup controlId="wcs">
                                    <Col sm={3} componentClass={ControlLabel}>WCS</Col>
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
                                            onFocus={this.handleFocusChange}
                                            menuContainerStyle={{ zIndex: 9999 }}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="adjustX">
                                    <Col sm={3} componentClass={ControlLabel}>X</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustX"
                                                value={adjustX}
                                                onFocus={this.handleFocusChange}
                                                onChange={(event) => this.handleFieldChange(event, { id: 'adjustX' })}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="adjustY">
                                    <Col sm={3} componentClass={ControlLabel}>Y</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustY"
                                                value={adjustY}
                                                onFocus={this.handleFocusChange}
                                                onChange={(event) => this.handleFieldChange(event, { id: 'adjustY' })}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="adjustZ">
                                    <Col sm={3} componentClass={ControlLabel}>Z</Col>
                                    <Col sm={9}>
                                        <InputGroup>
                                            <FormControl
                                                type="number"
                                                id="adjustZ"
                                                value={adjustZ}
                                                onFocus={this.handleFocusChange}
                                                onChange={(event) => this.handleFieldChange(event, { id: 'adjustZ' })}
                                            />
                                            <InputGroup.Addon>
                                                mm
                                            </InputGroup.Addon>
                                        </InputGroup>
                                    </Col>
                                </FormGroup>
                            </FieldSet>
                        </Form>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
