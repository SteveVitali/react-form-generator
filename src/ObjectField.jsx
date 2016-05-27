import _ from 'underscore'
import React from 'react'
import { Panel } from 'react-bootstrap'
import FormGenerator from './FormGenerator.jsx'

const ObjectField = React.createClass({
  propTypes: {
    schema: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.object,
    validateOnSubmit: React.PropTypes.bool,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      label: '',
      id: 0
    };
  },

  getInitialState: function() {
    return {};
  },

  getValue: function() {
    return _.mapObject(this.props.schema, (val, key) => {
      return this.refs[key].getValue();
    });
  },

  setValue: function(newValue) {
    for (let key in this.props.schema) {
      this.refs[key].setValue(newValue[key]);
    }
  },

  reset: function() {
    for (let field in this.props.schema) {
      this.refs[field].reset();
    }
  },

  onChange: function() {
    this.props.onChange();
  },

  isValid: function() {
    let valid = true;
    for (let field in this.props.schema) {
      valid = valid && this.refs[field].isValid();
    }
    return valid;
  },

  showErrorMessages: function() {
    for (let field in this.props.schema) {
      this.refs[field].showErrorMessages();
    }
  },

  render: function() {
    const subFields = FormGenerator.generate(
      this.props.schema,
      this.props.defaultValue,
      this.props.onChange,
      this.props.validateOnSubmit
    );
    return (
      <Panel
        header={this.props.label}
        key={this.props.id}>
        {subFields}
      </Panel>
    );
  }
});

export default ObjectField
