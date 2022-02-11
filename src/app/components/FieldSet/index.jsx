import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class extends PureComponent {
    static propTypes = {
        title: PropTypes.string
    };

    state = {
        collapsed: false
    }

    handleCollapse = () => {
        const { collapsed } = this.state;

        this.setState({ collapsed: !collapsed });
    };

    render() {
        const { collapsed } = this.state;
        const { title, children } = this.props;

        return (
            <fieldset>
                <legend>
                    {title}
                    <button
                        type="button"
                        style={{ float: 'right', minWidth: '16px', lineHeight: '16px', border: 'none', backgroundColor: 'white' }}
                        onClick={() => this.handleCollapse()}
                    >
                        {collapsed ? (<i className="fa fa-angle-down" />) : (<i className="fa fa-angle-up" />)}
                    </button>
                </legend>
                {!collapsed && children}
            </fieldset>
        );
    }
}
