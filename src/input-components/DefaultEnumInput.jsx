import _ from 'underscore'
import React from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'

const flatTypes = [
  React.PropTypes.string,
  React.PropTypes.number,
  React.PropTypes.boolean
];

const DefaultEnumInput = React.createClass({
  propTypes: {
    enum: React.PropTypes.array,
    errors: React.PropTypes.array,
    label: React.PropTypes.oneOfType(flatTypes),
    placeholder: React.PropTypes.oneOfType(flatTypes),
    value: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    value: React.PropTypes.any,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      enum: [],
      errors: [],
      label: '',
      placeholder: '',
      value: '',
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
      <FormGroup key={this.props.id}>
        <ControlLabel>
          {this.props.label}
        </ControlLabel>
        <FormControl
          componentClass='select'
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          value={this.props.value}>
          { _.map(this.props.enum, function(val, i) {
              return (
                <option value={val} key={i}>
                  {val}
                </option>
              );
            })}
        </FormControl>
      </FormGroup>
    );
  }
});

export default DefaultEnumInput
