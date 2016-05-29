import React from 'react'
import { Checkbox } from 'react-bootstrap'

const flatTypes = [
  React.PropTypes.string,
  React.PropTypes.number,
  React.PropTypes.boolean
];

const DefaultBoolInput = React.createClass({
  propTypes: {
    errors: React.PropTypes.array,
    label: React.PropTypes.oneOfType(flatTypes),
    placeholder: React.PropTypes.oneOfType(flatTypes),
    value: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      errors: [],
      label: '',
      placeholder: '',
      value: false,
      onChange: function() {},
      id: 0
    };
  },

  onChange: function(e) {
    this.props.onChange(e);
  },

  render: function() {
    // const errorClass = this.props.errors.length
    //   ? ' has-error'
    //   : '';
    return (
      <Checkbox key={this.props.id}
        onChange={this.onChange}
        checked={this.props.value}>
        {this.props.label}
      </Checkbox>
    );
  }
});

export default DefaultBoolInput
