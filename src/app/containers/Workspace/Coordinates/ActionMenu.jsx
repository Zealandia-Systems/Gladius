import PropTypes from 'prop-types';
import ensureArray from 'ensure-array';
import React, { PureComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import styles from './Coordinates.styl';

class ActionMenu extends PureComponent {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        bsSize: PropTypes.string,
        axes: PropTypes.string.isRequired,
        wcs: PropTypes.string.isRequired,
        canClick: PropTypes.bool.isRequired
    };

    handleSelect = (eventKey) => {
        const commands = ensureArray(eventKey);
        commands.forEach(command => controller.command('gcode', command));
    };

    render() {
        const { actions, axes, wcs, canClick } = this.props;
        const bsSize = this.props.bsSize || 'lg';

        if (!actions) {
            return (<div />);
        }

        const p = actions.wcsToP(wcs);

        return (
            <DropdownButton
                bsSize={bsSize}
                noCaret
                className="fa fa-ellipsis-v"
                disabled={!canClick}
                onSelect={this.handleSelect}
                title=""
            >
                <MenuItem header>{i18n._(`Work Coordinate System (${wcs})`)}</MenuItem>
                <MenuItem
                    eventKey={`G90 G0 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Go To Work Zero (G90 G0 ${axes})`)}
                </MenuItem>
                {p !== null && (
                    <MenuItem
                        eventKey={`G10 L20 ${p} ${axes}`}
                        disabled={!canClick}
                    >
                        {i18n._(`Zero Work Offsets(G10 L20 ${p} ${axes})`)}
                    </MenuItem>
                )}
                <MenuItem divider />
                <MenuItem header className={styles.dropdownHeader}>{i18n._('Temporary Offset (G92)')}</MenuItem>
                <MenuItem
                    eventKey={`G92 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Zero Temporary Offset (G92 ${axes})`)}
                </MenuItem>
                <MenuItem
                    eventKey={`G92.1 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Un-Zero Temporary Offset (G92.1 ${axes})`)}
                </MenuItem>
                <MenuItem divider />
                <MenuItem header className={styles.dropdownHeader}>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
                <MenuItem
                    eventKey={`G53 G0 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Go To Machine Zero (G53 G0 ${axes})`)}
                </MenuItem>
                <MenuItem
                    eventKey={`G28.3 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Set Machine Zero (G28.3 ${axes})`)}
                </MenuItem>
                <MenuItem
                    eventKey={`G28.2 ${axes}`}
                    disabled={!canClick}
                >
                    {i18n._(`Homing Sequence (G28.2 ${axes})`)}
                </MenuItem>
            </DropdownButton>
        );
    }
}

export default ActionMenu;
