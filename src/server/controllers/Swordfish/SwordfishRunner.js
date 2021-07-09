import events from 'events';
import _ from 'lodash';
import logger from '../../lib/logger';
import SwordfishLineParser from './SwordfishLineParser';
import SwordfishLineParserResultStart from './SwordfishLineParserResultStart';
import SwordfishLineParserResultFirmware from './SwordfishLineParserResultFirmware';
import SwordfishLineParserResultPosition from './SwordfishLineParserResultPosition';
import SwordfishLineParserResultOk from './SwordfishLineParserResultOk';
import SwordfishLineParserResultAction from './SwordfishLineParserResultAction';
import SwordfishLineParserResultEcho from './SwordfishLineParserResultEcho';
import SwordfishLineParserResultState from './SwordfishLineParserResultState';
import SwordfishLineParserResultError from './SwordfishLineParserResultError';
import {
    SWORDFISH_ACTIVE_STATE_IDLE,
    SWORDFISH_ACTIVE_STATE_ALARM,
} from '../../../app/constants';

const log = logger('controller:Swordfish');

class SwordfishRunner extends events.EventEmitter {
    state = {
        activeState: SWORDFISH_ACTIVE_STATE_IDLE,
        mpos: {
            x: '0.000',
            y: '0.000',
            z: '0.000',
        },
        wpos: {
            x: '0.000',
            y: '0.000',
            z: '0.000',
        },
        modal: {
            motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
            wcs: 'G54', // G54, G55, G56, G57, G58, G59
            plane: 'G17', // G17: xy-plane, G18: xz-plane, G19: yz-plane
            units: 'G21', // G20: Inches, G21: Millimeters
            distance: 'G90', // G90: Absolute, G91: Relative
            feedrate: 'G94', // G93: Inverse time mode, G94: Units per minute
            program: 'M0', // M0, M1, M2, M30
            spindle: 'M5', // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
            coolant: 'M9', // M7: Mist coolant, M8: Flood coolant, M9: Coolant off, [M7,M8]: Both on
        },
        ovF: 100,
        ovR: 100,
        ovS: 100,
        extruder: {}, // { deg, degTarget, power }
        heatedBed: {}, // { deg, degTarget, power }
        rapidFeedrate: 0, // Related to G0
        feedrate: 0, // Related to G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
        spindle: 0, // Related to M3, M4, M5
        tool: 1,
    };

    settings = {};

    parser = new SwordfishLineParser();

    parse(data) {
        data = ('' + data).replace(/\s+$/, '');
        if (!data) {
            return;
        }

        this.emit('raw', { raw: data });
        const result = this.parser.parse(data) || {};
        const { type, payload } = result;

        if (type === SwordfishLineParserResultStart) {
            this.emit('start', payload);
            return;
        }
        if (type === SwordfishLineParserResultFirmware) {
            const { firmware } = payload;

            const nextSettings = {
                ...this.settings,
                firmware: firmware,
            };

            if (!_.isEqual(this.settings, nextSettings)) {
                this.settings = nextSettings; // enforce change
            }

            this.emit('firmware', payload);
            return;
        }
        if (type === SwordfishLineParserResultPosition) {
            const nextState = {
                ...this.state,
                activeState: payload.activeState,
                mpos: {
                    ...this.state.mpos,
                    ...payload.mpos,
                },
                wpos: {
                    ...this.state.wpos,
                    ...payload.wpos,
                },
                modal: {
                    ...this.state.modal,
                    ...payload.wcs,
                },
            };

            if (!_.isEqual(this.state, nextState)) {
                this.state = nextState; // enforce change
            }
            this.emit('pos', payload);
            this.emit('state', payload);
            return;
        }
        if (type === SwordfishLineParserResultState) {
            const nextState = {
                ...this.state,
                activeState: payload.activeState,
            };

            if (!_.isEqual(this.state.activeState, nextState.activeState)) {
                this.state = nextState; // enforce change
            }
            this.emit('state', payload);
            return;
        }
        if (type === SwordfishLineParserResultOk) {
            this.emit('ok', payload);
            return;
        }
        if (type === SwordfishLineParserResultError) {
            this.emit('error', payload);
            return;
        }
        if (type === SwordfishLineParserResultAction) {
            this.emit('action', payload);
            return;
        }
        if (type === SwordfishLineParserResultEcho) {
            this.emit('echo', payload);
            return;
        }
        if (data.length > 0) {
            log.silly(payload);
            this.emit('others', payload);
            return;
        }
    }

    getActiveState(state = this.state) {
        return _.get(state, 'activeState', SWORDFISH_ACTIVE_STATE_IDLE);
    }

    getMachinePosition(state = this.state) {
        return _.get(state, 'mpos', {});
    }

    getWorkPosition(state = this.state) {
        return _.get(state, 'wpos', {});
    }

    getModalGroup(state = this.state) {
        return _.get(state, 'modal', {});
    }

    getTool(state = this.state) {
        return _.get(state, 'tool', 1);
    }

    isAlarm() {
        const activeState = _.get(this.state, 'activeState');
        return activeState === SWORDFISH_ACTIVE_STATE_ALARM;
    }

    isIdle() {
        const activeState = _.get(this.state, 'activeState');
        return activeState === SWORDFISH_ACTIVE_STATE_IDLE;
    }
}

export default SwordfishRunner;
