import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';

export default class extends PureComponent {
    static propTypes = {
        port: PropTypes.string
    };

    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        Calibrate
                    </Col>
                </Row>
            </Grid>
        );
    }
}
