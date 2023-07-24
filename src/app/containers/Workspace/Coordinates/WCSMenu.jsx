/* eslint-disable jsx-a11y/anchor-is-valid */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import './Coordinates.styl';

class WCSMenu extends PureComponent {
    static propTypes = {
        wcs: PropTypes.string.isRequired,
        actions: PropTypes.object.isRequired,
        canClick: PropTypes.bool.isRequired
    };

    dropdownButton = null;

    getTitle(wcs) {
        const { actions } = this.props;

        return `${wcs} (P${actions.wcsToP(wcs)})`;
    }

    renderSubItems(wcs, code) {
        const { actions } = this.props;

        return [...Array(10).keys()].map(subcode => {
            const cmd = `G${code}.${subcode}`;
            const p = actions.wcsToP(cmd);

            return (
                <MenuItem
                    active={wcs === cmd}
                    onSelect={() => controller.command('gcode', cmd)}
                >
                    {cmd} (P{p})
                </MenuItem>
            );
            /*return (
                <li
                    role="presentation"
                    className={
                        classNames({
                            'menu-item': true,
                            active: wcs === cmd
                        })
                    }
                >
                    <a
                        role="menuitem"
                        tabIndex="-1"
                        href="#"
                        onClick={(event) => {
                            controller.command('gcode', cmd);

                            this.dropdownButton.onClick(event);
                        }}
                    >
                        {cmd} ({p})
                    </a>
                </li>
            );*/
        });
    }

    renderItems(wcs, activeCode) {
        return [54, 55, 56, 57, 58, 59].map(code => {
            const cmd = `G${code}`;
            const active = activeCode === code;

            return (
                <li
                    role="presentation"
                    className={
                        classNames({
                            'dropdown-submenu': true,
                            active: active
                        })
                    }
                >
                    <a
                        role="menuitem"
                        tabIndex="-1"
                        href="#"
                    >
                        {cmd}
                    </a>
                    <ul className="dropdown-menu">
                        {this.renderSubItems(wcs, code)}
                    </ul>
                </li>
            );
        });
    }

    render() {
        const { wcs, canClick, actions } = this.props;
        const { code } = actions.splitWCS(wcs);

        const title = this.getTitle(wcs);

        return (
            <Dropdown
                disabled={!canClick}
            >
                <Dropdown.Toggle>
                    {title}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <MenuItem header>{i18n._('Work Coordinate System')}</MenuItem>
                    {this.renderItems(wcs, code)}
                </Dropdown.Menu>
            </Dropdown>
        );
        /*
        return (
            <DropdownButton
                bsSize="sm"
                disabled={!canClick}
                title={title}
            >
                <MenuItem header>{i18n._('Work Coordinate System')}</MenuItem>
                {this.renderItems(wcs, code)}
            </DropdownButton>
        );
        */
    }
}

export default WCSMenu;
