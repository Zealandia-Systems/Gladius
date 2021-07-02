import PropTypes from 'prop-types';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import cx from 'classnames';
import Select from 'react-select';
import React, { PureComponent } from 'react';
import { OverlayTrigger, Popover, ListGroup, Button, ListGroupItem } from 'react-bootstrap';
import Space from 'app/components/Space';
//import ToolButton from 'app/components/ToolButton';

//import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import styles from './index.styl';

class Connection extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    isPortInUse = (port) => {
        const { state } = this.props;
        port = port || state.port;
        const o = find(state.ports, { port }) || {};
        return !!(o.inuse);
    };

    renderPortOption = (option) => {
        const { label, inuse, manufacturer } = option;
        const styles = {
            option: {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }
        };

        return (
            <div style={styles.option} title={label}>
                <div>
                    {inuse && (
                        <span>
                            <i className="fa fa-lock" />
                            <Space width="8" />
                        </span>
                    )}
                    {label}
                </div>
                {manufacturer &&
                    <i>{i18n._('Manufacturer: {{manufacturer}}', { manufacturer })}</i>
                }
            </div>
        );
    };

    renderPortValue = (option) => {
        const { state } = this.props;
        const { label, inuse } = option;
        const notLoading = !(state.loading);
        const canChangePort = notLoading;
        const style = {
            color: canChangePort ? '#333' : '#ccc',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        };
        return (
            <div style={style} title={label}>
                {inuse && (
                    <span>
                        <i className="fa fa-lock" />
                        <Space width="8" />
                    </span>
                )}
                {label}
            </div>
        );
    };

    renderBaudrateValue = (option) => {
        const { state } = this.props;
        const notLoading = !(state.loading);
        const notInUse = !(this.isPortInUse(state.port));
        const canChangeBaudrate = notLoading && notInUse;
        const style = {
            color: canChangeBaudrate ? '#333' : '#ccc',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        };
        return (
            <div style={style} title={option.label}>{option.label}</div>
        );
    };


    render() {
        const { state, actions } = this.props;
        const {
            loading, connecting, connected,
            ports, baudrates,
            port, baudrate,
            autoReconnect,
            connection,
            //alertMessage
        } = state;
        const enableHardwareFlowControl = get(connection, 'serial.rtscts', false);
        const notLoading = !loading;
        const notConnecting = !connecting;
        const notConnected = !connected;
        const canChangePort = notLoading && notConnected;
        const canChangeBaudrate = notLoading && notConnected && (!(this.isPortInUse(port)));
        const canToggleHardwareFlowControl = notConnected;
        const canOpenPort = port && baudrate && notConnecting && notConnected;
        const canClosePort = connected;

        const overlay = (props) => {
            //actions.handleRefreshPorts();

            return (
                <Popover id="connection" title="Connection">
                    <div className="form-group">
                        {canChangePort && (
                            <ListGroup>
                                {map(ports, (p) => {
                                    const o = {
                                        value: p.port,
                                        label: p.port,
                                        manufacturer: p.manufacturer,
                                        inuse: p.inuse
                                    };

                                    return (
                                        <ListGroupItem
                                            key={p.port}
                                            onClick={() => actions.onChangePortOption(o)}
                                            href="#"
                                            active={port === p.port}
                                        >
                                            {this.renderPortOption(o)}
                                        </ListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        )}
                        {connected && (
                            <ListGroup>
                                <ListGroupItem>
                                    {this.renderPortOption({
                                        value: port,
                                        label: port,
                                        manufacturer: (find(state.ports, { port }) || { manufacturer: '' }).manufacturer
                                    })}
                                </ListGroupItem>
                            </ListGroup>
                        )}
                    </div>
                    <div className="form-group">
                        <Select
                            label={i18n._('Baud rate')}
                            backspaceRemoves={false}
                            className="sm"
                            clearable={false}
                            disabled={!canChangeBaudrate}
                            menuContainerStyle={{ zIndex: 5 }}
                            name="baudrate"
                            onChange={actions.onChangeBaudrateOption}
                            options={map(baudrates, (value) => ({
                                value: value,
                                label: Number(value).toString()
                            }))}
                            placeholder={i18n._('Choose a baud rate')}
                            searchable={false}
                            value={baudrate}
                            valueRenderer={this.renderBaudrateValue}
                        />
                    </div>
                    {notConnected && (
                        <div
                            className={cx('checkbox', {
                                'disabled': !canToggleHardwareFlowControl
                            })}
                        >
                            <label>
                                <input
                                    type="checkbox"
                                    defaultChecked={enableHardwareFlowControl}
                                    onChange={actions.toggleHardwareFlowControl}
                                    disabled={!canToggleHardwareFlowControl}
                                />
                                {i18n._('Enable hardware flow control')}
                            </label>
                        </div>
                    )}
                    <div className="checkbox">
                        <label>
                            <input
                                type="checkbox"
                                defaultChecked={autoReconnect}
                                onChange={actions.toggleAutoReconnect}
                            />
                            {i18n._('Connect automatically')}
                        </label>
                    </div>
                    <div className="btn-group btn-group-sm">
                        {notConnected && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!canOpenPort}
                                onClick={actions.handleOpenPort}
                            >
                                <i className="fa fa-toggle-off" />
                                <Space width="8" />
                                {i18n._('Open')}
                            </button>
                        )}
                        {connected && (
                            <button
                                type="button"
                                className="btn btn-danger"
                                disabled={!canClosePort}
                                onClick={actions.handleClosePort}
                            >
                                <i className="fa fa-toggle-on" />
                                <Space width="8" />
                                {i18n._('Close')}
                            </button>
                        )}
                    </div>
                </Popover>
            );
        };

        return (
            <div className={styles.connection}>
                <ul className="nav navbar-nav">
                    <li className="btn-group btn-group-lg" role="group">
                        <OverlayTrigger
                            trigger="click"
                            rootClose
                            placement="bottom"
                            overlay={overlay()}
                            onEntering={actions.handleRefreshPorts}
                        >
                            <Button
                                className="btn btn-info"
                            >
                                {notConnected && (
                                    <i className="fa fa-plug" />
                                )}
                                {connected && (
                                    <i className="fa fa-check" />
                                )}
                                <Space width="8" />
                                {notConnected && i18n._('Disconnected')}
                                {connected && i18n._('Connected')}
                            </Button>
                        </OverlayTrigger>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Connection;
