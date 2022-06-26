/* eslint-disable indent */
import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Space from 'app/components/Space';
import Widget from 'app/components/Widget';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import { in2mm, mapValueToUnits } from 'app/lib/units';
import WidgetConfig from '../WidgetConfig';
import Probe from './Probe';
import RunProbe from './RunProbe';
import {
    // Units
    IMPERIAL_UNITS,
    METRIC_UNITS,
    // Grbl
    GRBL,
    GRBL_ACTIVE_STATE_IDLE,
    // Marlin
    MARLIN,
    // Smoothie
    SMOOTHIE,
    SMOOTHIE_ACTIVE_STATE_IDLE,
    // TinyG
    TINYG,
    TINYG_MACHINE_STATE_READY,
    TINYG_MACHINE_STATE_STOP,
    TINYG_MACHINE_STATE_END,
    // Swordfish
    SWORDFISH,
    // Workflow
    WORKFLOW_STATE_IDLE
} from '../../constants';
import {
    MODAL_NONE,
    MODAL_PREVIEW
} from './constants';
import styles from './index.styl';

const gcode = (cmd, params) => {
    const s = map(params, (value, letter) => String(letter + value)).join(' ');
    return (s.length > 0) ? (cmd + ' ' + s) : cmd;
};

class ProbeWidget extends PureComponent {
    static propTypes = {
        widgetId: PropTypes.string.isRequired,
        onFork: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        sortable: PropTypes.object
    };

    // Public methods
    collapse = () => {
        this.setState({ minimized: true });
    };

    expand = () => {
        this.setState({ minimized: false });
    };

    config = new WidgetConfig(this.props.widgetId);

    state = this.getInitialState();

    actions = {
        toggleFullscreen: () => {
            const { minimized, isFullscreen } = this.state;
            this.setState({
                minimized: isFullscreen ? minimized : false,
                isFullscreen: !isFullscreen
            });
        },
        toggleMinimized: () => {
            const { minimized } = this.state;
            this.setState({ minimized: !minimized });
        },
        openModal: (name = MODAL_NONE, params = {}) => {
            this.setState({
                modal: {
                    name: name,
                    params: params
                }
            });
        },
        closeModal: () => {
            this.setState({
                modal: {
                    name: MODAL_NONE,
                    params: {}
                }
            });
        },
        updateModalParams: (params = {}) => {
            this.setState({
                modal: {
                    ...this.state.modal,
                    params: {
                        ...this.state.modal.params,
                        ...params
                    }
                }
            });
        },
        mouseOverPlate: (e, id) => {
            let state = {
                ...this.state,
                plate1IsHover: false,
                plate2IsHover: false,
                plate3IsHover: false,
                plate4IsHover: false
            };

            switch (id) {
                case 1: state = { ...state, plate1IsHover: true }; break;
                case 2: state = { ...state, plate2IsHover: true }; break;
                case 3: state = { ...state, plate3IsHover: true }; break;
                case 4: state = { ...state, plate4IsHover: true }; break;
                default: break;
            }

            this.setState(state);
        },
        mouseOutOfPlate: (e, id) => {
            let state = {
                ...this.state,
                plate1IsHover: false,
                plate2IsHover: false,
                plate3IsHover: false,
                plate4IsHover: false
            };

            this.setState(state);
        },
        changeProbeAxis: (e, id) => {
            const {
                plate1IsSelected,
                plate2IsSelected,
                plate3IsSelected,
                plate4IsSelected
            } = this.state;

            let state = {
                ...this.state,
                plate1IsSelected: false,
                plate2IsSelected: false,
                plate3IsSelected: false,
                plate4IsSelected: false
            };

            switch (id) {
                case 1: state = {
                    ...state,
                    plate1IsSelected: !plate1IsSelected,
                    dirX: -1,
                    dirY: +1
                }; break;
                case 2: state = {
                    ...state,
                    plate2IsSelected: !plate2IsSelected,
                    dirX: 1,
                    dirY: 1
                }; break;
                case 3: state = {
                    ...state,
                    plate3IsSelected: !plate3IsSelected,
                    dirX: +1,
                    dirY: -1
                }; break;
                case 4: state = {
                    ...state,
                    plate4IsSelected: !plate4IsSelected,
                    dirX: -1,
                    dirY: -1
                }; break;
                default: break;
            }

            this.setState(state);

            e.preventDefault();
        },
        handleToolDiameterChange: (event) => {
            const toolDiameter = event.target.value;
            this.setState({ toolDiameter });
        },
        handleProbeDepthChange: (event) => {
            const probeDepth = event.target.value;
            this.setState({ probeDepth });
        },
        handleProbeFeedrateChange: (event) => {
            const probeFeedrate = event.target.value;
            this.setState({ probeFeedrate });
        },
        handleProbeThicknessChange: (event) => {
            const probeThickness = event.target.value;

            this.setState({ probeThickness });
        },
        handleRetractionDistanceChange: (event) => {
            const retractionDistance = event.target.value;
            this.setState({ retractionDistance });
        },
        splitWCS: (wcs) => {
            const regex = new RegExp('G(\\d\\d)\\.(\\d)');
            const result = regex.exec(wcs);
            if (result === undefined || result === null) {
                return wcs;
            }
            const code = Number(result[1]);
            const subcode = Number(result[2]);
            return { code, subcode };
        },
        wcsToP: (wcs) => {
            const { code, subcode } = this.actions.splitWCS(wcs);
            return ((code - 54) * 10) + subcode + 1;
        },
        populateProbeCommands: (doXY) => {
            const {
                dirX,
                dirY,
                probeDepth,
                probeFeedrate,
                toolDiameter
            } = this.state;
            const wcs = this.getWorkCoordinateSystem();

            const MAX_PROBE_DIST_X = probeDepth;
            const MAX_PROBE_DIST_Y = probeDepth;
            const MAX_PROBE_DIST_Z = probeDepth;

            const CORNER_POSITION_X = 31 - toolDiameter / 2;
            const CORNER_POSITION_Y = 31 - toolDiameter / 2;
            const CORNER_POSITION_Z = 9;

            const RETRACT_DISTANCE_X = 20 / 2 - toolDiameter / 2;
            const RETRACT_DISTANCE_Y = 20 / 2 - toolDiameter / 2;
            const RETRACT_DISTANCE_Z = 2;

            let wcsProbeCommands = [
                'M120',
                '',
                '; Probe Z',
                gcode('G91 G38.2', {
                    Z: -MAX_PROBE_DIST_Z,
                    F: probeFeedrate
                }),
                '%wait',
                '',
                '; Set the active WCS Z0',
                gcode('G90 G10', {
                    L: 20,
                    P: this.actions.wcsToP(wcs),
                    Z: CORNER_POSITION_Z
                })
            ];

            if (doXY) {
                wcsProbeCommands = wcsProbeCommands.concat([
                    '',
                    '; Retract Z',
                    gcode('G91 G0', {
                        Z: RETRACT_DISTANCE_Z
                    }),
                    '; Probe X',
                    gcode('G91 G38.2', {
                        X: -dirX * MAX_PROBE_DIST_X,
                        F: probeFeedrate
                    }),
                    '%wait',
                    '',
                    '; Set the active WCS X0',
                    gcode('G90 G10', {
                        L: 20,
                        P: this.actions.wcsToP(wcs),
                        X: -dirX * CORNER_POSITION_X,
                    }),
                    '',
                    '; Retract X',
                    gcode('G91 G0', {
                        X: dirX * RETRACT_DISTANCE_X
                    }),
                    '',
                    '; Probe Y',
                    gcode('G91 G38.2', {
                        Y: -dirY * MAX_PROBE_DIST_Y,
                        F: probeFeedrate
                    }),
                    '%wait',
                    '',
                    '; Set the active WCS Y0',
                    gcode('G90 G10', {
                        L: 20,
                        P: this.actions.wcsToP(wcs),
                        Y: -dirY * CORNER_POSITION_Y
                    }),
                    '',
                    '; Retract Y',
                    gcode('G91 G0', {
                        Y: dirY * RETRACT_DISTANCE_Y
                    })
                ]);
            }

            wcsProbeCommands.push('', '; Retract Z', 'G53 G90 G0 Z0');
            wcsProbeCommands.push('', 'M121');

            return wcsProbeCommands;
        },
        populateProbeCommandsOld: (doXY) => {
            const {
                dirX,
                dirY,
                probeDepth,
                probeFeedrate,
                toolDiameter,
                retractionDistance
            } = this.state;
            const wcs = this.getWorkCoordinateSystem();
            const mapWCSToP = (wcs) => ({
                'G54': 1,
                'G55': 2,
                'G56': 3,
                'G57': 4,
                'G58': 5,
                'G59': 6
            }[wcs] || 0);
            const DIST_TO_CORNER_X = 20 + toolDiameter;
            const DIST_TO_CORNER_Y = 20 + toolDiameter;

            const MAX_PROBE_DIST_X = probeDepth;
            const MAX_PROBE_DIST_Y = probeDepth;
            const MAX_PROBE_DIST_Z = probeDepth;

            const CORNER_POSITION_X = 5 + toolDiameter / 2;
            const CORNER_POSITION_Y = 5 + toolDiameter / 2;
            const CORNER_POSITION_Z = 15;

            const RETRACT_DISTANCE_X = retractionDistance;
            const RETRACT_DISTANCE_Y = retractionDistance;
            const RETRACT_DISTANCE_Z = retractionDistance;

            let wcsProbeCommands = [
                'M120',
                '',
                '; Probe Z',
                gcode('G91 G38.2', {
                    Z: -MAX_PROBE_DIST_Z,
                    F: probeFeedrate
                }),
                '%wait',
                '',
                '; Set the active WCS Z0',
                gcode('G90 G10', {
                    L: 20,
                    P: mapWCSToP(wcs),
                    Z: CORNER_POSITION_Z
                }),
                '',
                '; Retract Z',
                gcode('G91 G0', {
                    Z: retractionDistance + RETRACT_DISTANCE_Z
                })
            ];

            if (doXY) {
                wcsProbeCommands = wcsProbeCommands.concat([
                    '',
                    '; Move to position ready to probe X',
                    gcode('G91 G0', {
                        X: dirX * DIST_TO_CORNER_X
                    }),
                    gcode('G91 G0', {
                        Z: -(RETRACT_DISTANCE_Z + 10)
                    }),
                    '%wait',
                    '',
                    '; Probe X',
                    gcode('G91 G38.2', {
                        X: -dirX * MAX_PROBE_DIST_X,
                        F: probeFeedrate
                    }),
                    '%wait',
                    '',
                    '; Set the active WCS X0',
                    gcode('G90 G10', {
                        L: 20,
                        P: mapWCSToP(wcs),
                        X: dirX * CORNER_POSITION_X,
                    }),
                    '',
                    '; Retract X',
                    gcode('G91 G0', {
                        X: dirX * RETRACT_DISTANCE_Z
                    }),
                    '',
                    '; Move to position ready to probe Y',
                    gcode('G91 G0', {
                        Y: dirY * DIST_TO_CORNER_Y
                    }),
                    gcode('G91 G0', {
                        X: -dirX * (DIST_TO_CORNER_X + RETRACT_DISTANCE_X)
                    }),
                    '%wait',
                    '',
                    '; Probe Y',
                    gcode('G91 G38.2', {
                        Y: -dirY * MAX_PROBE_DIST_Y,
                        F: probeFeedrate
                    }),
                    '%wait',
                    '',
                    '; Set the active WCS Y0',
                    gcode('G90 G10', {
                        L: 20,
                        P: mapWCSToP(wcs),
                        Y: dirY * CORNER_POSITION_Y
                    }),
                    '',
                    '; Retract Y',
                    gcode('G91 G0', {
                        Y: dirY * RETRACT_DISTANCE_Y
                    }),
                    '',
                    '; Retract Z',
                    gcode('G91 G0', {
                        Z: RETRACT_DISTANCE_Z + probeDepth
                    })
                ]);
            }

            wcsProbeCommands.push('', 'M121');

            return wcsProbeCommands;
        },
        runProbeCommands: (commands) => {
            controller.command('gcode', commands);
        }
    };

    controllerEvents = {
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': (options) => {
            const initialState = this.getInitialState();
            this.setState({ ...initialState });
        },
        'workflow:state': (workflowState) => {
            this.setState(state => ({
                workflow: {
                    state: workflowState
                }
            }));
        },
        'controller:state': (type, state) => {
            let units = this.state.units;

            // Grbl
            if (type === GRBL) {
                const { parserstate } = { ...state };
                const { modal = {} } = { ...parserstate };
                units = {
                    'G20': IMPERIAL_UNITS,
                    'G21': METRIC_UNITS
                }[modal.units] || units;
            }

            // Marlin
            if (type === MARLIN) {
                const { modal = {} } = { ...state };
                units = {
                    'G20': IMPERIAL_UNITS,
                    'G21': METRIC_UNITS
                }[modal.units] || units;
            }

            // Smoothie
            if (type === SMOOTHIE) {
                const { parserstate } = { ...state };
                const { modal = {} } = { ...parserstate };
                units = {
                    'G20': IMPERIAL_UNITS,
                    'G21': METRIC_UNITS
                }[modal.units] || units;
            }

            // TinyG
            if (type === TINYG) {
                const { sr } = { ...state };
                const { modal = {} } = { ...sr };
                units = {
                    'G20': IMPERIAL_UNITS,
                    'G21': METRIC_UNITS
                }[modal.units] || units;
            }

            // Swordfish
            if (type === SWORDFISH) {
                const { modal = {} } = { ...state };
                units = {
                    'G20': IMPERIAL_UNITS,
                    'G21': METRIC_UNITS
                }[modal.units] || units;
            }

            if (this.state.units !== units) {
                // Set `this.unitsDidChange` to true if the unit has changed
                this.unitsDidChange = true;
            }

            this.setState({
                units: units,
                controller: {
                    type: type,
                    state: state
                },
                toolDiameter: mapValueToUnits(this.config.get('toolDiameter'), units),
                probeDepth: mapValueToUnits(this.config.get('probeDepth'), units),
                probeFeedrate: mapValueToUnits(this.config.get('probeFeedrate'), units),
                probeThickness: mapValueToUnits(this.config.get('probeThickness'), units),
                retractionDistance: mapValueToUnits(this.config.get('retractionDistance'), units)
            });
        }
    };

    unitsDidChange = false;

    componentDidMount() {
        this.addControllerEvents();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            minimized
        } = this.state;

        this.config.set('minimized', minimized);

        // Do not save config settings if the units did change between in and mm
        if (this.unitsDidChange) {
            this.unitsDidChange = false;
            return;
        }

        const { units } = this.state;

        let {
            toolDiameter,
            probeDepth,
            probeFeedrate,
            probeThickness,
            retractionDistance
        } = this.state;

        // To save in mm
        if (units === IMPERIAL_UNITS) {
            toolDiameter = in2mm(toolDiameter);
            probeDepth = in2mm(probeDepth);
            probeFeedrate = in2mm(probeFeedrate);
            probeThickness = in2mm(probeThickness);
            retractionDistance = in2mm(retractionDistance);
        }
        this.config.set('toolDiameter', Number(toolDiameter));
        this.config.set('probeDepth', Number(probeDepth));
        this.config.set('probeFeedrate', Number(probeFeedrate));
        this.config.set('probeThickness', Number(probeThickness));
        this.config.set('retractionDistance', Number(retractionDistance));
    }

    getInitialState() {
        return {
            minimized: this.config.get('minimized', false),
            isFullscreen: false,
            canClick: false, // Defaults to true
            port: controller.port,
            units: METRIC_UNITS,
            controller: {
                type: controller.type,
                state: controller.state
            },
            workflow: {
                state: controller.workflow.state
            },
            modal: {
                name: MODAL_NONE,
                params: {}
            },
            toolDiameter: Number(this.config.get('toolDiameter') || 0).toFixed(3) * 1,
            probeDepth: Number(this.config.get('probeDepth') || 50).toFixed(3) * 1,
            probeFeedrate: Number(this.config.get('probeFeedrate') || 500).toFixed(3) * 1,
            probeThickness: Number(this.config.get('probeThickness') || 9).toFixed(3) * 1,
            retractionDistance: Number(this.config.get('retractionDistance') || 50).toFixed(3) * 1
        };
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

    getWorkCoordinateSystem() {
        const controllerType = this.state.controller.type;
        const controllerState = this.state.controller.state;
        const defaultWCS = 'G54';

        if (controllerType === GRBL) {
            return get(controllerState, 'parserstate.modal.wcs') || defaultWCS;
        }

        if (controllerType === MARLIN) {
            return get(controllerState, 'modal.wcs') || defaultWCS;
        }

        if (controllerType === SMOOTHIE) {
            return get(controllerState, 'parserstate.modal.wcs') || defaultWCS;
        }

        if (controllerType === TINYG) {
            return get(controllerState, 'sr.modal.wcs') || defaultWCS;
        }

        if (controllerType === SWORDFISH) {
            return get(controllerState, 'modal.wcs') || defaultWCS;
        }

        return defaultWCS;
    }

    canClick() {
        const {
            port,
            workflow,
            plate1IsSelected,
            plate2IsSelected,
            plate3IsSelected,
            plate4IsSelected
        } = this.state;

        const controllerType = this.state.controller.type;
        const controllerState = this.state.controller.state;

        if (!port) {
            return false;
        }
        if (workflow.state !== WORKFLOW_STATE_IDLE) {
            return false;
        }
        if (!includes([GRBL, MARLIN, SMOOTHIE, TINYG, SWORDFISH], controllerType)) {
            return false;
        }
        if (controllerType === GRBL) {
            const activeState = get(controllerState, 'status.activeState');
            const states = [
                GRBL_ACTIVE_STATE_IDLE
            ];
            if (!includes(states, activeState)) {
                return false;
            }
        }
        if (controllerType === MARLIN) {
            // Marlin does not have machine state
        }
        if (controllerType === SMOOTHIE) {
            const activeState = get(controllerState, 'status.activeState');
            const states = [
                SMOOTHIE_ACTIVE_STATE_IDLE
            ];
            if (!includes(states, activeState)) {
                return false;
            }
        }
        if (controllerType === TINYG) {
            const machineState = get(controllerState, 'sr.machineState');
            const states = [
                TINYG_MACHINE_STATE_READY,
                TINYG_MACHINE_STATE_STOP,
                TINYG_MACHINE_STATE_END
            ];
            if (!includes(states, machineState)) {
                return false;
            }
        }

        if (controllerType === SWORDFISH) {
            // Marlin does not have machine state
        }

        return plate1IsSelected || plate2IsSelected || plate3IsSelected || plate4IsSelected;
    }

    render() {
        const { widgetId } = this.props;
        const { minimized, isFullscreen } = this.state;
        const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);
        const state = {
            ...this.state,
            canClick: this.canClick()
        };
        const actions = {
            ...this.actions
        };

        return (
            <Widget fullscreen={isFullscreen}>
                <Widget.Header>
                    <Widget.Title>
                        <Widget.Sortable className={this.props.sortable.handleClassName}>
                            <i className="fa fa-bars" />
                            <Space width="8" />
                        </Widget.Sortable>
                        {isForkedWidget &&
                            <i className="fa fa-code-fork" style={{ marginRight: 5 }} />
                        }
                        {i18n._('Probe')}
                    </Widget.Title>
                    <Widget.Controls className={this.props.sortable.filterClassName}>
                        <Widget.Button
                            disabled={isFullscreen}
                            title={minimized ? i18n._('Expand') : i18n._('Collapse')}
                            onClick={actions.toggleMinimized}
                        >
                            <i
                                className={classNames(
                                    'fa',
                                    { 'fa-chevron-up': !minimized },
                                    { 'fa-chevron-down': minimized }
                                )}
                            />
                        </Widget.Button>
                        <Widget.DropdownButton
                            title={i18n._('More')}
                            toggle={<i className="fa fa-ellipsis-v" />}
                            onSelect={(eventKey) => {
                                if (eventKey === 'fullscreen') {
                                    actions.toggleFullscreen();
                                } else if (eventKey === 'fork') {
                                    this.props.onFork();
                                } else if (eventKey === 'remove') {
                                    this.props.onRemove();
                                }
                            }}
                        >
                            <Widget.DropdownMenuItem eventKey="fullscreen">
                                <i
                                    className={classNames(
                                        'fa',
                                        'fa-fw',
                                        { 'fa-expand': !isFullscreen },
                                        { 'fa-compress': isFullscreen }
                                    )}
                                />
                                <Space width="4" />
                                {!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
                            </Widget.DropdownMenuItem>
                            <Widget.DropdownMenuItem eventKey="fork">
                                <i className="fa fa-fw fa-code-fork" />
                                <Space width="4" />
                                {i18n._('Fork Widget')}
                            </Widget.DropdownMenuItem>
                            <Widget.DropdownMenuItem eventKey="remove">
                                <i className="fa fa-fw fa-times" />
                                <Space width="4" />
                                {i18n._('Remove Widget')}
                            </Widget.DropdownMenuItem>
                        </Widget.DropdownButton>
                    </Widget.Controls>
                </Widget.Header>
                <Widget.Content
                    className={classNames(
                        styles['widget-content'],
                        { [styles.hidden]: minimized }
                    )}
                >
                    {state.modal.name === MODAL_PREVIEW &&
                        <RunProbe state={state} actions={actions} />
                    }
                    <Probe
                        state={state}
                        actions={actions}
                    />
                </Widget.Content>
            </Widget>
        );
    }
}

export default ProbeWidget;
