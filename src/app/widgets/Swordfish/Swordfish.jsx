import ensureArray from 'ensure-array';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import mapGCodeToText from 'app/lib/gcode-text';
import i18n from 'app/lib/i18n';
import Panel from 'app/components/Panel';
import Toggler from 'app/components/Toggler';
//import Overrides from './Overrides';
import styles from './index.styl';

class Swordfish extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    render() {
        const { state, actions } = this.props;
        const none = '–';
        const panel = state.panel;
        const controllerState = state.controller.state || {};
        //const ovF = get(controllerState, 'ovF', 0);
        //const ovR = get(controllerState, 'ovR', 0);
        //const ovS = get(controllerState, 'ovS', 0);
        const feedrate = get(controllerState, 'feedrate') || none;
        const spindle = get(controllerState, 'spindle') || none;
        const rapidFeedrate = get(controllerState, 'rapidFeedrate') || none;
        const modal = mapValues(controllerState.modal || {}, mapGCodeToText);

        return (
            <div>
                {/*<Overrides ovF={ovF} ovR={ovR} ovS={ovS} />*/}
                <Panel className={styles.panel}>
                    <Panel.Heading className={styles.panelHeading}>
                        <Toggler
                            className="clearfix"
                            onToggle={() => {
                                actions.toggleStatusReports();
                            }}
                            title={panel.statusReports.expanded ? i18n._('Hide') : i18n._('Show')}
                        >
                            <div className="pull-left">{i18n._('Status Reports')}</div>
                            <Toggler.Icon
                                className="pull-right"
                                expanded={panel.statusReports.expanded}
                            />
                        </Toggler>
                    </Panel.Heading>
                    {panel.statusReports.expanded && (
                        <Panel.Body>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Feed Rate')}>
                                        {i18n._('Feed Rate')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well}>
                                        {feedrate}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Rapid Rate')}>
                                        {i18n._('Rapid Rate')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well}>
                                        {rapidFeedrate}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Spindle')}>
                                        {i18n._('Spindle')}
                                    </div>
                                </div>
                                <div className="col col-xs-4">
                                    <div className={styles.well}>
                                        {spindle.rpm}
                                    </div>
                                </div>
                                <div className="col col-xs-4">
                                    <div className={styles.well}>
                                        {spindle.dir === 0 ? 'Forward' : 'Reverse'}
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    )}
                </Panel>
                <Panel className={styles.panel}>
                    <Panel.Heading className={styles.panelHeading}>
                        <Toggler
                            className="clearfix"
                            onToggle={() => {
                                actions.toggleModalGroups();
                            }}
                            title={panel.modalGroups.expanded ? i18n._('Hide') : i18n._('Show')}
                        >
                            <div className="pull-left">{i18n._('Modal Groups')}</div>
                            <Toggler.Icon
                                className="pull-right"
                                expanded={panel.modalGroups.expanded}
                            />
                        </Toggler>
                    </Panel.Heading>
                    {panel.modalGroups.expanded && (
                        <Panel.Body>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Motion')}>
                                        {i18n._('Motion')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.motion}>
                                        {modal.motion || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Coordinate')}>
                                        {i18n._('Coordinate')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.wcs}>
                                        {modal.wcs || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Plane')}>
                                        {i18n._('Plane')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.plane}>
                                        {modal.plane || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Distance')}>
                                        {i18n._('Distance')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.distance}>
                                        {modal.distance || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Feed Rate')}>
                                        {i18n._('Feed Rate')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.feedrate}>
                                        {modal.feedrate || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Units')}>
                                        {i18n._('Units')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.units}>
                                        {modal.units || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Program')}>
                                        {i18n._('Program')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.program}>
                                        {modal.program || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Spindle')}>
                                        {i18n._('Spindle')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well} title={modal.spindle}>
                                        {modal.spindle || none}
                                    </div>
                                </div>
                            </div>
                            <div className="row no-gutters">
                                <div className="col col-xs-4">
                                    <div className={styles.textEllipsis} title={i18n._('Coolant')}>
                                        {i18n._('Coolant')}
                                    </div>
                                </div>
                                <div className="col col-xs-8">
                                    <div className={styles.well}>
                                        {ensureArray(modal.coolant).map(coolant => (
                                            <div title={coolant} key={coolant}>{coolant || none}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    )}
                </Panel>
            </div>
        );
    }
}

export default Swordfish;
