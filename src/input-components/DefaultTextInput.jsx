import _ from 'underscore'
import React from 'react'

const flatTypes = [
  React.PropTypes.string,
  React.PropTypes.number,
  React.PropTypes.boolean
];

const DefaultTextInput = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    errors: React.PropTypes.array,
    label: React.PropTypes.oneOfType(flatTypes),
    placeholder: React.PropTypes.oneOfType(flatTypes),
    value: React.PropTypes.any,
    onChange: React.PropTypes.func,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      type: 'text',
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
    const errorClass = this.props.errors.length
      ? ' has-error'
      : '';

    return (
      <div className={'form-group' + errorClass} key={this.props.id}>
        <label className='control-label'>
          {this.props.label}
        </label>
        <input className={'form-control'}
          type={this.props.type}
          label={this.props.label}
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          value={this.props.value}/>
        { _.map(this.props.errors, function(msg, i) {
            return (
              <span className='help-block' key={i}>
                {msg}
              </span>
            );
          })
        }
      </div>
    );
  }
});

export default DefaultTextInput
