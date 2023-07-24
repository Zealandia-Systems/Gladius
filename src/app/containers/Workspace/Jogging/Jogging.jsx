import PropTypes from 'prop-types';
import { includes } from 'lodash';
import cx from 'classnames';
import ensureArray from 'ensure-array';
import React, { PureComponent } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import Panel from 'app/components/Panel';
import RepeatButton from 'app/components/RepeatButton';
import Space from 'app/components/Space';
import {
    IMPERIAL_UNITS,
    IMPERIAL_STEPS,
    METRIC_UNITS,
    METRIC_STEPS
} from 'app/constants';
import i18n from 'app/lib/i18n';
import StepMenu from './StepMenu';
import KeypadOverlay from './KeypadOverlay';
import styles from './Jogging.styl';

class Jogging extends PureComponent {
    static propTypes = {
        canClick: PropTypes.bool.isRequired,
        units: PropTypes.string.isRequired,
        axes: PropTypes.array.isRequired,
        jog: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    render() {
        const { canClick, units, jog, axes, actions } = this.props;

        const canChangeStep = canClick;
        const imperialJogDistances = ensureArray(jog.imperial.distances);
        const metricJogDistances = ensureArray(jog.metric.distances);
        const imperialJogSteps = [
            ...imperialJogDistances,
            ...IMPERIAL_STEPS
        ];
        const metricJogSteps = [
            ...metricJogDistances,
            ...METRIC_STEPS
        ];
        const canStepForward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.imperial.step < imperialJogSteps.length - 1)) ||
            (units === METRIC_UNITS && (jog.metric.step < metricJogSteps.length - 1))
        );
        const canStepBackward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.imperial.step > 0)) ||
            (units === METRIC_UNITS && (jog.metric.step > 0))
        );

        const canClickX = canClick && includes(axes, 'x');
        const canClickY = canClick && includes(axes, 'y');
        const canClickXY = canClickX && canClickY;
        const canClickZ = canClick && includes(axes, 'z');
        const highlightX = canClickX && (jog.keypad || jog.axis === 'x');
        const highlightY = canClickY && (jog.keypad || jog.axis === 'y');
        const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title>
                        <i className="fa fa-running" />
                        <Space width="8" />
                        {i18n._('Jogging')}
                    </Panel.Title>
                    <Panel.Controls>
                        <ButtonGroup style={{ float: 'right' }}>
                            <KeypadOverlay
                                show={canClick && jog.keypad}
                            >
                                <Button
                                    title={i18n._('Keypad jogging')}
                                    onClick={actions.toggleKeypadJogging}
                                    inverted={jog.keypad}
                                    disabled={!canClick}
                                >
                                    {!jog.keypad &&
                                        <i className="far fa-keyboard" />
                                    }
                                    {jog.keypad &&
                                        <i className="fa fa-keyboard" />
                                    }
                                </Button>
                            </KeypadOverlay>
                            <StepMenu
                                canClick={canClick}
                                units={units}
                                jog={jog}
                                actions={actions}
                            />
                            <Button
                                title={i18n._('Decrease Step')}
                                disabled={!canStepBackward}
                                bsSize="sm"
                                onClick={actions.stepBackward}
                            >
                                <i className="fa fa-minus" />
                            </Button>

                            <Button
                                title={i18n._('Increase Step')}
                                disabled={!canStepForward}
                                bsSize="sm"
                                onClick={actions.stepForward}
                            >
                                <i className="fa fa-plus" />
                            </Button>
                        </ButtonGroup>
                    </Panel.Controls>
                </Panel.Heading>
                <Panel.Body>
                    <table className={styles.jogControl}>
                        <tbody>
                            <tr>
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickXY}
                                        title={i18n._('Move X- Y+')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: -distance, Y: distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(270, 20, 20)">
                                                <path className={styles.arrow} d="M0,20 L40,0 L20,40 L15,25 L0,20" />
                                            </g>
                                        </svg>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightY
                                            }
                                        )}
                                        disabled={!canClickY}
                                        title={i18n._('Move Y+')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ Y: distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(0, 20, 20)">
                                                <path className={styles.arrow} d="M2,38 L20,2 L38,38 L20,30 L2,38" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', right: '4px', top: '2px' }}>
                                            Y+
                                        </div>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickXY}
                                        title={i18n._('Move X+ Y+')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: distance, Y: distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(0, 20, 20)">
                                                <path className={styles.arrow} d="M0,20 L40,0 L20,40 L15,25 L0,20" />
                                            </g>
                                        </svg>
                                    </RepeatButton>
                                </td>
                                <td />
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightZ
                                            }
                                        )}
                                        disabled={!canClickZ}
                                        title={i18n._('Move Z+')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ Z: distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(0, 20, 20)">
                                                <path className={styles.arrow} d="M0,40 L20,0 L40,40 L20,30 L0,40" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', right: '4px', top: '2px' }}>
                                            Z+
                                        </div>
                                    </RepeatButton>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightX
                                            }
                                        )}
                                        disabled={!canClickX}
                                        title={i18n._('Move X-')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: -distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(270, 20, 20)">
                                                <path className={styles.arrow} d="M0,40 L20,0 L40,40 L20,30 L0,40" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', left: '4px', top: '2px' }}>
                                            X-
                                        </div>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickXY}
                                        title={i18n._('Move To XY Zero (G0 X0 Y0)')}
                                        onClick={() => actions.move({ X: 0, Y: 0 })}
                                    >
                                        <div style={{ width: '40px', height: '40px', lineHeight: '40px', fontSize: '150%', fontWeight: 'bold' }}>
                                            X<sub>0</sub>Y<sub>0</sub>
                                        </div>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightX
                                            }
                                        )}
                                        bsSize="lg"
                                        disabled={!canClickX}
                                        title={i18n._('Move X+')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(90, 20, 20)">
                                                <path className={styles.arrow} d="M0,40 L20,0 L40,40 L20,30 L0,40" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', right: '4px', top: '2px' }}>
                                            X+
                                        </div>
                                    </RepeatButton>
                                </td>
                                <td className={styles.spacer} />
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickZ}
                                        title={i18n._('Move To Z Zero (G0 Z0)')}
                                        onClick={() => actions.move({ Z: 0 })}
                                    >
                                        <div style={{ width: '40px', height: '40px', lineHeight: '40px', fontSize: '150%', fontWeight: 'bold' }}>
                                            Z<sub>0</sub>
                                        </div>
                                    </RepeatButton>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickXY}
                                        title={i18n._('Move X- Y-')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: -distance, Y: -distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(180, 20, 20)">
                                                <path className={styles.arrow} d="M0,20 L40,0 L20,40 L15,25 L0,20" />
                                            </g>
                                        </svg>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightY
                                            }
                                        )}
                                        disabled={!canClickY}
                                        title={i18n._('Move Y-')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ Y: -distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(180, 20, 20)">
                                                <path className={styles.arrow} d="M0,40 L20,0 L40,40 L20,30 L0,40" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', right: '4px', bottom: '2px' }}>
                                            Y-
                                        </div>
                                    </RepeatButton>
                                </td>
                                <td>
                                    <RepeatButton
                                        className="btn btn-default btn-lg"
                                        disabled={!canClickXY}
                                        title={i18n._('Move X+ Y-')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ X: distance, Y: -distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(90, 20, 20)">
                                                <path className={styles.arrow} d="M0,20 L40,0 L20,40 L15,25 L0,20" />
                                            </g>
                                        </svg>
                                    </RepeatButton>
                                </td>
                                <td />
                                <td>
                                    <RepeatButton
                                        className={cx(
                                            {
                                                'btn': true,
                                                'btn-default': true,
                                                'btn-lg': true,
                                                [styles.highlight]: highlightZ
                                            }
                                        )}
                                        disabled={!canClickZ}
                                        title={i18n._('Move Z-')}
                                        onClick={() => {
                                            const distance = actions.getJogDistance();
                                            actions.jog({ Z: -distance });
                                        }}
                                    >
                                        <svg width="40" height="40">
                                            <g transform="rotate(180, 20, 20)">
                                                <path className={styles.arrow} d="M0,40 L20,0 L40,40 L20,30 L0,40" />
                                            </g>
                                        </svg>
                                        <div style={{ position: 'absolute', right: '4px', bottom: '2px' }}>
                                            Z-
                                        </div>
                                    </RepeatButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Panel.Body>
            </Panel>
        );
    }
}

export default Jogging;
