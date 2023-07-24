import PropTypes from 'prop-types';
import ensureArray from 'ensure-array';
import _uniqueId from 'lodash/uniqueId';
import React, { PureComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import i18n from 'app/lib/i18n';
import { IMPERIAL_UNITS, IMPERIAL_STEPS, METRIC_UNITS, METRIC_STEPS } from 'app/constants';
import Space from 'app/components/Space';

class StepMenu extends PureComponent {
    static propTypes = {
        canClick: PropTypes.bool.isRequired,
        units: PropTypes.string.isRequired,
        jog: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    renderImperialMenuItems() {
        const { jog } = this.props;
        const imperialJogDistances = ensureArray(jog.imperial.distances);
        const imperialJogSteps = [
            ...imperialJogDistances,
            ...IMPERIAL_STEPS
        ];
        const step = jog.imperial.step;
        const header = (
            (<MenuItem header>{i18n._('Imperial')}</MenuItem>)
        );

        return [header]
            .concat(imperialJogSteps.map((value, key) => {
                const active = (key === step);

                return (
                    <MenuItem
                        key={_uniqueId()}
                        eventKey={key}
                        active={active}
                    >
                        {value}
                        <Space width="4" />
                        <sub>{i18n._('in')}</sub>
                    </MenuItem>
                );
            }));
    }

    renderMetricMenuItems() {
        const { jog } = this.props;
        const metricJogDistances = ensureArray(jog.metric.distances);
        const metricJogSteps = [
            ...metricJogDistances,
            ...METRIC_STEPS
        ];
        const step = jog.metric.step;
        const header = (
            <MenuItem header>{i18n._('Metric')}</MenuItem>
        );

        return [header]
            .concat(metricJogSteps.map((value, key) => {
                const active = (key === step);

                return (
                    <MenuItem
                        key={_uniqueId()}
                        eventKey={key}
                        active={active}
                    >
                        {value}
                        <Space width="4" />
                        <sub>{i18n._('mm')}</sub>
                    </MenuItem>
                );
            }));
    }

    renderTitle(units, jog) {
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

        const currentSteps = units === IMPERIAL_UNITS
            ? imperialJogSteps[jog.imperial.step]
            : metricJogSteps[jog.metric.step];

        const unitsLabel = units === IMPERIAL_UNITS
            ? 'in'
            : 'mm';

        return (
            <span>
                {currentSteps}
                <Space width="4" />
                <sub>{i18n._(unitsLabel)}</sub>
            </span>
        );
    }

    render() {
        const { canClick, units, jog, actions } = this.props;
        const canChangeStep = canClick;

        return (
            <DropdownButton
                bsSize="sm"
                disabled={!canChangeStep}
                onSelect={(eventKey) => {
                    const step = eventKey;

                    actions.selectStep(step);
                }}
                title={this.renderTitle(units, jog)}
            >
                {units === IMPERIAL_UNITS &&
                    this.renderImperialMenuItems()
                }
                {units === METRIC_UNITS &&
                    this.renderMetricMenuItems()
                }
            </DropdownButton>
        );
    }
}

export default StepMenu;
