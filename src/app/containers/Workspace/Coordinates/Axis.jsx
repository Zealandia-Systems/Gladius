import chainedFunction from 'chained-function';
import React, { PureComponent } from 'react';
import { ButtonGroup, Button, Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import {
    AXIS_E,
    AXIS_X,
    AXIS_Y,
    AXIS_Z,
    AXIS_A,
    AXIS_B,
    AXIS_C,
    IMPERIAL_UNITS,
    METRIC_UNITS
} from '../../../constants';
import PositionInput from './PositionInput';
import ActionMenu from './ActionMenu';

const AxisLabel = styled.div`
    text-align: center;
    font-size: 32px;
    font-weight: bolder;
    color: ${props => (props.highlight ? 'black' : 'gray')};
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: white;
`;

const AxisSubscript = styled.div`
    text-align: center;
    font-size: 12px;
    line-height: 20px;
`;

const PositionLabel = ({ value, size = 24 }) => {
    value = String(value);
    return (
        <div style={{ fontSize: size, padding: 5, textAlign: 'right' }}>
            <span>{value.split('.')[0]}</span>
            <span>.</span>
            <span>{value.split('.')[1]}</span>
        </div>
    );
};

PositionLabel.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    size: PropTypes.number
};

class Axis extends PureComponent {
    static propTypes = {
        axis: PropTypes.object.isRequired,
        canClick: PropTypes.bool,
        units: PropTypes.oneOf([IMPERIAL_UNITS, METRIC_UNITS]),
        machinePosition: PropTypes.object,
        workPosition: PropTypes.object,
        jog: PropTypes.object,
        actions: PropTypes.object
    };

    state = {
        positionInput: {
            [AXIS_E]: false,
            [AXIS_X]: false,
            [AXIS_Y]: false,
            [AXIS_Z]: false,
            [AXIS_A]: false,
            [AXIS_B]: false,
            [AXIS_C]: false
        }
    };

    overlay = null;

    hidePositionInput = () => () => {
        this.overlay.hide();
    };

    render() {
        const { axis, canClick, units, machinePosition, workPosition, jog, actions } = this.props;
        const lengthUnits = (units === METRIC_UNITS) ? i18n._('mm') : i18n._('in');
        const degreeUnits = i18n._('deg');
        const mpos = machinePosition[axis.name] || '0.000';
        const wpos = workPosition[axis.name] || '0.000';
        const axisLabel = axis.name.toUpperCase();
        const displayUnits = {
            [AXIS_E]: lengthUnits,
            [AXIS_X]: lengthUnits,
            [AXIS_Y]: lengthUnits,
            [AXIS_Z]: lengthUnits,
            [AXIS_A]: degreeUnits,
            [AXIS_B]: degreeUnits,
            [AXIS_C]: degreeUnits
        }[axis.name] || '';
        const canHomeMachine = canClick;
        const canZeroOutWorkOffsets = canClick;
        const canModifyWorkPosition = canClick && !this.state.positionInput[axis.name];
        const highlightAxis = canClick && (jog.keypad || jog.axis === axis.name);
        const wcs = actions.getWorkCoordinateSystem();

        const createOverlay = (props) => {
            return (
                <Popover id={axis.name}>
                    <PositionInput
                        style={{ margin: '5px 0' }}
                        onSave={chainedFunction(
                            (value) => {
                                actions.setWorkOffsets(axis.name, value);
                            },
                            this.hidePositionInput()
                        )}
                        onCancel={this.hidePositionInput()}
                    />
                </Popover>
            );
        };

        return (
            <tr>
                <td>
                    <AxisLabel highlight={highlightAxis}>{axisLabel}</AxisLabel><AxisSubscript>{displayUnits}</AxisSubscript>
                </td>
                <td style={{ width: '99%' }}>
                    <PositionLabel value={wpos} />
                    <PositionLabel value={mpos} size={18} />
                </td>
                <td>
                    <ButtonGroup bsSize="lg" style={{ display: 'flex' }}>
                        <Button
                            disabled={!canHomeMachine}
                            onClick={() => {
                                controller.command('gcode', `G28.2 ${axisLabel}0`);
                            }}
                            title={i18n._('Home Axis')}
                        >
                            <i className="fa fa-home" />
                            <Tooltip
                                id="homeAxis"
                                placement="bottom"
                                content={i18n._('Home Axis')}
                                disabled={!canHomeMachine}
                            />
                        </Button>
                        <Button
                            disabled={!canZeroOutWorkOffsets}
                            onClick={() => {
                                actions.setWorkOffsets(axis.name, 0);
                            }}
                            title={i18n._('Zero Work Offset')}
                        >
                            <i className="fab fa-creative-commons-zero" />
                            <Tooltip
                                id="zeroWorkOffset"
                                placement="bottom"
                                content={i18n._('Zero Work Offset')}
                                disabled={!canZeroOutWorkOffsets}
                            />
                        </Button>
                        <OverlayTrigger
                            ref={(ref) => this.overlay = ref}
                            trigger="click"
                            rootClose
                            placement="bottom"
                            overlay={createOverlay()}
                        >
                            <Button
                                disabled={!canModifyWorkPosition}
                                title={i18n._('Set Work Offset')}
                            >
                                <i className="fa fa-edit" />
                                <Tooltip
                                    id="setWorkOffset"
                                    placement="bottom"
                                    content={i18n._('Set Work Offset')}
                                    disabled={!canModifyWorkPosition}
                                />
                            </Button>
                        </OverlayTrigger>
                        <ActionMenu wcs={wcs} axes={`${axisLabel}0`} canClick={canClick} />
                    </ButtonGroup>
                </td>
            </tr>
        );
    }
}

export default Axis;
