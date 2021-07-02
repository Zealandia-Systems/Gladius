import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Space from 'app/components/Space';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import styles from './index.styl';
import * as settings from '../Settings';

class QuickAccessToolbar extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    command = {
        'cyclestart': () => {
            controller.command('cyclestart');
        },
        'feedhold': () => {
            controller.command('feedhold');
        },
        'homing': () => {
            controller.command('homing');
        },
        'toolChange': () => {
            controller.command('toolChange');
        },
        'reset': () => {
            controller.command('reset');
        }
    };

    render() {
        return (
            <div className={styles.quickAccessToolbar}>
                <ul className="nav navbar-nav">
                    <li className="btn-group btn-group-lg" role="group">
                        <button
                            type="button"
                            className="btn"
                            onClick={this.command.cyclestart}
                            title={i18n._('Cycle Start')}
                        >
                            <i className="fa fa-repeat" />
                            <Space width="8" />
                            {i18n._('Cycle Start')}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={this.command.feedhold}
                            title={i18n._('Feedhold')}
                        >
                            <i className="fa fa-hand-paper-o" />
                            <Space width="8" />
                            {i18n._('Feedhold')}
                        </button>
                    </li>
                    <li className="btn-group btn-group-lg" role="group">
                        <button
                            type="button"
                            className="btn"
                            onClick={this.command.homing}
                            title={i18n._('Homing')}
                        >
                            <i className="fa fa-home" />
                            <Space width="8" />
                            {i18n._('Homing')}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={this.command.toolChange}
                            title={i18n._('Tool Change')}
                        >
                            <i className="fa fa-wrench" />
                            <Space width="8" />
                            {i18n._('Tool Change')}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={this.command.reset}
                            title={i18n._('Reset')}
                        >
                            <i className="fa fa-undo" />
                            <Space width="8" />
                            {i18n._('Reset')}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => settings.show()}
                            title={i18n._('Settings')}
                        >
                            <i className="fa fa-cogs" />
                            <Space width="8" />
                            {i18n._('Settings')}
                        </button>
                    </li>
                </ul>
            </div>
        );
    }
}

export default QuickAccessToolbar;
