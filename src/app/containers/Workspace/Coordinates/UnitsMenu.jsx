import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';

import {
    // Units
    IMPERIAL_UNITS,
    METRIC_UNITS,
} from '../../../constants';

class UnitsMenu extends PureComponent {
    static propTypes = {
        canClick: PropTypes.bool.isRequired,
        units: PropTypes.string.isRequired
    };

    render() {
        const { canClick, units } = this.props;

        const title = {
            [IMPERIAL_UNITS]: 'G20 (inch)',
            [METRIC_UNITS]: 'G21 (mm)'
        }[units];

        return (
            <DropdownButton
                bsSize="sm"
                disabled={!canClick}
                title={title}
            >
                <MenuItem header>
                    {i18n._('Units')}
                </MenuItem>
                <MenuItem
                    active={units === IMPERIAL_UNITS}
                    onSelect={() => {
                        controller.command('gcode', 'G20');
                    }}
                >
                    {i18n._('G20 (inch)')}
                </MenuItem>
                <MenuItem
                    active={units === METRIC_UNITS}
                    onSelect={() => {
                        controller.command('gcode', 'G21');
                    }}
                >
                    {i18n._('G21 (mm)')}
                </MenuItem>
            </DropdownButton>
        );
    }
}

export default UnitsMenu;
