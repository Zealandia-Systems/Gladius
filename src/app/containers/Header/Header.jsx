import classNames from 'classnames';
import React, { PureComponent } from 'react';
import { Nav, Navbar, NavDropdown, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import semver from 'semver';
import without from 'lodash/without';
import Push from 'push.js';
import api from 'app/api';
import Anchor from 'app/components/Anchor';
import settings from 'app/config/settings';
import combokeys from 'app/lib/combokeys';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import ConnectionWidget from './Connection';
import QuickAccessToolbar from './QuickAccessToolbar';
import styles from './index.styl';
import Logo from './Logo';

const newUpdateAvailableTooltip = () => {
    return (
        <Tooltip
            id="navbarBrandTooltip"
            style={{ color: '#fff' }}
        >
            <div>{i18n._('New update available')}</div>
        </Tooltip>
    );
};

class Header extends PureComponent {
    static propTypes = {
    };

    state = this.getInitialState();

    actions = {
        requestPushPermission: () => {
            const onGranted = () => {
                this.setState({ pushPermission: Push.Permission.GRANTED });
            };
            const onDenied = () => {
                this.setState({ pushPermission: Push.Permission.DENIED });
            };
            // Note that if "Permission.DEFAULT" is returned, no callback is executed
            const permission = Push.Permission.request(onGranted, onDenied);
            if (permission === Push.Permission.DEFAULT) {
                this.setState({ pushPermission: Push.Permission.DEFAULT });
            }
        },
        checkForUpdates: async () => {
            try {
                const res = await api.getState();
                const { checkForUpdates } = res.body;

                if (checkForUpdates) {
                    const res = await api.getLatestVersion();
                    const { time, version } = res.body;

                    this._isMounted && this.setState({
                        latestVersion: version,
                        latestTime: time
                    });
                }
            } catch (res) {
                // Ignore error
            }
        },
        fetchCommands: async () => {
            try {
                const res = await api.commands.fetch({ paging: false });
                const { records: commands } = res.body;

                this._isMounted && this.setState({
                    commands: commands.filter(command => command.enabled)
                });
            } catch (res) {
                // Ignore error
            }
        },
        runCommand: async (cmd) => {
            try {
                const res = await api.commands.run(cmd.id);
                const { taskId } = res.body;

                this.setState({
                    commands: this.state.commands.map(c => {
                        return (c.id === cmd.id) ? { ...c, taskId: taskId, err: null } : c;
                    })
                });
            } catch (res) {
                // Ignore error
            }
        }
    };

    actionHandlers = {
        CONTROLLER_COMMAND: (event, { command }) => {
            // feedhold, cyclestart, homing, unlock, reset
            controller.command(command);
        }
    };

    controllerEvents = {
        'config:change': () => {
            this.actions.fetchCommands();
        },
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': () => {
            this.setState({ port: '' });
        },
        'task:start': (taskId) => {
            this.setState({
                runningTasks: this.state.runningTasks.concat(taskId)
            });
        },
        'task:finish': (taskId, code) => {
            const err = (code !== 0) ? new Error(`errno=${code}`) : null;
            let cmd = null;

            this.setState({
                commands: this.state.commands.map(c => {
                    if (c.taskId !== taskId) {
                        return c;
                    }
                    cmd = c;
                    return {
                        ...c,
                        taskId: null,
                        err: err
                    };
                }),
                runningTasks: without(this.state.runningTasks, taskId)
            });

            if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
                Push.create(cmd.title, {
                    body: code === 0
                        ? i18n._('Command succeeded')
                        : i18n._('Command failed ({{err}})', { err: err }),
                    icon: 'images/gladius-logo-32x32.png',
                    timeout: 10 * 1000,
                    onClick: function () {
                        window.focus();
                        this.close();
                    }
                });
            }
        },
        'task:error': (taskId, err) => {
            let cmd = null;

            this.setState({
                commands: this.state.commands.map(c => {
                    if (c.taskId !== taskId) {
                        return c;
                    }
                    cmd = c;
                    return {
                        ...c,
                        taskId: null,
                        err: err
                    };
                }),
                runningTasks: without(this.state.runningTasks, taskId)
            });

            if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
                Push.create(cmd.title, {
                    body: i18n._('Command failed ({{err}})', { err: err }),
                    icon: 'images/gladius-logo-32x32.png',
                    timeout: 10 * 1000,
                    onClick: function () {
                        window.focus();
                        this.close();
                    }
                });
            }
        }
    };

    _isMounted = false;

    getInitialState() {
        let pushPermission = '';
        try {
            // Push.Permission.get() will throw an error if Push is not supported on this device
            pushPermission = Push.Permission.get();
        } catch (e) {
            // Ignore
        }

        return {
            pushPermission: pushPermission,
            commands: [],
            runningTasks: [],
            currentVersion: settings.version,
            latestVersion: settings.version,
            outdatedPosts: []
        };
    }

    componentDidMount() {
        this._isMounted = true;

        this.addActionHandlers();
        this.addControllerEvents();

        // Initial actions
        this.actions.checkForUpdates();
        this.actions.fetchCommands();
    }

    componentWillUnmount() {
        this._isMounted = false;

        this.removeActionHandlers();
        this.removeControllerEvents();

        this.runningTasks = [];
    }

    addActionHandlers() {
        Object.keys(this.actionHandlers).forEach(eventName => {
            const callback = this.actionHandlers[eventName];
            combokeys.on(eventName, callback);
        });
    }

    removeActionHandlers() {
        Object.keys(this.actionHandlers).forEach(eventName => {
            const callback = this.actionHandlers[eventName];
            combokeys.removeListener(eventName, callback);
        });
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
        const { pushPermission, commands, runningTasks, currentVersion, latestVersion, port } = this.state;
        const newUpdateAvailable = semver.lt(currentVersion, latestVersion);
        const tooltip = newUpdateAvailable ? newUpdateAvailableTooltip() : <div />;
        const showCommands = commands.length > 0;

        return (
            <Navbar
                fixedTop
                fluid
                inverse
                style={{
                    border: 'none',
                    margin: 0
                }}
            >
                <Navbar.Header
                    style={{ height: '70px' }}
                >
                    <OverlayTrigger
                        overlay={tooltip}
                        placement="right"
                    >
                        <Logo
                            settings={settings}
                            newUpdateAvailable={newUpdateAvailable}
                        />
                    </OverlayTrigger>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavDropdown
                            id="nav-dropdown-menu"
                            title={(
                                <div title={i18n._('Options')}>
                                    <i className="fa fa-fw fa-ellipsis-v" />
                                    {this.state.runningTasks.length > 0 && (
                                        <span
                                            className="label label-primary"
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4
                                            }}
                                        >
                                            N
                                        </span>
                                    )}
                                </div>
                            )}
                            noCaret
                        >
                            {showCommands && (
                                <MenuItem header>
                                    {i18n._('Command')}
                                    {pushPermission === Push.Permission.GRANTED && (
                                        <span className="pull-right">
                                            <i className="fa fa-fw fa-bell-o" />
                                        </span>
                                    )}
                                    {pushPermission === Push.Permission.DENIED && (
                                        <span className="pull-right">
                                            <i className="fa fa-fw fa-bell-slash-o" />
                                        </span>
                                    )}
                                    {pushPermission === Push.Permission.DEFAULT && (
                                        <span className="pull-right">
                                            <Anchor
                                                className={styles.btnIcon}
                                                onClick={this.actions.requestPushPermission}
                                                title={i18n._('Show notifications')}
                                            >
                                                <i className="fa fa-fw fa-bell" />
                                            </Anchor>
                                        </span>
                                    )}
                                </MenuItem>
                            )}
                            {showCommands && commands.map((cmd) => {
                                const isTaskRunning = runningTasks.indexOf(cmd.taskId) >= 0;

                                return (
                                    <MenuItem
                                        key={cmd.id}
                                        disabled={cmd.disabled}
                                        onSelect={() => {
                                            this.actions.runCommand(cmd);
                                        }}
                                    >
                                        <span title={cmd.command}>{cmd.title || cmd.command}</span>
                                        <span className="pull-right">
                                            <i
                                                className={classNames(
                                                    'fa',
                                                    'fa-fw',
                                                    { 'fa-circle-o-notch': isTaskRunning },
                                                    { 'fa-spin': isTaskRunning },
                                                    { 'fa-exclamation-circle': cmd.err },
                                                    { 'text-error': cmd.err }
                                                )}
                                                title={cmd.err}
                                            />
                                        </span>
                                    </MenuItem>
                                );
                            })}
                            {showCommands &&
                                <MenuItem divider />
                            }
                            <MenuItem
                                href="http://help.zealandia.systems/"
                                target="_blank"
                            >
                                {i18n._('Help')}
                            </MenuItem>
                            <MenuItem
                                href="https://zealandia.systems/pages/support"
                                target="_blank"
                            >
                                {i18n._('Report an issue')}
                            </MenuItem>
                        </NavDropdown>
                    </Nav>
                    <QuickAccessToolbar port={port} state={this.state} actions={this.actions} />
                    <ConnectionWidget widgetId="connection" />
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;
