import PropTypes from 'prop-types';
import { filter, flatten, zip, get, mapValues } from 'lodash';
import React, { PureComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import api from 'app/api';
import Panel from 'app/components/Panel';
import Space from 'app/components/Space';
import controller from 'app/lib/controller';
import { mapPositionToUnits } from 'app/lib/units';
import WidgetConfig from 'app/widgets/WidgetConfig';
import Axis from './Axis';
import UnitsMenu from './UnitsMenu';
import ActionMenu from './ActionMenu';
import WCSMenu from './WCSMenu';
import styles from './Coordinates.styl';

import {
    // Axes
    AXIS_X,
    AXIS_Y,
    AXIS_Z,
    AXIS_A,
    AXIS_B,
    AXIS_C,
    // Units
    IMPERIAL_UNITS,
    METRIC_UNITS,
    // Workflow
    WORKFLOW_STATE_RUNNING
} from '../../../constants';
import {
    MODAL_NONE,
    DEFAULT_AXES
} from './constants';

class Coordinates extends PureComponent {
    static propTypes = {
        jog: PropTypes.object.isRequired
    };

    axes = [
        { name: AXIS_X, enabled: true },
        { name: AXIS_Y, enabled: true },
        { name: AXIS_Z, enabled: true },
        { name: AXIS_A, enabled: false },
        { name: AXIS_B, enabled: false },
        { name: AXIS_C, enabled: false }
    ];

    config = new WidgetConfig('coordinates');

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
        getWorkCoordinateSystem: () => {
            return get(this.state.controller.state, 'modal.wcs') || 'G54.0';
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
        setWorkOffsets: (axis, value) => {
            const wcs = this.actions.getWorkCoordinateSystem();
            const p = this.actions.wcsToP(wcs);
            axis = (axis || '').toUpperCase();
            value = Number(value) || 0;

            const gcode = `G10 L20 P${p} ${axis}${value}`;
            controller.command('gcode', gcode);
        },
        toggleMDIMode: () => {
            this.setState(state => ({
                mdi: {
                    ...state.mdi,
                    disabled: !state.mdi.disabled
                }
            }));
        }
    };

    controllerEvents = {
        'config:change': () => {
            this.fetchMDICommands();
        },
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': (options) => {
            const initialState = this.getInitialState();
            this.setState(state => ({
                ...initialState,
                mdi: {
                    ...initialState.mdi,
                    commands: [...state.mdi.commands]
                }
            }));
        },
        'workflow:state': (workflowState) => {
            this.setState(state => ({
                workflow: {
                    ...state.workflow,
                    state: workflowState
                }
            }));
        },
        'controller:settings': (type, controllerSettings) => {
            this.setState(state => ({
                controller: {
                    ...state.controller,
                    type: type,
                    settings: controllerSettings
                }
            }));
        },
        'controller:state': (type, controllerState) => {
            const { mpos, wpos, modal = {} } = { ...controllerState };
            const units = {
                'G20': IMPERIAL_UNITS,
                'G21': METRIC_UNITS
            }[modal.units] || this.state.units;

            this.setState(state => ({
                units: units,
                controller: {
                    ...state.controller,
                    type: type,
                    state: controllerState
                },
                // Machine position is always reported in mm
                machinePosition: {
                    ...state.machinePosition,
                    ...mpos
                },
                // Work position is always reported in mm
                workPosition: {
                    ...state.workPosition,
                    ...wpos
                }
            }));
        }
    };

    shuttleControl = null;

    fetchMDICommands = async () => {
        try {
            let res;
            res = await api.mdi.fetch();
            const { records: commands } = res.body;
            this.setState(state => ({
                mdi: {
                    ...state.mdi,
                    commands: commands
                }
            }));
        } catch (err) {
            // Ignore error
        }
    };

    componentDidMount() {
        this.fetchMDICommands();
        this.addControllerEvents();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            minimized,
            axes,
            mdi
        } = this.state;

        this.config.set('minimized', minimized);
        this.config.set('axes', axes);
        this.config.set('mdi.disabled', mdi.disabled);
    }

    getInitialState() {
        return {
            minimized: this.config.get('minimized', false),
            isFullscreen: false,
            canClick: true, // Defaults to true
            port: controller.port,
            units: METRIC_UNITS,
            controller: {
                type: controller.type,
                settings: controller.settings,
                state: controller.state
            },
            workflow: {
                state: controller.workflow.state
            },
            modal: {
                name: MODAL_NONE,
                params: {}
            },
            axes: this.config.get('axes', DEFAULT_AXES),
            machinePosition: { // Machine position
                x: '0.000',
                y: '0.000',
                z: '0.000',
                a: '0.000',
                b: '0.000',
                c: '0.000'
            },
            workPosition: { // Work position
                x: '0.000',
                y: '0.000',
                z: '0.000',
                a: '0.000',
                b: '0.000',
                c: '0.000'
            },
            mdi: {
                disabled: this.config.get('mdi.disabled'),
                commands: []
            }
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

    canClick() {
        const { port, workflow } = this.state;

        if (!port) {
            return false;
        }

        if (workflow.state === WORKFLOW_STATE_RUNNING) {
            return false;
        }

        return true;
    }

    render() {
        const { units, machinePosition, workPosition } = this.state;
        const state = {
            ...this.state,
            // Determine if the motion button is clickable
            canClick: this.canClick(),
            // Output machine position with the display units
            machinePosition: mapValues(machinePosition, (pos, axis) => {
                return String(mapPositionToUnits(pos, units));
            }),
            // Output work position with the display units
            workPosition: mapValues(workPosition, (pos, axis) => {
                return String(mapPositionToUnits(pos, units));
            })
        };
        const { jog } = this.props;

        const wcs = this.actions.getWorkCoordinateSystem();

        const enabledAxes = this.axes.filter(axis => axis.enabled);

        const dividers = enabledAxes.slice(0, enabledAxes.length - 1).map((v) => (<tr key={`${v.name}-gap`}><td colSpan="3"><hr className={styles.divider} /></td></tr>));
        const axes = filter(flatten(zip(enabledAxes.map((axis) => (
            <Axis
                key={axis.name}
                axis={axis}
                canClick={state.canClick}
                units={state.units}
                axes={state.axes}
                machinePosition={state.machinePosition}
                workPosition={state.workPosition}
                jog={jog}
                actions={this.actions}
            />
        )), dividers)), (x) => x !== undefined);

        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title>
                        <i className="fa fa-map-marker-alt" />
                        <Space width="8" />
                        Coordinates
                    </Panel.Title>
                    <Panel.Controls>
                        <ButtonGroup style={{ float: 'right' }}>
                            <UnitsMenu
                                canClick={state.canClick}
                                units={state.units}
                            />
                            <WCSMenu
                                actions={this.actions}
                                wcs={wcs}
                                canClick={state.canClick}
                            />
                            <ActionMenu
                                actions={this.actions}
                                bsSize="sm"
                                wcs={wcs}
                                axes="X0 Y0 Z0"
                                canClick={state.canClick}
                            />
                        </ButtonGroup>
                    </Panel.Controls>
                </Panel.Heading>
                <Panel.Body className={styles.panelBody}>
                    <table className={styles.axes}>
                        <tbody>
                            {axes}
                        </tbody>
                    </table>
                </Panel.Body>
            </Panel>
        );
    }
}

export default Coordinates;
