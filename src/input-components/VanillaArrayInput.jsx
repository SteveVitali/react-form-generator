import _ from 'underscore'
import React from 'react'

const VanillaArrayInput = React.createClass({
  propTypes: {
    buildElement: React.PropTypes.func.isRequired,
    addField: React.PropTypes.func.isRequired,
    removeField: React.PropTypes.func.isRequired,
    size: React.PropTypes.number,
    errors: React.PropTypes.array,
    label: React.PropTypes.string,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      size: 0,
      errors: [],
      label: '',
      id: 0
    };
  },

  render: function() {
    let arrayFields = [];
    _.times(this.props.size, (i) => {
      arrayFields.push(this.props.buildElement(i));
    });

    return (
      <div key={this.props.id}>
        <strong>{this.props.label}</strong>
        <br/>
        <div>{arrayFields}</div>
        <button onClick={this.props.addField} type='button'>Add</button>
        <button onClick={this.props.removeField} type='button'>Remove</button>
      </div>
    );
  }
});

export default VanillaArrayInput
