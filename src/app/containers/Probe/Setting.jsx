import PropTypes from 'prop-types';
import React from 'react';
import { Popover, FormGroup, Overlay } from 'react-bootstrap';

function transform(value) {
    const result = [];

    if (typeof value === 'string') {
        result.push(value);
    } else if (value !== null && value !== undefined && typeof value === 'object') {
        for (const [key, childValue] of Object.entries(value)) {
            const children = transform(childValue);

            result.push(React.createElement(key, {}, children));
        }
    }

    return result;
}

export default class Setting extends React.Component {
    static propTypes = {
        controlId: PropTypes.string,
        help: PropTypes.exact({
            title: PropTypes.string,
            body: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object
            ]),
            bodyJsx: PropTypes.object
        })
    }

    constructor(props) {
        super(props);

        this.target = null;

        this.setTarget = (target) => {
            this.target = target;
        };
    }

    state = {
        show: false
    };

    renderOverlay(help, show, controlId) {
        const { title, body: rawBody, bodyJsx } = help;

        const body = bodyJsx ?? transform(rawBody);
        return (
            <Overlay
                show={show}
                target={this.target}
                placement="left"
            >
                <Popover
                    id={`${controlId}-popover`}
                    title={title}
                >
                    {body}
                </Popover>
            </Overlay>
        );
    }

    render() {
        const { show } = this.state;
        const { children, help, controlId } = this.props;

        return (
            <FormGroup ref={this.setTarget} onFocus={(event) => this.setState({ show: true })} onBlur={(event) => this.setState({ show: false })}>
                {help && this.renderOverlay(help, show, controlId)}
                {children}
            </FormGroup>
        );
    }
}
