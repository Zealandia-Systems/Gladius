import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup } from 'react-bootstrap';
import styles from './index.styl';

const DigitalReadout = (props) => {
    const { label, value, children } = props;

    return (
        <tr>
            <td>
                <div className={styles.droLabel}>{label}</div>
            </td>
            <td style={{ width: '99%' }}>
                {value}
            </td>
            <td>
                <ButtonGroup style={{ display: 'flex' }}>
                    {children}
                </ButtonGroup>
            </td>
        </tr>
    );
};

DigitalReadout.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string
};

export default DigitalReadout;
