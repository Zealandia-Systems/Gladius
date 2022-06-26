import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import i18n from 'app/lib/i18n';
import {
    METRIC_UNITS
} from '../../constants';
import {
    MODAL_PREVIEW
} from './constants';
import styles from './index.styl';
import stock from './images/Stock.png';
import touchPlate1 from './images/TouchPlate1.png';
import touchPlate2 from './images/TouchPlate2.png';
import touchPlate3 from './images/TouchPlate3.png';
import touchPlate4 from './images/TouchPlate4.png';

class Probe extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    componentDidMount() {

    }

    render() {
        const { state, actions } = this.props;
        const {
            canClick,
            units,
            probeDepth,
            probeFeedrate,
            toolDiameter,
            probeThickness,
            plate1IsHover,
            plate2IsHover,
            plate3IsHover,
            plate4IsHover,
            plate1IsSelected,
            plate2IsSelected,
            plate3IsSelected,
            plate4IsSelected
        } = state;

        const displayUnits = (units === METRIC_UNITS) ? i18n._('mm') : i18n._('in');
        const feedrateUnits = (units === METRIC_UNITS) ? i18n._('mm/min') : i18n._('in/min');
        const step = (units === METRIC_UNITS) ? 1 : 0.1;

        return (
            <div>
                <div className={styles['probe-selector']}>
                    <img src={stock} className={styles['probe-selector-background']} alt="stock" />
                    <map name="corner-map" id="corner-map">
                        <area
                            id="probe-corner-map-1"
                            shape="poly"
                            coords="0,103,25,118,47,102,47,89,25,74,0,90"
                            href="#" alt="1"
                            onMouseOver={e => actions.mouseOverPlate(e, 1)}
                            onMouseOut={e => actions.mouseOutOfPlate(e, 1)}
                            onClick={e => actions.changeProbeAxis(e, 1)}
                            onFocus={e => { }}
                            onBlur={e => { }}
                        />
                        <area
                            id="probe-corner-map-2"
                            shape="poly"
                            coords="133,13,133,25,154,36,164,36,184,25,184,12,161,0,154,0,133,13"
                            href="#"
                            alt="2"
                            onMouseOver={e => actions.mouseOverPlate(e, 2)}
                            onMouseOut={e => actions.mouseOutOfPlate(e, 2)}
                            onClick={e => actions.changeProbeAxis(e, 2)}
                            onFocus={e => { }}
                            onBlur={e => { }}
                        />
                        <area
                            id="probe-corner-map-3"
                            shape="poly"
                            coords="316,88,292,74,269,91,269,101,291,117,293,117,316,103,316,102"
                            href="#"
                            alt="3"
                            onMouseOver={e => actions.mouseOverPlate(e, 3)}
                            onMouseOut={e => actions.mouseOutOfPlate(e, 3)}
                            onClick={e => actions.changeProbeAxis(e, 3)}
                            onFocus={e => { }}
                            onBlur={e => { }}
                        />
                        <area
                            id="probe-corner-map-4"
                            shape="poly"
                            coords="132,166,132,179,158,195,186,178,186,166,164,156,152,156"
                            href="#"
                            alt="4"
                            onMouseOver={e => actions.mouseOverPlate(e, 4)}
                            onMouseOut={e => actions.mouseOutOfPlate(e, 4)}
                            onClick={e => actions.changeProbeAxis(e, 4)}
                            onFocus={e => { }}
                            onBlur={e => { }}
                        />
                    </map>
                    <img
                        ref={element => this.plate1 = element}
                        src={touchPlate1}
                        className={classNames(
                            styles['probe-selector-corner'],
                            { [styles['is-hover']]: plate1IsHover },
                            { [styles['is-selected']]: plate1IsSelected }
                        )}
                        alt="touch-plate1"
                    />
                    <img
                        ref={element => this.plate2 = element}
                        src={touchPlate2}
                        className={classNames(
                            styles['probe-selector-corner'],
                            { [styles['is-hover']]: plate2IsHover },
                            { [styles['is-selected']]: plate2IsSelected }
                        )}
                        alt="touch-plate2"
                    />
                    <img
                        ref={element => this.plate3 = element}
                        src={touchPlate3}
                        className={classNames(
                            styles['probe-selector-corner'],
                            { [styles['is-hover']]: plate3IsHover },
                            { [styles['is-selected']]: plate3IsSelected }
                        )}
                        alt="touch-plate3"
                    />
                    <img
                        ref={element => this.plate4 = element}
                        src={touchPlate4}
                        className={classNames(
                            styles['probe-selector-corner'],
                            { [styles['is-hover']]: plate4IsHover },
                            { [styles['is-selected']]: plate4IsSelected }
                        )}
                        alt="touch-plate4"
                    />
                    <img
                        src={stock}
                        className={styles['probe-selector-map']}
                        alt="stock"
                        useMap="#corner-map"
                    />
                </div>
                <div className="row no-gutters">
                    <div className="col-xs-6" style={{ paddingRight: 5 }}>
                        <div className="form-group" data-tip="The maximum distance to move the tool when probing in any direction before erroring out. This is a fail-safe to stop the tool in case it does not detect contact with the touch plate.">
                            <label className="control-label">{i18n._('Probe Distance')}</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={probeDepth}
                                    placeholder="0.00"
                                    min={0}
                                    step={step}
                                    onChange={actions.handleProbeDepthChange}
                                />
                                <div className="input-group-addon">{displayUnits}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-6" style={{ paddingLeft: 5 }}>
                        <div className="form-group">
                            <label className="control-label">{i18n._('Probe Feedrate')}</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={probeFeedrate}
                                    placeholder="0.00"
                                    min={0}
                                    step={step}
                                    onChange={actions.handleProbeFeedrateChange}
                                />
                                <span className="input-group-addon">{feedrateUnits}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-6" style={{ paddingRight: 5 }}>
                        <div className="form-group" data-tip="Enter the diameter of your tool. This allows the probing cycle to compensate by offsetting the Work Coordinate System (WCS) by half the diameter.">
                            <label className="control-label">{i18n._('Tool Diameter')}</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={toolDiameter}
                                    placeholder="0.00"
                                    min={0}
                                    step={step}
                                    onChange={actions.handleToolDiameterChange}
                                />
                                <div className="input-group-addon">{displayUnits}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-6" style={{ paddingRight: 5 }}>
                        <div className="form-group" data-tip="Enter the thickness of your work probe.">
                            <label className="control-label">{i18n._('Probe Thickness')}</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={probeThickness}
                                    placeholder="9.00"
                                    min={0}
                                    step={step}
                                    onChange={actions.handleProbeThicknessChange}
                                />
                                <div className="input-group-addon">{displayUnits}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="col-xs-12">
                        <button
                            type="button"
                            className="btn btn-sm btn-default"
                            onClick={() => {
                                actions.openModal(MODAL_PREVIEW, { doXY: true });
                            }}
                            disabled={!canClick}
                        >
                            {i18n._('Probe')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-default"
                            onClick={() => {
                                actions.openModal(MODAL_PREVIEW, { doXY: false });
                            }}
                            disabled={!canClick}
                        >
                            {i18n._('Probe Z Only')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Probe;
