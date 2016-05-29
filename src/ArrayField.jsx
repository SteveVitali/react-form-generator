import _ from 'underscore'
import React from 'react'
import { Button, Panel } from 'react-bootstrap'
import DefaultArrayInput from './input-components/DefaultArrayInput.jsx'

const ArrayField = React.createClass({
  propTypes: {
    formGenerator: React.PropTypes.object.isRequired,
    schema: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.object,
      React.PropTypes.array
    ]).isRequired,
    onChange: React.PropTypes.func.isRequired,
    label: React.PropTypes.string,
    initialLength: React.PropTypes.number,
    validateOnSubmit: React.PropTypes.bool,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      defaultValue: [],
      label: '',
      initialLength: 1,
      refPrefix: 'array_ref',
      id: 0
    };
  },

  getInitialState: function() {
    const negativeOrZero = function(num) {
      return num < 0 ? 0 : num;
    };
    const defaultLength = negativeOrZero(this.props.defaultValue.length);
    const initialLength = negativeOrZero(this.props.initialLength);
    const actualLength = defaultLength || initialLength || 1;
    return {
      size: actualLength,
      errors: []
    };
  },

  getValue: function() {
    const refPrefix = this.props.refPrefix;
    const refs = this.refs.arrayElement.refs;
    let values = [];
    _.times(this.state.size, (i) => {
      values.push(refs[refPrefix + i].getValue());
    });
    return values;
  },

  setValue: function(values) {
    const refs = this.refs.arrayElement.refs;
    this.setState({
      size: values.length || 1
    },
    () => {
      const refPrefix = this.props.refPrefix;
      _.each(values, (value, i) => {
        refs[refPrefix + i].setValue(value);
      });
    });
  },

  reset: function() {
    this.setValue(this.props.defaultValue);
  },

  isValid: function() {
    const refs = this.refs.arrayElement.refs;
    const refPrefix = this.props.refPrefix;
    let valid = true;
    _.times(this.state.size, (i) => {
      valid = valid && refs[refPrefix + i].isValid();
    });
    return valid;
  },

  showErrorMessages: function() {
    const refPrefix = this.props.refPrefix;
    const refs = this.refs.arrayElement.refs;
    _.times(this.state.size, (i) => {
      refs[refPrefix + i].showErrorMessages();
    });
  },

  addField: function() {
    this.setState({
      size: this.state.size + 1
    });
  },

  removeField: function() {
    const decremented = this.state.size - 1;
    // Don't let the number of values become < 1
    this.setState({
      size: decremented || 1
    });
  },

  onChange: function(e) {
    this.props.onChange(e);
  },

  buildElement: function(i) {
    const refPrefix = this.props.refPrefix;
    const defaultValue = this.props.defaultValue;
    const onChange = this.onChange;
    const validateOnSubmit = this.props.validateOnSubmit;
    const schema = this.props.schema;
    const defaultVal = (defaultValue && defaultValue[i]) || '';
    const fieldRef = refPrefix + i;

    // Flat/native type
    if (typeof schema === 'function') {
      const mockSchema = {
        type: schema,
        label: this.props.label,
        defaultValue: defaultVal
      };
      return this.props.formGenerator.generateFlatField(
        refPrefix + i, mockSchema, defaultVal, onChange, validateOnSubmit, i
      );
    } else {
      // It's an object or an object array, so use 'generate'
      let schemaWrapper = {};
      schemaWrapper[fieldRef] = {
        type: schema,
        defaultValue: defaultVal
      };
      return this.props.formGenerator.generate(
        schemaWrapper, defaultVal, onChange, validateOnSubmit, i
      );
    }
  },

  render: function() {
    const ArrayInput = this.props.formGenerator.inputs.ArrayInput;
    return (
      <ArrayInput
        ref={'arrayElement'}
        buildElement={this.buildElement}
        addField={this.addField}
        removeField={this.removeField}
        size={this.state.size}
        errors={this.state.errors}
        label={this.props.label}
        key={this.props.id}
        id={this.props.id}/>
    );
  }
});

export default ArrayField
