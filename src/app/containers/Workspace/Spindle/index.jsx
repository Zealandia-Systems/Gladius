import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { PureComponent } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import store from 'app/store';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import Panel from 'app/components/Panel';
import Space from 'app/components/Space';
import spindle from './spindle.svg';

class Spindle extends PureComponent {
    static propTypes = {
        canClick: PropTypes.bool.isRequired
    };

    state = this.getInitialState();

    getInitialState() {
        return {
            spindleSpeed: store.get('spindle.speed', 10000),
            spindleModal: ''
        };
    }

    setSpindleSpeed(value) {
        this.setState({ spindleSpeed: value });
    }

    componentDidMount() {
        this.addControllerEvents();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
    }

    controllerEvents = {
        'controller:state': (type, state) => {
            this.setState({
                spindleModal: state.modal.spindle
            });
        }
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

    render() {
        const { canClick } = this.props;
        const { spindleSpeed, spindleModal } = this.state;

        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title style={{ width: '99%' }}>
                        <img src={spindle} style={{ width: '16px', height: '16px' }} alt="Spindle" />
                        <Space width="8" />
                        {i18n._('Spindle')}
                    </Panel.Title>
                    <Panel.Controls>
                        <InputGroup>
                            <InputGroup.Addon>
                                RPM
                            </InputGroup.Addon>
                            <FormControl
                                style={{ width: '100px' }}
                                type="text"
                                value={spindleSpeed}
                                onChange={this.setSpindleSpeed}
                            />
                            <InputGroup.Button>
                                <Button
                                    style={{ height: '34px' }}
                                    title={i18n._('Spindle Forward {M3}')}
                                    onClick={() => {
                                        if (spindleSpeed > 0) {
                                            controller.command('gcode', 'M3 S' + spindleSpeed);
                                        } else {
                                            controller.command('gcode', 'M3');
                                        }
                                    }}
                                    disabled={!canClick}
                                >
                                    <i
                                        className={classNames(
                                            'fa',
                                            'fa-redo',
                                            { 'fa-spin': spindleModal === 'M3' }
                                        )}
                                    />
                                </Button>
                                <Button
                                    style={{ height: '34px' }}
                                    title={i18n._('Spindle Backward {M4}')}
                                    onClick={() => {
                                        if (spindleSpeed > 0) {
                                            controller.command('gcode', 'M4 S' + spindleSpeed);
                                        } else {
                                            controller.command('gcode', 'M4');
                                        }
                                    }}
                                    disabled={!canClick}
                                >
                                    <i
                                        className={classNames(
                                            'fa',
                                            'fa-undo',
                                            { 'fa-spin-reverse': spindle === 'M4' }
                                        )}
                                    />
                                </Button>
                                <Button
                                    style={{ height: '34px' }}
                                    title={i18n._('Spindle Stop {M5}')}
                                    onClick={() => controller.command('gcode', 'M5')}
                                    disabled={!canClick}
                                >
                                    <i className="fa fa-stop" />
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </Panel.Controls>
                </Panel.Heading>
            </Panel>
        );
    }
}

export default Spindle;
