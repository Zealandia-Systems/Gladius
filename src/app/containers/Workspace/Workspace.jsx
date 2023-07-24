import { map, size, includes, pick, difference, pullAll, throttle } from 'lodash';
import ensureArray from 'ensure-array';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import pubsub from 'pubsub-js';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar } from 'app/components/Buttons';
import api from 'app/api';
import {
    // Units
    IMPERIAL_UNITS,
    IMPERIAL_STEPS,
    METRIC_UNITS,
    METRIC_STEPS,
    // Workflow
    WORKFLOW_STATE_RUNNING,
    WORKFLOW_STATE_IDLE
} from 'app/constants';
import i18n from 'app/lib/i18n';
import log from 'app/lib/log';
import controller from 'app/lib/controller';
import combokeys from 'app/lib/combokeys';
import { preventDefault } from 'app/lib/dom-events';
import { limit } from 'app/lib/normalize-range';
import store from 'app/store';
import * as widgetManager from './WidgetManager';
import DefaultWidgets from './DefaultWidgets';
//import PrimaryWidgets from './PrimaryWidgets';
import Coordinates from './Coordinates';
import Jogging from './Jogging';
import SecondaryWidgets from './SecondaryWidgets';
import FeederPaused from './modals/FeederPaused';
import FeederWait from './modals/FeederWait';
import ServerDisconnected from './modals/ServerDisconnected';
import styles from './index.styl';
import {
    MODAL_NONE,
    MODAL_FEEDER_PAUSED,
    MODAL_FEEDER_WAIT,
    MODAL_SERVER_DISCONNECTED
} from './constants';
import ShuttleControl from './ShuttleControl';
import Overrides from './Overrides';
import Spindle from './Spindle';

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
        units: METRIC_UNITS,
        workflow: {
            state: controller.workflow.state
        },
        modal: {
            name: MODAL_NONE,
            params: {}
        },
        isDraggingFile: false,
        isDraggingWidget: false,
        isUploading: false,
        showPrimaryContainer: store.get('workspace.container.primary.show'),
        showSecondaryContainer: store.get('workspace.container.secondary.show'),
        inactiveCount: size(widgetManager.getInactiveWidgets()),
        jog: {
            axis: '', // Defaults to empty
            keypad: store.get('jog.keypad'),
            imperial: {
                step: store.get('jog.imperial.step'),
                distances: ensureArray(store.get('jog.imperial.distances', []))
            },
            metric: {
                step: store.get('jog.metric.step'),
                distances: ensureArray(store.get('jog.metric.distances', []))
            }
        }
    };

    actions = {
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
        jog: (params = {}) => {
            const s = map(params, (value, letter) => ('' + letter.toUpperCase() + value)).join(' ');
            controller.command('gcode', 'G91 G0 ' + s);
        },
        move: (params = {}) => {
            const s = map(params, (value, letter) => ('' + letter.toUpperCase() + value)).join(' ');
            controller.command('gcode', 'G0 ' + s);
        },
        getJogDistance: () => {
            const { units } = this.state;

            if (units === IMPERIAL_UNITS) {
                const step = store.get('jog.imperial.step');
                const imperialJogDistances = ensureArray(store.get('jog.imperial.distances', []));
                const imperialJogSteps = [
                    ...imperialJogDistances,
                    ...IMPERIAL_STEPS
                ];
                const distance = Number(imperialJogSteps[step]) || 0;
                return distance;
            }

            if (units === METRIC_UNITS) {
                const step = store.get('jog.metric.step');
                const metricJogDistances = ensureArray(store.get('jog.metric.distances', []));
                const metricJogSteps = [
                    ...metricJogDistances,
                    ...METRIC_STEPS
                ];
                const distance = Number(metricJogSteps[step]) || 0;
                return distance;
            }

            return 0;
        },
        toggleKeypadJogging: () => {
            this.setState(state => ({
                jog: {
                    ...state.jog,
                    keypad: !state.jog.keypad
                }
            }));
        },
        selectAxis: (axis = '') => {
            this.setState(state => ({
                jog: {
                    ...state.jog,
                    axis: axis
                }
            }));
        },
        selectStep: (value = '') => {
            const step = Number(value);
            this.setState(state => ({
                jog: {
                    ...state.jog,
                    imperial: {
                        ...state.jog.imperial,
                        step: (state.units === IMPERIAL_UNITS) ? step : state.jog.imperial.step,
                    },
                    metric: {
                        ...state.jog.metric,
                        step: (state.units === METRIC_UNITS) ? step : state.jog.metric.step
                    }
                }
            }));
        },
        stepForward: () => {
            this.setState(state => {
                const imperialJogSteps = [
                    ...state.jog.imperial.distances,
                    ...IMPERIAL_STEPS
                ];
                const metricJogSteps = [
                    ...state.jog.metric.distances,
                    ...METRIC_STEPS
                ];

                return {
                    jog: {
                        ...state.jog,
                        imperial: {
                            ...state.jog.imperial,
                            step: (state.units === IMPERIAL_UNITS)
                                ? limit(state.jog.imperial.step + 1, 0, imperialJogSteps.length - 1)
                                : state.jog.imperial.step
                        },
                        metric: {
                            ...state.jog.metric,
                            step: (state.units === METRIC_UNITS)
                                ? limit(state.jog.metric.step + 1, 0, metricJogSteps.length - 1)
                                : state.jog.metric.step
                        }
                    }
                };
            });
        },
        stepBackward: () => {
            this.setState(state => {
                const imperialJogSteps = [
                    ...state.jog.imperial.distances,
                    ...IMPERIAL_STEPS
                ];
                const metricJogSteps = [
                    ...state.jog.metric.distances,
                    ...METRIC_STEPS
                ];

                return {
                    jog: {
                        ...state.jog,
                        imperial: {
                            ...state.jog.imperial,
                            step: (state.units === IMPERIAL_UNITS)
                                ? limit(state.jog.imperial.step - 1, 0, imperialJogSteps.length - 1)
                                : state.jog.imperial.step,
                        },
                        metric: {
                            ...state.jog.metric,
                            step: (state.units === METRIC_UNITS)
                                ? limit(state.jog.metric.step - 1, 0, metricJogSteps.length - 1)
                                : state.jog.metric.step
                        }
                    }
                };
            });
        },
        stepNext: () => {
            this.setState(state => {
                const imperialJogSteps = [
                    ...state.jog.imperial.distances,
                    ...IMPERIAL_STEPS
                ];
                const metricJogSteps = [
                    ...state.jog.metric.distances,
                    ...METRIC_STEPS
                ];

                return {
                    jog: {
                        ...state.jog,
                        imperial: {
                            ...state.jog.imperial,
                            step: (state.units === IMPERIAL_UNITS)
                                ? (state.jog.imperial.step + 1) % imperialJogSteps.length
                                : state.jog.imperial.step,
                        },
                        metric: {
                            ...state.jog.metric,
                            step: (state.units === METRIC_UNITS)
                                ? (state.jog.metric.step + 1) % metricJogSteps.length
                                : state.jog.metric.step
                        }
                    }
                };
            });
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

    controllerEvents = {
        'connect': () => {
            if (controller.connected) {
                this.actions.closeModal();
            } else {
                this.actions.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'connect_error': () => {
            if (controller.connected) {
                this.actions.closeModal();
            } else {
                this.actions.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'disconnect': () => {
            if (controller.connected) {
                this.actions.closeModal();
            } else {
                this.actions.openModal(MODAL_SERVER_DISCONNECTED);
            }
        },
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': (options) => {
            this.setState({ port: '' });
        },
        'workflow:state': (workflowState) => {
            const canJog = (workflowState !== WORKFLOW_STATE_RUNNING);

            // Disable keypad jogging and shuttle wheel when the workflow state is 'running'.
            // This prevents accidental movement while sending G-code commands.
            this.setState(state => ({
                jog: {
                    ...state.jog,
                    axis: canJog ? state.jog.axis : '',
                    keypad: canJog ? state.jog.keypad : false
                },
                workflow: {
                    ...state.workflow,
                    state: workflowState
                }
            }));
        },
        'feeder:status': (status) => {
            const { modal } = this.state;
            const { hold, holdReason } = { ...status };

            if (!hold) {
                if (includes([MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT], modal.name)) {
                    this.actions.closeModal();
                }
                return;
            }

            const { err, data } = { ...holdReason };

            if (err) {
                this.actions.openModal(MODAL_FEEDER_PAUSED, {
                    title: i18n._('Error')
                });
                return;
            }

            if (data === WAIT) {
                this.actions.openModal(MODAL_FEEDER_WAIT, {
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

            this.actions.openModal(MODAL_FEEDER_PAUSED, {
                title: title
            });
        },
        'controller:state': (type, controllerState) => {
            const { modal = {} } = { ...controllerState };
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
                }
            }));
        }
    };

    shuttleControlEvents = {
        SELECT_AXIS: (event, { axis }) => {
            const { jog } = this.state;

            if (!this.canClick()) {
                return;
            }

            if (jog.axis === axis) {
                this.actions.selectAxis(); // deselect axis
            } else {
                this.actions.selectAxis(axis);
            }
        },
        JOG: (event, { axis = null, direction = 1, factor = 1 }) => {
            const { jog } = this.state;

            if (!this.canClick()) {
                return;
            }

            if (axis !== null && !jog.keypad) {
                // keypad jogging is disabled
                return;
            }

            // The keyboard events of arrow keys for X-axis/Y-axis and pageup/pagedown for Z-axis
            // are not prevented by default. If a jog command will be executed, it needs to
            // stop the default behavior of a keyboard combination in a browser.
            preventDefault(event);

            axis = axis || jog.axis;
            const distance = this.actions.getJogDistance();
            const jogAxis = {
                x: () => this.actions.jog({ X: direction * distance * factor }),
                y: () => this.actions.jog({ Y: direction * distance * factor }),
                z: () => this.actions.jog({ Z: direction * distance * factor }),
                a: () => this.actions.jog({ A: direction * distance * factor }),
                b: () => this.actions.jog({ B: direction * distance * factor }),
                c: () => this.actions.jog({ C: direction * distance * factor })
            }[axis];

            jogAxis && jogAxis();
        },
        JOG_LEVER_SWITCH: (event, { key = '' }) => {
            if (key === '-') {
                this.actions.stepBackward();
            } else if (key === '+') {
                this.actions.stepForward();
            } else {
                this.actions.stepNext();
            }
        },
        SHUTTLE: (event, { zone = 0 }) => {
            const { jog } = this.state;

            if (!this.canClick()) {
                return;
            }

            if (zone === 0) {
                // Clear accumulated result
                this.shuttleControl.clear();

                if (jog.axis) {
                    controller.command('gcode', 'G90');
                }
                return;
            }

            if (!jog.axis) {
                return;
            }

            const distance = Math.min(this.actions.getJogDistance(), 1);
            const feedrateMin = this.config.get('shuttle.feedrateMin');
            const feedrateMax = this.config.get('shuttle.feedrateMax');
            const hertz = this.config.get('shuttle.hertz');
            const overshoot = this.config.get('shuttle.overshoot');

            this.shuttleControl.accumulate(zone, {
                axis: jog.axis,
                distance: distance,
                feedrateMin: feedrateMin,
                feedrateMax: feedrateMax,
                hertz: hertz,
                overshoot: overshoot
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

            log.debug('FileReader:', pick(file, [
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
                    return includes(activeWidgets, name);
                });

            const defaultWidgets = store.get('workspace.container.default.widgets');
            const sortableWidgets = difference(widgets, defaultWidgets);
            let primaryWidgets = store.get('workspace.container.primary.widgets');
            let secondaryWidgets = store.get('workspace.container.secondary.widgets');

            primaryWidgets = sortableWidgets.slice();
            pullAll(primaryWidgets, secondaryWidgets);
            pubsub.publish('updatePrimaryWidgets', primaryWidgets);

            secondaryWidgets = sortableWidgets.slice();
            pullAll(secondaryWidgets, primaryWidgets);
            pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

            // Update inactive count
            this.setState({ inactiveCount: size(inactiveWidgets) });
        });
    };

    updateWidgetsForSecondaryContainer = () => {
        widgetManager.show((activeWidgets, inactiveWidgets) => {
            const widgets = Object.keys(store.get('widgets', {}))
                .filter(widgetId => {
                    // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
                    const name = widgetId.split(':')[0];
                    return includes(activeWidgets, name);
                });

            const defaultWidgets = store.get('workspace.container.default.widgets');
            const sortableWidgets = difference(widgets, defaultWidgets);
            let primaryWidgets = store.get('workspace.container.primary.widgets');
            let secondaryWidgets = store.get('workspace.container.secondary.widgets');

            secondaryWidgets = sortableWidgets.slice();
            pullAll(secondaryWidgets, primaryWidgets);
            pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

            primaryWidgets = sortableWidgets.slice();
            pullAll(primaryWidgets, secondaryWidgets);
            pubsub.publish('updatePrimaryWidgets', primaryWidgets);

            // Update inactive count
            this.setState({ inactiveCount: size(inactiveWidgets) });
        });
    };

    componentDidMount() {
        this.addControllerEvents();
        this.addResizeEventListener();
        this.addShuttleControlEvents();

        setTimeout(() => {
            // A workaround solution to trigger componentDidUpdate on initial render
            this.setState({ mounted: true });
        }, 0);
    }

    componentWillUnmount() {
        this.removeControllerEvents();
        this.removeResizeEventListener();
        this.removeShuttleControlEvents();
    }

    componentDidUpdate() {
        store.set('workspace.container.primary.show', this.state.showPrimaryContainer);
        store.set('workspace.container.secondary.show', this.state.showSecondaryContainer);

        const {
            units,
            jog,
        } = this.state;

        store.set('jog.keypad', jog.keypad);
        if (units === IMPERIAL_UNITS) {
            store.set('jog.imperial.step', Number(jog.imperial.step) || 0);
        }
        if (units === METRIC_UNITS) {
            store.set('jog.metric.step', Number(jog.metric.step) || 0);
        }

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

    addShuttleControlEvents() {
        Object.keys(this.shuttleControlEvents).forEach(eventName => {
            const callback = this.shuttleControlEvents[eventName];
            combokeys.on(eventName, callback);
        });

        // Shuttle Zone
        this.shuttleControl = new ShuttleControl();
        this.shuttleControl.on('flush', ({ axis, feedrate, relativeDistance }) => {
            feedrate = feedrate.toFixed(3) * 1;
            relativeDistance = relativeDistance.toFixed(4) * 1;

            controller.command('gcode', 'G91 G1 F' + feedrate + ' ' + axis + relativeDistance);
        });
    }

    removeShuttleControlEvents() {
        Object.keys(this.shuttleControlEvents).forEach(eventName => {
            const callback = this.shuttleControlEvents[eventName];
            combokeys.removeListener(eventName, callback);
        });

        this.shuttleControl.removeAllListeners('flush');
        this.shuttleControl = null;
    }

    addResizeEventListener() {
        this.onResizeThrottled = throttle(this.resizeDefaultContainer, 50);
        window.addEventListener('resize', this.onResizeThrottled);
    }

    removeResizeEventListener() {
        window.removeEventListener('resize', this.onResizeThrottled);
        this.onResizeThrottled = null;
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
        const { style, className } = this.props;
        const {
            port,
            modal,
            units,
            isDraggingFile,
            isDraggingWidget,
            showPrimaryContainer,
            showSecondaryContainer,
            inactiveCount,
            jog
        } = this.state;

        const canClick = this.canClick();
        const hidePrimaryContainer = !showPrimaryContainer;
        const hideSecondaryContainer = !showSecondaryContainer;

        return (
            <div style={style} className={classNames(className, styles.workspace)}>
                {modal.name === MODAL_FEEDER_PAUSED && (
                    <FeederPaused
                        title={modal.params.title}
                        onClose={this.actions.closeModal}
                    />
                )}
                {modal.name === MODAL_FEEDER_WAIT && (
                    <FeederWait
                        title={modal.params.title}
                        onClose={this.actions.closeModal}
                    />
                )}
                {modal.name === MODAL_SERVER_DISCONNECTED &&
                    <ServerDisconnected />
                }
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
                                {/*
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
                                */}
                                <Coordinates jog={jog}/>
                                <Jogging
                                    canClick={canClick}
                                    units={units}
                                    jog={jog}
                                    axes={['x', 'y', 'z']}
                                    actions={this.actions}
                                />
                                <Spindle canClick={canClick} controllerState={this.state.controller} />
                                <Overrides />
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
