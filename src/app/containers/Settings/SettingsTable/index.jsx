import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import EditRecord from './EditRecord';
import TableRecords from './TableRecords';
import {
    MODAL_CREATE_RECORD,
    MODAL_UPDATE_RECORD
} from './constants';
import styles from './index.styl';

class SettingsTable extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object,
        canCreate: PropTypes.bool,
        canDelete: PropTypes.bool,
        port: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        canDelete: true
    }

    componentDidMount() {
        const { actions } = this.props;
        actions.fetchRecords();
    }

    render() {
        const { state, actions, canCreate, canDelete, port, fields } = this.props;

        return (
            <div style={{ pointerEvents: port ? 'inherit' : 'none' }}>
                {!port && (
                    <div className={styles.overlay} />
                )}
                {state.modal.name === MODAL_CREATE_RECORD && (
                    <EditRecord
                        state={state} actions={actions} fields={fields}
                        create={true}
                    />
                )}
                {state.modal.name === MODAL_UPDATE_RECORD && (
                    <EditRecord
                        state={state} actions={actions} fields={fields}
                        create={false}
                    />
                )}
                <TableRecords
                    state={state} actions={actions} fields={fields}
                    canCreate={canCreate}
                    canDelete={canDelete}
                    port={port}
                />
            </div>
        );
    }
}

export default SettingsTable;
