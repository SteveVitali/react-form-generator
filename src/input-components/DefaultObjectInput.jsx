import React from 'react'
import { Panel } from 'react-bootstrap'

const DefaultObjectInput = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
    children: React.PropTypes.array,
    id: React.PropTypes.number,
    errors: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      label: '',
      children: [],
      errors: [],
      id: 0
    };
  },

  render: function() {
    return (
     <Panel header={this.props.label} key={this.props.id}>
        {this.props.children}
      </Panel>
    );
  }
});

export default DefaultObjectInput
