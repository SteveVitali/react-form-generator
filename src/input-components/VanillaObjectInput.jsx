import React from 'react'
import { Panel } from 'react-bootstrap'

const VanillaObjectInput = React.createClass({
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
     <div key={this.props.id}>
        <strong>{this.props.label}</strong>
        <br/>
        {this.props.children}
      </div>
    );
  }
});

export default VanillaObjectInput
