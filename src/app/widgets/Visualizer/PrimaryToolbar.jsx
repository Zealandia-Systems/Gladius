/* eslint-disable jsx-a11y/anchor-is-valid */
import _ from 'lodash';
import classNames from 'classnames';
import colornames from 'colornames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Button } from 'app/components/Buttons';
import Dropdown, { MenuItem } from 'app/components/Dropdown';
import I18n from 'app/components/I18n';
import Space from 'app/components/Space';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import * as WebGL from 'app/lib/three/WebGL';
import {
    // Grbl
    GRBL,
    GRBL_ACTIVE_STATE_IDLE,
    GRBL_ACTIVE_STATE_RUN,
    GRBL_ACTIVE_STATE_HOLD,
    GRBL_ACTIVE_STATE_DOOR,
    GRBL_ACTIVE_STATE_HOME,
    GRBL_ACTIVE_STATE_SLEEP,
    GRBL_ACTIVE_STATE_ALARM,
    GRBL_ACTIVE_STATE_CHECK,
    // Marlin
    MARLIN,
    // Smoothie
    SMOOTHIE,
    SMOOTHIE_ACTIVE_STATE_IDLE,
    SMOOTHIE_ACTIVE_STATE_RUN,
    SMOOTHIE_ACTIVE_STATE_HOLD,
    SMOOTHIE_ACTIVE_STATE_DOOR,
    SMOOTHIE_ACTIVE_STATE_HOME,
    SMOOTHIE_ACTIVE_STATE_ALARM,
    SMOOTHIE_ACTIVE_STATE_CHECK,
    // TinyG
    TINYG,
    TINYG_MACHINE_STATE_INITIALIZING,
    TINYG_MACHINE_STATE_READY,
    TINYG_MACHINE_STATE_ALARM,
    TINYG_MACHINE_STATE_STOP,
    TINYG_MACHINE_STATE_END,
    TINYG_MACHINE_STATE_RUN,
    TINYG_MACHINE_STATE_HOLD,
    TINYG_MACHINE_STATE_PROBE,
    TINYG_MACHINE_STATE_CYCLE,
    TINYG_MACHINE_STATE_HOMING,
    TINYG_MACHINE_STATE_JOG,
    TINYG_MACHINE_STATE_INTERLOCK,
    TINYG_MACHINE_STATE_SHUTDOWN,
    TINYG_MACHINE_STATE_PANIC,
    // Swordfish
    SWORDFISH,
    SWORDFISH_ACTIVE_STATE_IDLE,
    SWORDFISH_ACTIVE_STATE_RUN,
    SWORDFISH_ACTIVE_STATE_HOLD,
    SWORDFISH_ACTIVE_STATE_DOOR,
    SWORDFISH_ACTIVE_STATE_PAUSED,
    SWORDFISH_ACTIVE_STATE_BUSY,
    SWORDFISH_ACTIVE_STATE_WAITING,
    SWORDFISH_ACTIVE_STATE_HOMING,
    SWORDFISH_ACTIVE_STATE_PROBING,
    SWORDFISH_ACTIVE_STATE_ALARM,
    SWORDFISH_ACTIVE_STATE_ESTOP,
    SWORDFISH_ACTIVE_STATE_CHECK,
    // Workflow
    WORKFLOW_STATE_IDLE
} from 'app/constants';
import styles from './index.styl';
import './wcsMenu.styl';

class PrimaryToolbar extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    canSendCommand() {
        const { state } = this.props;
        const { port, controller, workflow } = state;

        if (!port) {
            return false;
        }
        if (!controller.type || !controller.state) {
            return false;
        }
        if (workflow.state !== WORKFLOW_STATE_IDLE) {
            return false;
        }

        return true;
    }

    renderControllerType() {
        const { state } = this.props;
        const controllerType = state.controller.type;

        return (
            <div className={styles.controllerType}>
                {controllerType}
            </div>
        );
    }

    renderControllerState() {
        const { state } = this.props;
        const controllerType = state.controller.type;
        const controllerState = state.controller.state;
        let stateStyle = '';
        let stateText = '';

        if (controllerType === GRBL) {
            const activeState = _.get(controllerState, 'status.activeState');

            stateStyle = {
                [GRBL_ACTIVE_STATE_IDLE]: 'controller-state-default',
                [GRBL_ACTIVE_STATE_RUN]: 'controller-state-primary',
                [GRBL_ACTIVE_STATE_HOLD]: 'controller-state-warning',
                [GRBL_ACTIVE_STATE_DOOR]: 'controller-state-warning',
                [GRBL_ACTIVE_STATE_HOME]: 'controller-state-primary',
                [GRBL_ACTIVE_STATE_SLEEP]: 'controller-state-success',
                [GRBL_ACTIVE_STATE_ALARM]: 'controller-state-danger',
                [GRBL_ACTIVE_STATE_CHECK]: 'controller-state-info'
            }[activeState];

            stateText = {
                [GRBL_ACTIVE_STATE_IDLE]: i18n.t('controller:Grbl.activeState.idle'),
                [GRBL_ACTIVE_STATE_RUN]: i18n.t('controller:Grbl.activeState.run'),
                [GRBL_ACTIVE_STATE_HOLD]: i18n.t('controller:Grbl.activeState.hold'),
                [GRBL_ACTIVE_STATE_DOOR]: i18n.t('controller:Grbl.activeState.door'),
                [GRBL_ACTIVE_STATE_HOME]: i18n.t('controller:Grbl.activeState.home'),
                [GRBL_ACTIVE_STATE_SLEEP]: i18n.t('controller:Grbl.activeState.sleep'),
                [GRBL_ACTIVE_STATE_ALARM]: i18n.t('controller:Grbl.activeState.alarm'),
                [GRBL_ACTIVE_STATE_CHECK]: i18n.t('controller:Grbl.activeState.check')
            }[activeState];
        }

        if (controllerType === MARLIN) {
            // Marlin does not have machine state
        }

        if (controllerType === SMOOTHIE) {
            const activeState = _.get(controllerState, 'status.activeState');

            stateStyle = {
                [SMOOTHIE_ACTIVE_STATE_IDLE]: 'controller-state-default',
                [SMOOTHIE_ACTIVE_STATE_RUN]: 'controller-state-primary',
                [SMOOTHIE_ACTIVE_STATE_HOLD]: 'controller-state-warning',
                [SMOOTHIE_ACTIVE_STATE_DOOR]: 'controller-state-warning',
                [SMOOTHIE_ACTIVE_STATE_HOME]: 'controller-state-primary',
                [SMOOTHIE_ACTIVE_STATE_ALARM]: 'controller-state-danger',
                [SMOOTHIE_ACTIVE_STATE_CHECK]: 'controller-state-info'
            }[activeState];

            stateText = {
                [SMOOTHIE_ACTIVE_STATE_IDLE]: i18n.t('controller:Smoothie.activeState.idle'),
                [SMOOTHIE_ACTIVE_STATE_RUN]: i18n.t('controller:Smoothie.activeState.run'),
                [SMOOTHIE_ACTIVE_STATE_HOLD]: i18n.t('controller:Smoothie.activeState.hold'),
                [SMOOTHIE_ACTIVE_STATE_DOOR]: i18n.t('controller:Smoothie.activeState.door'),
                [SMOOTHIE_ACTIVE_STATE_HOME]: i18n.t('controller:Smoothie.activeState.home'),
                [SMOOTHIE_ACTIVE_STATE_ALARM]: i18n.t('controller:Smoothie.activeState.alarm'),
                [SMOOTHIE_ACTIVE_STATE_CHECK]: i18n.t('controller:Smoothie.activeState.check')
            }[activeState];
        }

        if (controllerType === TINYG) {
            const machineState = _.get(controllerState, 'sr.machineState');

            // https://github.com/synthetos/g2/wiki/Alarm-Processing
            stateStyle = {
                [TINYG_MACHINE_STATE_INITIALIZING]: 'controller-state-warning',
                [TINYG_MACHINE_STATE_READY]: 'controller-state-default',
                [TINYG_MACHINE_STATE_ALARM]: 'controller-state-danger',
                [TINYG_MACHINE_STATE_STOP]: 'controller-state-default',
                [TINYG_MACHINE_STATE_END]: 'controller-state-default',
                [TINYG_MACHINE_STATE_RUN]: 'controller-state-primary',
                [TINYG_MACHINE_STATE_HOLD]: 'controller-state-warning',
                [TINYG_MACHINE_STATE_PROBE]: 'controller-state-primary',
                [TINYG_MACHINE_STATE_CYCLE]: 'controller-state-primary',
                [TINYG_MACHINE_STATE_HOMING]: 'controller-state-primary',
                [TINYG_MACHINE_STATE_JOG]: 'controller-state-primary',
                [TINYG_MACHINE_STATE_INTERLOCK]: 'controller-state-warning',
                [TINYG_MACHINE_STATE_SHUTDOWN]: 'controller-state-danger',
                [TINYG_MACHINE_STATE_PANIC]: 'controller-state-danger'
            }[machineState];

            stateText = {
                [TINYG_MACHINE_STATE_INITIALIZING]: i18n.t('controller:TinyG.machineState.initializing'),
                [TINYG_MACHINE_STATE_READY]: i18n.t('controller:TinyG.machineState.ready'),
                [TINYG_MACHINE_STATE_ALARM]: i18n.t('controller:TinyG.machineState.alarm'),
                [TINYG_MACHINE_STATE_STOP]: i18n.t('controller:TinyG.machineState.stop'),
                [TINYG_MACHINE_STATE_END]: i18n.t('controller:TinyG.machineState.end'),
                [TINYG_MACHINE_STATE_RUN]: i18n.t('controller:TinyG.machineState.run'),
                [TINYG_MACHINE_STATE_HOLD]: i18n.t('controller:TinyG.machineState.hold'),
                [TINYG_MACHINE_STATE_PROBE]: i18n.t('controller:TinyG.machineState.probe'),
                [TINYG_MACHINE_STATE_CYCLE]: i18n.t('controller:TinyG.machineState.cycle'),
                [TINYG_MACHINE_STATE_HOMING]: i18n.t('controller:TinyG.machineState.homing'),
                [TINYG_MACHINE_STATE_JOG]: i18n.t('controller:TinyG.machineState.jog'),
                [TINYG_MACHINE_STATE_INTERLOCK]: i18n.t('controller:TinyG.machineState.interlock'),
                [TINYG_MACHINE_STATE_SHUTDOWN]: i18n.t('controller:TinyG.machineState.shutdown'),
                [TINYG_MACHINE_STATE_PANIC]: i18n.t('controller:TinyG.machineState.panic')
            }[machineState];
        }

        if (controllerType === SWORDFISH) {
            const activeState = _.get(controllerState, 'activeState');

            stateStyle = {
                [SWORDFISH_ACTIVE_STATE_IDLE]: 'controller-state-default',
                [SWORDFISH_ACTIVE_STATE_RUN]: 'controller-state-primary',
                [SWORDFISH_ACTIVE_STATE_HOLD]: 'controller-state-warning',
                [SWORDFISH_ACTIVE_STATE_DOOR]: 'controller-state-warning',
                [SWORDFISH_ACTIVE_STATE_PAUSED]: 'controller-state-info',
                [SWORDFISH_ACTIVE_STATE_BUSY]: 'controller-state-info',
                [SWORDFISH_ACTIVE_STATE_WAITING]: 'controller-state-info',
                [SWORDFISH_ACTIVE_STATE_HOMING]: 'controller-state-primary',
                [SWORDFISH_ACTIVE_STATE_PROBING]: 'controller-state-primary',
                [SWORDFISH_ACTIVE_STATE_ALARM]: 'controller-state-danger',
                [SWORDFISH_ACTIVE_STATE_ESTOP]: 'controller-state-danger',
                [SWORDFISH_ACTIVE_STATE_CHECK]: 'controller-state-info'
            }[activeState];

            stateText = {
                [SWORDFISH_ACTIVE_STATE_IDLE]: i18n.t('controller:Swordfish.activeState.idle'),
                [SWORDFISH_ACTIVE_STATE_RUN]: i18n.t('controller:Swordfish.activeState.run'),
                [SWORDFISH_ACTIVE_STATE_HOLD]: i18n.t('controller:Swordfish.activeState.hold'),
                [SWORDFISH_ACTIVE_STATE_DOOR]: i18n.t('controller:Swordfish.activeState.door'),
                [SWORDFISH_ACTIVE_STATE_PAUSED]: i18n.t('controller:Swordfish.activeState.paused'),
                [SWORDFISH_ACTIVE_STATE_BUSY]: i18n.t('controller:Swordfish.activeState.busy'),
                [SWORDFISH_ACTIVE_STATE_WAITING]: i18n.t('controller:Swordfish.activeState.waiting'),
                [SWORDFISH_ACTIVE_STATE_HOMING]: i18n.t('controller:Swordfish.activeState.homing'),
                [SWORDFISH_ACTIVE_STATE_PROBING]: i18n.t('controller:Swordfish.activeState.probing'),
                [SWORDFISH_ACTIVE_STATE_ALARM]: i18n.t('controller:Swordfish.activeState.alarm'),
                [SWORDFISH_ACTIVE_STATE_ESTOP]: i18n.t('controller:Swordfish.activeState.estop'),
                [SWORDFISH_ACTIVE_STATE_CHECK]: i18n.t('controller:Swordfish.activeState.check')
            }[activeState];

            if (state.statusMessage) {
                stateText += `: ${state.statusMessage}`;
            }
        }

        return (
            <div
                className={classNames(
                    styles.controllerState,
                    styles[stateStyle]
                )}
            >
                {stateText}
            </div>
        );
    }

    getWorkCoordinateSystem() {
        const { state } = this.props;
        const controllerType = state.controller.type;
        const controllerState = state.controller.state;
        const defaultWCS = 'G54.0';

        if (controllerType === GRBL) {
            return _.get(controllerState, 'parserstate.modal.wcs') || defaultWCS;
        }

        if (controllerType === MARLIN) {
            return _.get(controllerState, 'modal.wcs') || defaultWCS;
        }

        if (controllerType === SMOOTHIE) {
            return _.get(controllerState, 'parserstate.modal.wcs') || defaultWCS;
        }

        if (controllerType === TINYG) {
            return _.get(controllerState, 'sr.modal.wcs') || defaultWCS;
        }

        if (controllerType === SWORDFISH) {
            return _.get(controllerState, 'modal.wcs') || defaultWCS;
        }

        return defaultWCS;
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

    getTitle(wcs) {
        return `${wcs} (P${this.wcsToP(wcs)})`;
    }

    renderWCSSubItems(wcs, code) {
        return [...Array(10).keys()].map(subcode => {
            const cmd = `G${code}.${subcode}`;
            const p = this.wcsToP(cmd);
            /*return (
                <MenuItem
                    key={p}
                    active={wcs === cmd}
                    onSelect={() => controller.command('gcode', cmd)}
                >
                    {cmd} (P{p})
                </MenuItem>
            );*/
            return (
                <li
                    role="presentation"
                    key={p}
                    className={
                        classNames({
                            'menu-item': true,
                            active: wcs === cmd
                        })
                    }
                >
                    <a
                        role="menuitem"
                        tabIndex="-1"
                        href="#"
                        onClick={(event) => {
                            controller.command('gcode', cmd);
                            //this.dropdownButton.onClick(event);
                        }}
                    >
                        {cmd} (P{p})
                    </a>
                </li>
            );
        });
    }

    renderWCSItems(wcs, activeCode) {
        return [54, 55, 56, 57, 58, 59].map(code => {
            const cmd = `G${code}`;
            const active = activeCode === code;
            return (
                <li
                    role="presentation"
                    key={code}
                    className={
                        classNames({
                            'dropdown-submenu': true,
                            active: active
                        })
                    }
                >
                    <a
                        role="menuitem"
                        tabIndex="-1"
                        href="#"
                    >
                        {cmd}
                    </a>
                    <ul className="dropdown-menu">
                        {this.renderWCSSubItems(wcs, code)}
                    </ul>
                </li>
            );
        });
    }

    render() {
        const { state, actions } = this.props;
        const { disabled, gcode, projection, objects } = state;
        const canSendCommand = this.canSendCommand();
        const canToggleOptions = WebGL.isWebGLAvailable() && !disabled;
        const wcs = this.getWorkCoordinateSystem();
        const { code } = this.splitWCS(wcs);

        return (
            <div className={styles.primaryToolbar}>
                {this.renderControllerState()}
                <div className="pull-right">
                    <Dropdown
                        pullRight
                        disabled={!canSendCommand}
                        rootCloseEvent="mousedown"
                    >
                        <Dropdown.Toggle
                            btnSize="sm"
                            title={i18n._('Work Coordinate System')}
                        >
                            {this.getTitle(wcs)}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                            <MenuItem header className="dropdown-header">{i18n._('Work Coordinate System')}</MenuItem>
                            {this.renderWCSItems(wcs, code)}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown
                        pullRight
                    >
                        <Button
                            btnSize="sm"
                            btnStyle="flat"
                            title={(!WebGL.isWebGLAvailable() || disabled)
                                ? i18n._('Enable 3D View')
                                : i18n._('Disable 3D View')
                            }
                            onClick={actions.toggle3DView}
                        >
                            {(!WebGL.isWebGLAvailable() || disabled)
                                ? <i className="fa fa-toggle-off" />
                                : <i className="fa fa-toggle-on" />
                            }
                            {i18n._('3D View')}
                        </Button>
                        <Dropdown.Toggle btnSize="sm" />
                        <Dropdown.Menu>
                            <MenuItem
                                style={{ color: '#222' }}
                                header
                            >
                                {WebGL.isWebGLAvailable() && (
                                    <I18n>
                                        {'WebGL: '}
                                        <span style={{ color: colornames('royalblue') }}>
                                            Enabled
                                        </span>
                                    </I18n>
                                )}
                                {!WebGL.isWebGLAvailable() && (
                                    <I18n>
                                        {'WebGL: '}
                                        <span style={{ color: colornames('crimson') }}>
                                            Disabled
                                        </span>
                                    </I18n>
                                )}
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem header>
                                {i18n._('Projection')}
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toPerspectiveProjection}
                            >
                                <i className={classNames('fa', 'fa-fw', { 'fa-check': projection !== 'orthographic' })} />
                                <Space width={8} />
                                {i18n._('Perspective Projection')}
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toOrthographicProjection}
                            >
                                <i className={classNames('fa', 'fa-fw', { 'fa-check': projection === 'orthographic' })} />
                                <Space width={8} />
                                {i18n._('Orthographic Projection')}
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toggleGCodeFilename}
                            >
                                {gcode.displayName
                                    ? <i className="fa fa-toggle-on fa-fw" />
                                    : <i className="fa fa-toggle-off fa-fw" />
                                }
                                <Space width={8} />
                                {i18n._('Display G-code Filename')}
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toggleLimitsVisibility}
                            >
                                {objects.limits.visible
                                    ? <i className="fa fa-toggle-on fa-fw" />
                                    : <i className="fa fa-toggle-off fa-fw" />
                                }
                                <Space width={8} />
                                {objects.limits.visible
                                    ? i18n._('Hide Limits')
                                    : i18n._('Show Limits')
                                }
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toggleCoordinateSystemVisibility}
                            >
                                {objects.coordinateSystem.visible
                                    ? <i className="fa fa-toggle-on fa-fw" />
                                    : <i className="fa fa-toggle-off fa-fw" />
                                }
                                <Space width={8} />
                                {objects.coordinateSystem.visible
                                    ? i18n._('Hide Coordinate System')
                                    : i18n._('Show Coordinate System')
                                }
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toggleGridLineNumbersVisibility}
                            >
                                {objects.gridLineNumbers.visible
                                    ? <i className="fa fa-toggle-on fa-fw" />
                                    : <i className="fa fa-toggle-off fa-fw" />
                                }
                                <Space width={8} />
                                {objects.gridLineNumbers.visible
                                    ? i18n._('Hide Grid Line Numbers')
                                    : i18n._('Show Grid Line Numbers')
                                }
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggleOptions}
                                onSelect={actions.toggleCuttingToolVisibility}
                            >
                                {objects.cuttingTool.visible
                                    ? <i className="fa fa-toggle-on fa-fw" />
                                    : <i className="fa fa-toggle-off fa-fw" />
                                }
                                <Space width={8} />
                                {objects.cuttingTool.visible
                                    ? i18n._('Hide Cutting Tool')
                                    : i18n._('Show Cutting Tool')
                                }
                            </MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        );
    }
}

export default PrimaryToolbar;
