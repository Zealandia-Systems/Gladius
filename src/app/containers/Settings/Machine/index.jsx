import React, { PureComponent } from 'react';
import { Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Table } from 'react-bootstrap';
import i18n from 'app/lib/i18n';

export default class Machine extends PureComponent {
    render() {
        return (
            <Form style={{ margin: '10px' }} horizontal>
                <fieldset>
                    <legend>
                        {i18n._('Automatic Tool Change')}
                    </legend>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2} style={{ whiteSpace: 'nowrap' }}>
                            {i18n._('Probe after every change?')}
                        </Col>
                        <Col sm={10}>
                            <Checkbox />
                        </Col>
                    </FormGroup>
                </fieldset>
                <fieldset>
                    <legend>
                        {i18n._('Manual Tool Change')}
                    </legend>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={2} style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('X Location')}
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={2} style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('Y Location')}
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                </fieldset>
                <fieldset>
                    <legend>
                        {i18n._('Dimensions')}
                    </legend>
                    <Table>
                        <thead>
                            <tr>
                                <th>Axis</th>
                                <th>Length</th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>X</td>
                                <td>1340</td>
                                <td>100</td>
                                <td>1340</td>
                            </tr>
                            <tr>
                                <td>Y</td>
                                <td>1340</td>
                                <td>0</td>
                                <td>1340</td>
                            </tr>
                            <tr>
                                <td>Z</td>
                                <td>150</td>
                                <td>0</td>
                                <td>150</td>
                            </tr>
                        </tbody>
                    </Table>
                </fieldset>
            </Form>
        );
    }
}

/*
<Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('X Minimum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('X Maximum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('Y Minimum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('Y Maximum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('Z Minimum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm="2" style={{ whiteSpace: 'nowrap' }}>
                                {i18n._('Z Maximum')}
                            </Col>
                            <Col sm="10">
                                <FormControl
                                    type="text"
                                />
                            </Col>
                        </FormGroup>
                    </Col>*/
