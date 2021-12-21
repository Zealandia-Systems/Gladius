import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Table from '@trendmicro/react-table';
import '@trendmicro/react-table/dist/react-table.css';

class SortableTable extends Component {
    static propTypes = {
        ...Table.propTypes,
        sortColumnKey: PropTypes.string,
        sortOrder: PropTypes.string,
        onSort: PropTypes.func
    };

    static defaultProps = {
        ...Table.defaultProps,
        sortOrder: 'asc'
    };

    constructor(props) {
        super(props);

        this.state = {
            sortColumnKey: props.sortColumnKey,
            sortOrder: props.sortOrder
        };
    }

    toggleSortOrder = (column) => (event) => {
        if (column.sortable) {
            const sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';

            this.setState(state => ({
                sortColumnKey: column.key,
                sortOrder: sortOrder
            }));

            this.props.onSort(column, sortOrder);
        }
    };

    render() {
        const { sortColumnKey, sortOrder } = this.state;
        const { columns, ...props } = this.props;

        delete props.sortColumnKey;
        delete props.onSort;
        delete props.sortOrder;

        return (
            <Table
                {...props}
                columns={columns.map(column => ({
                    ...column,
                    onClick: this.toggleSortOrder(column),
                    sortOrder: (column.key === sortColumnKey) ? sortOrder : ''
                }))}
            />
        );
    }
}

export default SortableTable;
