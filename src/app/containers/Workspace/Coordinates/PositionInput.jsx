import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { InputGroup, Button } from 'react-bootstrap';

class PositionInput extends PureComponent {
    static propTypes = {
        defaultValue: PropTypes.string,
        onSave: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        min: PropTypes.number,
        max: PropTypes.number
    };

    static defaultProps = {
        defaultValue: '',
        min: -10000,
        max: 10000
    };

    state = {
        value: this.props.defaultValue
    };

    node = null;

    componentDidMount() {
        this.node.focus();
    }

    render() {
        const {
            onSave = noop,
            onCancel = noop,
            min,
            max
        } = this.props;
        const isNumber = (this.state.value !== '');

        return (
            <InputGroup>
                <input
                    ref={node => {
                        this.node = node;
                    }}
                    type="number"
                    className="form-control"
                    placeholder=""
                    style={{ borderRight: 'none' }}
                    value={this.state.value}
                    onChange={(event) => {
                        let value = event.target.value;

                        if (value === '') {
                            this.setState({ value: '' });
                            return;
                        }
                        if (value >= min && value <= max) {
                            this.setState({ value: value });
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.keyCode === 13) { // ENTER
                            onSave(this.state.value);
                        }
                        if (event.keyCode === 27) { // ESC
                            onCancel();
                        }
                    }}
                />
                <InputGroup.Button>
                    <Button
                        disabled={!isNumber}
                        onClick={(event) => {
                            onSave(this.state.value);
                        }}
                    >
                        <i className="fa fa-fw fa-check" />
                    </Button>
                </InputGroup.Button>
                <InputGroup.Button>
                    <Button
                        onClick={(event) => {
                            onCancel();
                        }}
                    >
                        <i className="fa fa-fw fa-times" />
                    </Button>
                </InputGroup.Button>
            </InputGroup>
        );
    }
}

export default PositionInput;
