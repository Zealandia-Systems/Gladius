import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Grid, Row, Image, Nav, NavItem } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Modal from 'app/components/Modal';
import i18n from 'app/lib/i18n';
import api from 'app/api';
import controller from 'app/lib/controller';
import { SWORDFISH } from '../../constants';
import Cycle from './Cycle';
import Calibrate from './Calibrate';

class Probe extends PureComponent {
    static propTypes = {
        port: PropTypes.string,
        onClose: PropTypes.func
    };

    state = {
        show: true,
        ActiveCycle: null,
        wcs: 1
    };

    static show(port, callback) {
        const el = document.body.appendChild(document.createElement('div'));
        const handleClose = (e) => {
            ReactDOM.unmountComponentAtNode(el);
            setTimeout(() => {
                el.remove();
            }, 0);
        };

        ReactDOM.render(
            <Probe port={port} onClose={handleClose} />,
            el
        );
    }

    handleTabClick = (event, tabId) => {
        this.setState({ activeTab: tabId });
    };

    handleClose = (e) => {
        e.stopPropagation();
        this.setState({ show: false });

        if (this.props.onClose) {
            this.props.onClose.call();
        }
    };

    handleBack = (e) => {
        this.setState({ activeCycle: null });
    };

    handleGenerate = (e) => {
        this.cycle.handleGenerate();

        e.stopPropagation();
        this.setState({ show: false });

        if (this.props.onClose) {
            this.props.onClose.call();
        }
    };

    handleClick = (e, cycle) => {
        this.setState({ activeCycle: cycle });
    };

    renderCycle(cols, cycle) {
        return (
            <Col xs={12 / cols} style={{ paddingBottom: 15 }} key={cycle.title}>
                <Button onClick={(e) => this.handleClick(e, cycle)} bsSize="large">
                    <Image src={cycle.thumbnail} style={{ display: 'block' }} />
                    <h5>{cycle.title}</h5>
                </Button>
            </Col>
        );
    }

    renderCyclesRow(cols, i, cycles) {
        return (
            <Row key={i}>
                {cycles.map((cycle) => this.renderCycle(cols, cycle))}
            </Row>
        );
    }

    renderCycles() {
        const { cycles } = this.state;

        let cols = 3;
        let indices = [...Array(cycles.length).keys()].filter(i => i % cols === 0);

        return (
            <Grid fluid>
                {indices.map(i => this.renderCyclesRow(cols, i, cycles.slice(i, i + cols)))}
            </Grid>
        );
    }

    splitWCS(wcs) {
        const regex = new RegExp('G(\\d\\d)\\.(\\d)');
        const result = regex.exec(wcs);
        if (result === undefined || result === null) {
            return wcs;
        }
        const code = Number(result[1]);
        const subcode = Number(result[2]);
        return { code, subcode };
    }

    wcsToP(wcs) {
        const { code, subcode } = this.splitWCS(wcs);
        return ((code - 54) * 10) + subcode + 1;
    }

    controllerEvents = {
        'controller:state': (type, controllerState) => {
            if (type === SWORDFISH) {
                this.setState({ wcs: String(this.wcsToP(controllerState.modal.wcs)) });
            }
        }
    };

    componentDidMount() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.addListener(eventName, callback);
        });

        api.probeCycles.fetch({})
            .then(res => {
                this.setState({ cycles: res.body.records });
            })
            .catch(res => {
                //console.log(res);
            });
    }

    componentWillUnmount() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.removeListener(eventName, callback);
        });
    }

    render() {
        const { port } = this.props;
        const { show, activeCycle, activeTab = 'cycles', wcs, cycles } = this.state;
        const showActive = activeTab === 'cycles' && Boolean(activeCycle);
        const showCycles = activeTab === 'cycles' && cycles !== undefined && !showActive;
        const showCalibrate = activeTab === 'calibrate';

        return (
            <Modal
                size="lg"
                style={{
                    width: '1000px'
                }}
                onClose={this.handleClose}
                show={show}
            >
                <Modal.Header>
                    <Modal.Title>{i18n._('Probe')}{showActive && ` - ${activeCycle.title}`}</Modal.Title>
                    <Nav
                        bsStyle="pills"
                        size="sm"
                        activeKey={activeTab}
                        style={{ marginRight: '50px', float: 'right' }}
                    >
                        <NavItem
                            key="cycles"
                            eventKey="cycles"
                            onClick={(event) => this.handleTabClick(event, 'cycles')}
                        >
                            Cycles
                        </NavItem>
                        {/*<NavItem
                            key="calibrate"
                            eventKey="calibrate"
                            onClick={(event) => this.handleTabClick(event, 'calibrate')}
                        >
                            Calibrate
                        </NavItem>*/}
                    </Nav>
                </Modal.Header>
                <Modal.Body>
                    {showCycles && this.renderCycles()}
                    {showActive && (
                        <Cycle
                            ref={(cycle) => {
                                this.cycle = cycle;
                            }}
                            cycle={activeCycle}
                            port={port}
                            wcs={wcs}
                        />
                    )}
                    {showCalibrate && (
                        <Calibrate port={port} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {showActive && (
                        <Button
                            style={{ float: 'left' }}
                            onClick={this.handleBack}
                        >
                            {i18n._('Back')}
                        </Button>
                    )}
                    {showActive && (
                        <Button
                            bsStyle="primary"
                            onClick={this.handleGenerate}
                        >
                            {i18n._('Generate')}
                        </Button>
                    )}
                    <Button
                        onClick={this.handleClose}
                    >
                        {i18n._('Close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default Probe;
