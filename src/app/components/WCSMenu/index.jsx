/* eslint-disable jsx-a11y/anchor-is-valid */
import classNames from 'classnames';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'app/components/Dropdown';
import i18n from 'app/lib/i18n';

export default class extends PureComponent {
    static propTypes = {
        wcs: PropTypes.string
    };

    splitWCS(wcs) {
        const regex = new RegExp('G(\\d\\d)\\.(\\d)');
        const result = regex.exec(wcs);
        if (result === undefined || result === null) {
            return wcs;
        }
        const code = Number(result[1]);
        const subcode = Number(result[2]);
        return { code, subcode };
    }

    wcsToP(wcs) {
        const { code, subcode } = this.splitWCS(wcs);
        return ((code - 54) * 10) + subcode + 1;
    }

    getTitle(wcs) {
        return `${wcs} (P${this.wcsToP(wcs)})`;
    }

    renderWCSSubItems(wcs, code) {
        return [...Array(10).keys()].map(subcode => {
            const cmd = `G${code}.${subcode}`;
            const p = this.wcsToP(cmd);

            return (
                <li
                    role="presentation"
                    key={p}
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
                            //controller.command('gcode', cmd);
                            //this.dropdownButton.onClick(event);
                        }}
                    >
                        {cmd} (P{p})
                    </a>
                </li>
            );
        });
    }

    renderWCSItems(wcs, activeCode) {
        return [54, 55, 56, 57, 58, 59].map(code => {
            const cmd = `G${code}`;
            const active = activeCode === code;

            return (
                <li
                    role="presentation"
                    key={code}
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
                        {this.renderWCSSubItems(wcs, code)}
                    </ul>
                </li>
            );
        });
    }

    render() {
        const { wcs } = this.props;
        const { code } = this.splitWCS(wcs);

        return (
            <Dropdown
                pullRight
                rootCloseEvent="mousedown"
            >
                <Dropdown.Toggle
                    btnSize="sm"
                    title={i18n._('Work Coordinate System')}
                >
                    {this.getTitle(wcs)}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                    {this.renderWCSItems(wcs, code)}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
