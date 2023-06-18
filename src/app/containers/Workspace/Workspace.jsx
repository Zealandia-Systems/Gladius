import _ from 'lodash';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import pubsub from 'pubsub-js';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import semver from 'semver';
import { Button, ButtonGroup, ButtonToolbar } from 'app/components/Buttons';
import api from 'app/api';
import {
    WORKFLOW_STATE_IDLE
} from 'app/constants';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import log from 'app/lib/log';
import store from 'app/store';
import * as widgetManager from './WidgetManager';
import DefaultWidgets from './DefaultWidgets';
import PrimaryWidgets from './PrimaryWidgets';
import SecondaryWidgets from './SecondaryWidgets';
import FeederPaused from './modals/FeederPaused';
import FeederWait from './modals/FeederWait';
import Prompt from './modals/Prompt';
import ServerDisconnected from './modals/ServerDisconnected';
import OutdatedPosts from './modals/OutdatedPosts';
import Export from './modals/Export';
import styles from './index.styl';
import {
    MODAL_NONE,
    MODAL_FEEDER_PAUSED,
    MODAL_FEEDER_WAIT,
    MODAL_PROMPT,
    MODAL_SERVER_DISCONNECTED,
    MODAL_OUTDATED_POSTS,
    MODAL_EXPORT,
    MODAL_SOFTWARE_UPDATES
} from './constants';
import SoftwareUpdates from './modals/SoftwareUpdates';

const WAIT = '%wait';

const startWaiting = () => {
    // Adds the 'wait' class to <html>
    const root = document.documentElement;
    root.classList.add('wait');
};
const stopWaiting = () => {
    // Adds the 'wait' class to <html>
    const root = document.documentElement;
    root.classList.remove('wait');
};

class Workspace extends PureComponent {
    static propTypes = {
    };

    state = {
        mounted: false,
        port: '',
        modal: {
            name: MODAL_NONE,
            params: {}
        },
        isDraggingFile: false,
        isDraggingWidget: false,
        isUploading: false,
        showPrimaryContainer: store.get('workspace.container.primary.show'),
        showSecondaryContainer: store.get('workspace.container.secondary.show'),
        inactiveCount: _.size(widgetManager.getInactiveWidgets())
    };

    action = {
        openModal: (name = MODAL_NONE, params = {}) => {
            this.setState(state => ({
                modal: {
                    name: name,
                    params: params
                }
            }));
        },
        closeModal: () => {
            this.setState(state => ({
                modal: {
                    name: MODAL_NONE,
                    params: {}
                }
            }));
        },
        updateModalParams: (params = {}) => {
            this.setState(state => ({
                modal: {
                    ...state.modal,
                    params: {
                        ...state.modal.params,
                        ...params
                    }
                }
            }));
        },
        checkForOutdatedPosts: async () => {
            try {
                const { body: posts } = (await api.posts.fetch());

                const outdated = posts.map(post => {
                    const { postVersion, installedPostVersion } = post;

                    if (installedPostVersion === 'unknown') {
                        return post;
                    }

                    return semver.lt(installedPostVersion ?? '0.0.0', postVersion)
                        ? post
                        : null;
                }).filter(post => post != null);

                const ignore = store.get('containers.settings.posts.ignore') ?? {};

                const ignoreAll = posts.reduce((prev, curr) => {
                    const { application, applicationVersion } = curr;
                    const id = `${application}:${applicationVersion}`;

                    return prev || (ignore[id] ?? false);
                }, false);

                if (outdated.length > 0 && !ignoreAll) {
                    this.action.openModal(MODAL_OUTDATED_POSTS, { posts, outdated });
                }
            } catch (res) {
                //console.log(res);
            }
        }
    };

    sortableGroup = {
        primary: null,
        secondary: null
    };

    primaryContainer = null;

    secondaryContainer = null;

    primaryToggler = null;

    secondaryToggler = null;

    primaryWidgets = null;

    secondaryWidgets = null;

    defaultContainer = null;

    controllerSettings = null;

    controllerEvents = {
        'controller:settings': async (controllerName, payload) => {
            //payload contains firmware details
            //controller state isn't updated or firmware is out of data
            if (payload !== null && payload.firmware !== null && (this.controllerSettings === null || payload.firmware !== this.controllerSettings.firmware)) {
                this.controllerSettings = payload;
                const res = (await api.getLatestSwordFishVersion()).body;
                
                const showUpdates = store.get('workspace.updates.showUpdates', {});
                const showVersion = store.get('workspace.updates.version', {});

                if (this.controllerSettings.firmware !== null && semver.lt(this.controllerSettings.firmware.version, res.version) && (showUpdates || semver.lt(showVersion, res.version))) {
                    this.action.openModal(MODAL_SOFTWARE_UPDATES, {
                        title: 'Updates Advised: ',
                        versions: [{ name: res.name, current: this.controllerSettings.firmware.version, new: res.version, link: 'https://github.com/Zealandia-Systems/Swordfish' }]
                    });
                }
            }
        },
        'connect': () => {
            if (controller.connected) {
                this.action.closeModal();
            } else {
                this.action.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'connect_error': () => {
            if (controller.connected) {
                this.action.closeModal();
            } else {
                this.action.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'disconnect': () => {
            if (controller.connected) {
                this.action.closeModal();
            } else {
                this.action.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': (options) => {
            this.setState({ port: '' });
        },
        'feeder:status': (status) => {
            const { modal } = this.state;
            const { hold, holdReason } = { ...status };

            if (!hold) {
                if (_.includes([MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT], modal.name)) {
                    this.action.closeModal();
                }
                return;
            }

            const { err, data } = { ...holdReason };

            if (err) {
                this.action.openModal(MODAL_FEEDER_PAUSED, {
                    title: i18n._('Error')
                });
                return;
            }

            if (data === WAIT) {
                this.action.openModal(MODAL_FEEDER_WAIT, {
                    title: '%wait'
                });
                return;
            }

            const title = {
                'M0': i18n._('M0 Program Pause'),
                'M1': i18n._('M1 Program Pause'),
                'M2': i18n._('M2 Program End'),
                'M30': i18n._('M30 Program End'),
                'M6': i18n._('M6 Tool Change'),
                'M109': i18n._('M109 Set Extruder Temperature'),
                'M190': i18n._('M190 Set Heated Bed Temperature')
            }[data] || data;

            this.action.openModal(MODAL_FEEDER_PAUSED, {
                title: title
            });
        },
        'prompt:open': (prompt) => {
            const { message } = prompt;

            const buttons = Object.keys(prompt).filter(key => {
                return /^button[0-9]+$/.test(key);
            }).map(key => {
                return {
                    label: prompt[key],
                    response: Number(key.substring(6))
                };
            });

            this.action.openModal(MODAL_PROMPT, {
                title: message,
                resume: prompt.resume || false,
                buttons: buttons
            });
        },
        'export': ({ keys, data }) => {
            console.log(JSON.stringify(keys));
            console.log(JSON.stringify(data));
            this.action.openModal(MODAL_EXPORT, {
                keys,
                data
            });
        }
    };

    widgetEventHandler = {
        onForkWidget: (widgetId) => {
            // TODO
        },
        onRemoveWidget: (widgetId) => {
            const inactiveWidgets = widgetManager.getInactiveWidgets();
            this.setState({ inactiveCount: inactiveWidgets.length });
        },
        onDragStart: () => {
            const { isDraggingWidget } = this.state;
            if (!isDraggingWidget) {
                this.setState({ isDraggingWidget: true });
            }
        },
        onDragEnd: () => {
            const { isDraggingWidget } = this.state;
            if (isDraggingWidget) {
                this.setState({ isDraggingWidget: false });
            }
        }
    };

    togglePrimaryContainer = () => {
        const { showPrimaryContainer } = this.state;
        this.setState({ showPrimaryContainer: !showPrimaryContainer });

        // Publish a 'resize' event
        pubsub.publish('resize'); // Also see "widgets/Visualizer"
    };

    toggleSecondaryContainer = () => {
        const { showSecondaryContainer } = this.state;
        this.setState({ showSecondaryContainer: !showSecondaryContainer });

        // Publish a 'resize' event
        pubsub.publish('resize'); // Also see "widgets/Visualizer"
    };

    resizeDefaultContainer = () => {
        const primaryContainer = ReactDOM.findDOMNode(this.primaryContainer);
        const secondaryContainer = ReactDOM.findDOMNode(this.secondaryContainer);
        const primaryToggler = ReactDOM.findDOMNode(this.primaryToggler);
        const secondaryToggler = ReactDOM.findDOMNode(this.secondaryToggler);
        const defaultContainer = ReactDOM.findDOMNode(this.defaultContainer);
        const { showPrimaryContainer, showSecondaryContainer } = this.state;

        { // Mobile-Friendly View
            const disableHorizontalScroll = !(showPrimaryContainer && showSecondaryContainer);

            if (disableHorizontalScroll) {
                // Disable horizontal scroll
                document.body.scrollLeft = 0;
                document.body.style.overflowX = 'hidden';
            } else {
                // Enable horizontal scroll
                document.body.style.overflowX = '';
            }
        }

        if (showPrimaryContainer) {
            defaultContainer.style.left = primaryContainer.offsetWidth + 'px';
        } else {
            defaultContainer.style.left = primaryToggler.offsetWidth + 'px';
        }

        if (showSecondaryContainer) {
            defaultContainer.style.right = secondaryContainer.offsetWidth + 'px';
        } else {
            defaultContainer.style.right = secondaryToggler.offsetWidth + 'px';
        }

        // Publish a 'resize' event
        pubsub.publish('resize'); // Also see "widgets/Visualizer"
    };

    onDrop = (files) => {
        const { port } = this.state;

        if (!port) {
            return;
        }

        let file = files[0];
        let reader = new FileReader();

        reader.onloadend = (event) => {
            const { result, error } = event.target;

            if (error) {
                log.error(error);
                return;
            }

            log.debug('FileReader:', _.pick(file, [
                'lastModified',
                'lastModifiedDate',
                'meta',
                'name',
                'size',
                'type'
            ]));

            startWaiting();
            this.setState({ isUploading: true });

            const name = file.name;
            const gcode = result;

            api.loadGCode({ port, name, gcode })
                .then((res) => {
                    const { name = '', gcode = '' } = { ...res.body };
                    pubsub.publish('gcode:load', { name, gcode });
                })
                .catch((res) => {
                    log.error('Failed to upload G-code file');
                })
                .then(() => {
                    stopWaiting();
                    this.setState({ isUploading: false });
                });
        };

        try {
            reader.readAsText(file);
        } catch (err) {
            // Ignore error
        }
    };

    updateWidgetsForPrimaryContainer = () => {
        widgetManager.show((activeWidgets, inactiveWidgets) => {
            const widgets = Object.keys(store.get('widgets', {}))
                .filter(widgetId => {
                    // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
                    const name = widgetId.split(':')[0];
                    return _.includes(activeWidgets, name);
                });

            const defaultWidgets = store.get('workspace.container.default.widgets');
            const sortableWidgets = _.difference(widgets, defaultWidgets);
            let primaryWidgets = store.get('workspace.container.primary.widgets');
            let secondaryWidgets = store.get('workspace.container.secondary.widgets');

            primaryWidgets = sortableWidgets.slice();
            _.pullAll(primaryWidgets, secondaryWidgets);
            pubsub.publish('updatePrimaryWidgets', primaryWidgets);

            secondaryWidgets = sortableWidgets.slice();
            _.pullAll(secondaryWidgets, primaryWidgets);
            pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

            // Update inactive count
            this.setState({ inactiveCount: _.size(inactiveWidgets) });
        });
    };

    updateWidgetsForSecondaryContainer = () => {
        widgetManager.show((activeWidgets, inactiveWidgets) => {
            const widgets = Object.keys(store.get('widgets', {}))
                .filter(widgetId => {
                    // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
                    const name = widgetId.split(':')[0];
                    return _.includes(activeWidgets, name);
                });

            const defaultWidgets = store.get('workspace.container.default.widgets');
            const sortableWidgets = _.difference(widgets, defaultWidgets);
            let primaryWidgets = store.get('workspace.container.primary.widgets');
            let secondaryWidgets = store.get('workspace.container.secondary.widgets');

            secondaryWidgets = sortableWidgets.slice();
            _.pullAll(secondaryWidgets, primaryWidgets);
            pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

            primaryWidgets = sortableWidgets.slice();
            _.pullAll(primaryWidgets, secondaryWidgets);
            pubsub.publish('updatePrimaryWidgets', primaryWidgets);

            // Update inactive count
            this.setState({ inactiveCount: _.size(inactiveWidgets) });
        });
    };

    componentDidMount() {
        this.addControllerEvents();
        this.addResizeEventListener();

        this.action.checkForOutdatedPosts();

        setTimeout(() => {
            // A workaround solution to trigger componentDidUpdate on initial render
            this.setState({ mounted: true });
        }, 0);
    }

    componentWillUnmount() {
        this.removeControllerEvents();
        this.removeResizeEventListener();
    }

    componentDidUpdate() {
        store.set('workspace.container.primary.show', this.state.showPrimaryContainer);
        store.set('workspace.container.secondary.show', this.state.showSecondaryContainer);

        this.resizeDefaultContainer();
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

    addResizeEventListener() {
        this.onResizeThrottled = _.throttle(this.resizeDefaultContainer, 50);
        window.addEventListener('resize', this.onResizeThrottled);
    }

    removeResizeEventListener() {
        window.removeEventListener('resize', this.onResizeThrottled);
        this.onResizeThrottled = null;
    }

    render() {
        const { style, className } = this.props;
        const {
            port,
            modal,
            isDraggingFile,
            isDraggingWidget,
            showPrimaryContainer,
            showSecondaryContainer,
            inactiveCount
        } = this.state;
        const hidePrimaryContainer = !showPrimaryContainer;
        const hideSecondaryContainer = !showSecondaryContainer;

        return (
            <div style={style} className={classNames(className, styles.workspace)}>
                {modal.name === MODAL_FEEDER_PAUSED && (
                    <FeederPaused
                        title={modal.params.title}
                        onClose={this.action.closeModal}
                    />
                )}
                {modal.name === MODAL_FEEDER_WAIT && (
                    <FeederWait
                        title={modal.params.title}
                        onClose={this.action.closeModal}
                    />
                )}
                {modal.name === MODAL_PROMPT && (
                    <Prompt
                        title={modal.params.title}
                        resume={modal.params.resume}
                        buttons={modal.params.buttons}
                        onClose={this.action.closeModal}
                    />
                )}
                {modal.name === MODAL_SERVER_DISCONNECTED &&
                    <ServerDisconnected />
                }
                {modal.name === MODAL_OUTDATED_POSTS && (
                    <OutdatedPosts
                        port={port}
                        posts={modal.params.posts}
                        outdated={modal.params.outdated}
                        onClose={this.action.closeModal}
                    />
                )}
                {modal.name === MODAL_EXPORT && (
                    <Export
                        onClose={this.action.closeModal}
                        keys={modal.params.keys}
                        data={modal.params.data}
                    />
                )}
                {modal.name === MODAL_SOFTWARE_UPDATES && (
                    <SoftwareUpdates
                        onClose={(checked, version) => {
                            this.action.closeModal();
                            store.set('workspace.updates.showUpdates', checked);
                            store.set('workspace.updates.version', version);
                        }}
                        title={modal.params.title}
                        versions={modal.params.versions}
                    />
                )}
                <div
                    className={classNames(
                        styles.dropzoneOverlay,
                        { [styles.hidden]: !(port && isDraggingFile) }
                    )}
                >
                    <div className={styles.textBlock}>
                        {i18n._('Drop G-code file here')}
                    </div>
                </div>
                <Dropzone
                    className={styles.dropzone}
                    disabled={controller.workflow.state !== WORKFLOW_STATE_IDLE}
                    disableClick={true}
                    disablePreview={true}
                    multiple={false}
                    onDragStart={(event) => {
                    }}
                    onDragEnter={(event) => {
                        if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
                            return;
                        }
                        if (isDraggingWidget) {
                            return;
                        }
                        if (!isDraggingFile) {
                            this.setState({ isDraggingFile: true });
                        }
                    }}
                    onDragLeave={(event) => {
                        if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
                            return;
                        }
                        if (isDraggingWidget) {
                            return;
                        }
                        if (isDraggingFile) {
                            this.setState({ isDraggingFile: false });
                        }
                    }}
                    onDrop={(acceptedFiles, rejectedFiles) => {
                        if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
                            return;
                        }
                        if (isDraggingWidget) {
                            return;
                        }
                        if (isDraggingFile) {
                            this.setState({ isDraggingFile: false });
                        }
                        this.onDrop(acceptedFiles);
                    }}
                >
                    <div className={styles.workspaceTable}>
                        <div className={styles.workspaceTableRow}>
                            <div
                                ref={node => {
                                    this.primaryContainer = node;
                                }}
                                className={classNames(
                                    styles.primaryContainer,
                                    { [styles.hidden]: hidePrimaryContainer }
                                )}
                            >
                                <ButtonToolbar style={{ margin: '5px 0' }}>
                                    <ButtonGroup
                                        style={{ marginLeft: 0, marginRight: 10 }}
                                        btnSize="sm"
                                        btnStyle="flat"
                                    >
                                        <Button
                                            style={{ minWidth: 30 }}
                                            compact
                                            onClick={this.togglePrimaryContainer}
                                        >
                                            <i className="fa fa-chevron-left" />
                                        </Button>
                                    </ButtonGroup>
                                    <ButtonGroup
                                        style={{ marginLeft: 0, marginRight: 10 }}
                                        btnSize="sm"
                                        btnStyle="flat"
                                    >
                                        <Button
                                            style={{ width: 230 }}
                                            onClick={this.updateWidgetsForPrimaryContainer}
                                        >
                                            <i className="fa fa-list-alt" />
                                            {i18n._('Manage Widgets ({{inactiveCount}})', {
                                                inactiveCount: inactiveCount
                                            })}
                                        </Button>
                                    </ButtonGroup>
                                    <ButtonGroup
                                        style={{ marginLeft: 0, marginRight: 0 }}
                                        btnSize="sm"
                                        btnStyle="flat"
                                    >
                                        <Button
                                            style={{ minWidth: 30 }}
                                            compact
                                            title={i18n._('Collapse All')}
                                            onClick={event => {
                                                this.primaryWidgets.collapseAll();
                                            }}
                                        >
                                            <i className="fa fa-chevron-up" style={{ fontSize: 14 }} />
                                        </Button>
                                        <Button
                                            style={{ minWidth: 30 }}
                                            compact
                                            title={i18n._('Expand All')}
                                            onClick={event => {
                                                this.primaryWidgets.expandAll();
                                            }}
                                        >
                                            <i className="fa fa-chevron-down" style={{ fontSize: 14 }} />
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                                <PrimaryWidgets
                                    ref={node => {
                                        this.primaryWidgets = node;
                                    }}
                                    onForkWidget={this.widgetEventHandler.onForkWidget}
                                    onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
                                    onDragStart={this.widgetEventHandler.onDragStart}
                                    onDragEnd={this.widgetEventHandler.onDragEnd}
                                />
                            </div>
                            {hidePrimaryContainer && (
                                <div
                                    ref={node => {
                                        this.primaryToggler = node;
                                    }}
                                    className={styles.primaryToggler}
                                >
                                    <ButtonGroup
                                        btnSize="sm"
                                        btnStyle="flat"
                                    >
                                        <Button
                                            style={{ minWidth: 30 }}
                                            compact
                                            onClick={this.togglePrimaryContainer}
                                        >
                                            <i className="fa fa-chevron-right" />
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            )}
                            <div
                                ref={node => {
                                    this.defaultContainer = node;
                                }}
                                className={classNames(
                                    styles.defaultContainer,
                                    styles.fixed
                                )}
                            >
                                <DefaultWidgets />
                            </div>
                            {hideSecondaryContainer && (
                                <div
                                    ref={node => {
                                        this.secondaryToggler = node;
                                    }}
                                    className={styles.secondaryToggler}
                                >
                                    <ButtonGroup
                                        btnSize="sm"
                                        btnStyle="flat"
                                    >
                                        <Button
                                            style={{ minWidth: 30 }}
                                            compact
                                            onClick={this.toggleSecondaryContainer}
                                        >
                                            <i className="fa fa-chevron-left" />
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            )}
                            <div
                                ref={node => {
                                    this.secondaryContainer = node;
                                }}
                                className={classNames(
                                    styles.secondaryContainer,
                                    { [styles.hidden]: hideSecondaryContainer }
                                )}
                            >
                                <ButtonToolbar style={{ margin: '5px 0' }}>
                                    <div className="pull-left">
                                        <ButtonGroup
                                            style={{ marginLeft: 0, marginRight: 10 }}
                                            btnSize="sm"
                                            btnStyle="flat"
                                        >
                                            <Button
                                                style={{ minWidth: 30 }}
                                                compact
                                                title={i18n._('Collapse All')}
                                                onClick={event => {
                                                    this.secondaryWidgets.collapseAll();
                                                }}
                                            >
                                                <i className="fa fa-chevron-up" style={{ fontSize: 14 }} />
                                            </Button>
                                            <Button
                                                style={{ minWidth: 30 }}
                                                compact
                                                title={i18n._('Expand All')}
                                                onClick={event => {
                                                    this.secondaryWidgets.expandAll();
                                                }}
                                            >
                                                <i className="fa fa-chevron-down" style={{ fontSize: 14 }} />
                                            </Button>
                                        </ButtonGroup>
                                        <ButtonGroup
                                            style={{ marginLeft: 0, marginRight: 10 }}
                                            btnSize="sm"
                                            btnStyle="flat"
                                        >
                                            <Button
                                                style={{ width: 230 }}
                                                onClick={this.updateWidgetsForSecondaryContainer}
                                            >
                                                <i className="fa fa-list-alt" />
                                                {i18n._('Manage Widgets ({{inactiveCount}})', {
                                                    inactiveCount: inactiveCount
                                                })}
                                            </Button>
                                        </ButtonGroup>
                                        <ButtonGroup
                                            style={{ marginLeft: 0, marginRight: 0 }}
                                            btnSize="sm"
                                            btnStyle="flat"
                                        >
                                            <Button
                                                style={{ minWidth: 30 }}
                                                compact
                                                onClick={this.toggleSecondaryContainer}
                                            >
                                                <i className="fa fa-chevron-right" />
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </ButtonToolbar>
                                <SecondaryWidgets
                                    ref={node => {
                                        this.secondaryWidgets = node;
                                    }}
                                    onForkWidget={this.widgetEventHandler.onForkWidget}
                                    onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
                                    onDragStart={this.widgetEventHandler.onDragStart}
                                    onDragEnd={this.widgetEventHandler.onDragEnd}
                                />
                            </div>
                        </div>
                    </div>
                </Dropzone>
            </div>
        );
    }
}

export default Workspace;
