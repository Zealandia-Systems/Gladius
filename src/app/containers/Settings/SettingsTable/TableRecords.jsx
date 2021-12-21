/* eslint react/jsx-no-bind: 0 */
import chainedFunction from 'chained-function';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import FormGroup from 'app/components/FormGroup';
import Modal from 'app/components/Modal';
import Space from 'app/components/Space';
import SortableTable from 'app/components/SortableTable';
import { TablePagination } from 'app/components/Paginations';
import { ToastNotification } from 'app/components/Notifications';
import portal from 'app/lib/portal';
import i18n from 'app/lib/i18n';
import {
    MODAL_CREATE_RECORD,
    MODAL_UPDATE_RECORD
} from './constants';
import styles from './index.styl';

class TableRecords extends PureComponent {
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

    render() {
        const { state, actions, canCreate, canDelete, fields, port } = this.props;

        return (
            <div>
                {!port && (
                    <ToastNotification
                        style={{ maxWidth: '100%' }}
                        type="error"
                        dismissible={false}
                    >
                        Must be connected to edit.
                    </ToastNotification>
                )}
                <SortableTable
                    bordered={true}
                    justified={false}
                    sortColumnKey="index"
                    onSort={(column, sortOrder) => actions.fetchRecords({ sortColumn: column.id, sortOrder })}
                    data={(state.api.err || state.api.fetching) ? [] : state.records}
                    rowKey={(record) => {
                        return record.index;
                    }}
                    emptyText={() => {
                        if (state.api.err) {
                            return (
                                <span className="text-danger">
                                    {i18n._('An unexpected error has occurred.')}
                                </span>
                            );
                        }

                        if (state.api.fetching) {
                            return (
                                <span>
                                    <i className="fa fa-fw fa-spin fa-circle-o-notch" />
                                    <Space width="8" />
                                    {i18n._('Loading...')}
                                </span>
                            );
                        }

                        return i18n._('No data to display');
                    }}
                    footer={() => (
                        <div className={styles.tableToolbar}>
                            {canCreate && (
                                <Button
                                    onClick={() => {
                                        actions.openModal(MODAL_CREATE_RECORD);
                                    }}
                                >
                                    <i className="fa fa-plus" />
                                    <Space width="8" />
                                    {i18n._('Add')}
                                </Button>
                            )}
                            <TablePagination
                                style={{
                                    float: 'right',
                                    marginTop: '-14px',
                                    marginBottom: '-8px',
                                    paddingTop: '8px'
                                }}
                                page={state.pagination.page}
                                pageLength={state.pagination.pageLength}
                                totalRecords={state.pagination.totalRecords}
                                onPageChange={({ page, pageLength }) => {
                                    actions.fetchRecords({ page, pageLength });
                                }}
                                prevPageRenderer={() => <i className="fa fa-angle-left" />}
                                nextPageRenderer={() => <i className="fa fa-angle-right" />}
                            />
                        </div>
                    )}
                    columns={[
                        ...fields,
                        {
                            title: i18n._('Action'),
                            className: 'text-nowrap',
                            key: 'action',
                            width: 200,
                            render: (_value, record, _index) => {
                                const { index, readOnly } = record;

                                return (
                                    <div>
                                        {!readOnly && (
                                            <Button
                                                title={i18n._('Edit')}
                                                size="m"
                                                onClick={(event) => {
                                                    actions.openModal(MODAL_UPDATE_RECORD, record);
                                                }}
                                            >
                                                <i className="fa fa-fw fa-edit" />
                                                <Space width="8" />
                                                {i18n._('Edit')}
                                            </Button>
                                        )}
                                        {(canDelete && !readOnly) && (
                                            <Button
                                                title={i18n._('Delete')}
                                                onClick={(event) => {
                                                    portal(({ onClose }) => (
                                                        <Modal disableOverlay={false} size="xs" onClose={onClose}>
                                                            <Modal.Header>
                                                                <Modal.Title>
                                                                    {i18n._(`Delete ${state.recordName}`)}
                                                                </Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <FormGroup>
                                                                    {i18n._('Are you sure you want to delete this item?')}
                                                                </FormGroup>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button
                                                                    onClick={onClose}
                                                                >
                                                                    {i18n._('Cancel')}
                                                                </Button>
                                                                <Button
                                                                    bsStyle="primary"
                                                                    onClick={chainedFunction(
                                                                        () => {
                                                                            actions.deleteRecord(index);
                                                                        },
                                                                        onClose
                                                                    )}
                                                                >
                                                                    {i18n._('OK')}
                                                                </Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    ));
                                                }}
                                            >
                                                <i className="fa fa-fw fa-trash" />
                                                <Space width="8" />
                                                {i18n._('Delete')}
                                            </Button>
                                        )}
                                    </div>
                                );
                            }
                        }
                    ]}
                />
            </div>
        );
    }
}

export default TableRecords;
