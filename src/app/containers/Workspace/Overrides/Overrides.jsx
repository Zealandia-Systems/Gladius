import PropTypes from 'prop-types';
import { get } from 'lodash';
import React, { PureComponent } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import {
    SWORDFISH
} from 'app/constants';
import RepeatButton from 'app/components/RepeatButton';
import Panel from 'app/components/Panel';
import Space from 'app/components/Space';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import DigitalReadout from './DigitalReadout';
import styles from './index.styl';

class Overrides extends PureComponent {
    static propTypes = {
        ovF: PropTypes.number,
        ovS: PropTypes.number,
        ovR: PropTypes.number
    };

    state = this.getInitialState();

    controllerEvents = {
        'serialport:open': (options) => {
            const { port, controllerType } = options;
            this.setState({
                isReady: controllerType === SWORDFISH,
                port: port
            });
        },
        'serialport:close': (options) => {
            const initialState = this.getInitialState();
            this.setState({ ...initialState });
        },
        'controller:settings': (type, controllerSettings) => {
            if (type === SWORDFISH) {
                this.setState(state => ({
                    controller: {
                        ...state.controller,
                        type: type,
                        settings: controllerSettings
                    }
                }));
            }
        },
        'controller:state': (type, controllerState) => {
            if (type === SWORDFISH) {
                this.setState(state => ({
                    controller: {
                        ...state.controller,
                        type: type,
                        state: controllerState
                    }
                }));
            }
        }
    };

    componentDidMount() {
        this.addControllerEvents();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
    }

    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.addListener(eventName, callback);
        });
    }

    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.removeListener(eventName, callback);
        });
    }

    getInitialState() {
        return {
            isReady: (controller.loadedControllers.length === 1) || (controller.type === SWORDFISH),
            canClick: true, // Defaults to true
            port: controller.port,
            controller: {
                type: controller.type,
                settings: controller.settings,
                state: controller.state
            }
        };
    }

    render() {
        const controllerState = this.state.controller.state || {};
        const ovF = get(controllerState, 'ovF', 0);
        const ovR = get(controllerState, 'ovR', 0);
        const ovS = get(controllerState, 'ovS', 0);

        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title style={{ width: '99%' }}>
                        <i className="fa fa-wave-square" />
                        <Space width="8" />
                        {i18n._('Overrides')}
                    </Panel.Title>
                    <Panel.Controls>
                        <ButtonGroup>
                            <Button
                                bsSize="sm"
                                onClick={() => {
                                    controller.command('feedOverride', 0);
                                    controller.command('rapidOverride', 0);
                                    controller.command('spindleOverride', 0);
                                }}
                            >
                                <i className="fa fa-fw fa-undo" />
                                <Space width="4" />
                                {i18n._('Reset All')}
                            </Button>
                        </ButtonGroup>
                    </Panel.Controls>
                </Panel.Heading>
                <Panel.Body>
                    <table>
                        <tbody>
                            {!!ovF && (
                                <DigitalReadout label="Feed" value={ovF + '%'}>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('feedOverride', -10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -10%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('feedOverride', -1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('feedOverride', 1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('feedOverride', 10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        10%
                                        </span>
                                    </RepeatButton>
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('feedOverride', 0);
                                        }}
                                    >
                                        <i className="fa fa-undo fa-fw" />
                                    </button>
                                </DigitalReadout>
                            )}
                            <tr><td colSpan="3"><hr className={styles.divider} /></td></tr>
                            {!!ovR && (
                                <DigitalReadout label="Rapid" value={ovR + '%'}>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('rapidOverride', -10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -10%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('rapidOverride', -1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('rapidOverride', 1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('rapidOverride', 10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        10%
                                        </span>
                                    </RepeatButton>
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('rapidOverride', 0);
                                        }}
                                    >
                                        <i className="fa fa-fw fa-undo" />
                                    </button>
                                </DigitalReadout>
                            )}
                            <tr><td colSpan="3"><hr className={styles.divider} /></td></tr>
                            {!!ovS && (
                                <DigitalReadout label="Spindle" value={ovS + '%'}>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('spindleOverride', -10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -10%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('spindleOverride', -1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-down" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        -1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('spindleOverride', 1);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 10 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        1%
                                        </span>
                                    </RepeatButton>
                                    <RepeatButton
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('spindleOverride', 10);
                                        }}
                                    >
                                        <i className="fa fa-arrow-up" style={{ fontSize: 14 }} />
                                        <span style={{ marginLeft: 5 }}>
                                        10%
                                        </span>
                                    </RepeatButton>
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        style={{ padding: 5 }}
                                        onClick={() => {
                                            controller.command('spindleOverride', 0);
                                        }}
                                    >
                                        <i className="fa fa-fw fa-undo" />
                                    </button>
                                </DigitalReadout>
                            )}
                        </tbody>
                    </table>
                </Panel.Body>
            </Panel>
        );
    }
}

export default Overrides;
