import PropTypes from 'prop-types';
import React from 'react';
import Table from '@trendmicro/react-table';
import '@trendmicro/react-table/dist/react-table.css';
//import { Button } from 'react-bootstrap';
import Modal from 'app/components/Modal';
import i18n from 'app/lib/i18n';
import { Button } from 'react-bootstrap';
//import controller from 'app/lib/controller';

const Export = (props) => (
    <Modal
        size="lg"
        //disableOverlay={true}
        onClose={props.onClose}
    >
        <Modal.Header>
            <Modal.Title>{i18n._('Export')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Table
                columns={props.keys.map((key) => {
                    return {
                        title: key,
                        dataIndex: key
                    };
                })}
                data={props.data}
            />
        </Modal.Body>
        <Modal.Footer>
            <Button
                title="Copy to Clipboard"
                onClick={() => {
                    const csv = [
                        props.keys.join(','),
                        ...(props.data.map(row => props.keys.map(key => row[key]).join(',')))
                    ].join('\n');

                    navigator.clipboard.writeText(csv);
                }}
            >
                Copy to Clipboard
            </Button>
        </Modal.Footer>
    </Modal>
);

Export.propTypes = {
    title: PropTypes.string,
    onClose: PropTypes.func,
    keys: PropTypes.arrayOf(PropTypes.string),
    data: PropTypes.arrayOf(PropTypes.object)
};

export default Export;
