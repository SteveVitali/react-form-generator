import _ from 'underscore'
import React from 'react'
import { Button, Panel } from 'react-bootstrap'
import FormGenerator from './FormGenerator.jsx'

const ArrayField = React.createClass({
  propTypes: {
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
      size: actualLength
    };
  },

  getValue: function() {
    const refPrefix = this.props.refPrefix;
    let values = [];
    _.times(this.state.size, (i) => {
      values.push(this.refs[refPrefix + i].getValue());
    });
    return values;
  },

  setValue: function(values) {
    this.setState({
      size: values.length || 1
    },
    () => {
      const refPrefix = this.props.refPrefix;
      _.each(values, (value, i) => {
        this.refs[refPrefix + i].setValue(value);
      });
    });
  },

  reset: function() {
    this.setValue(this.props.defaultValue);
  },

  isValid: function() {
    const refPrefix = this.props.refPrefix;
    let valid = true;
    _.times(this.state.size, (i) => {
      valid = valid && this.refs[refPrefix + i].isValid();
    });
    return valid;
  },

  showErrorMessages: function() {
    const refPrefix = this.props.refPrefix;
    _.times(this.state.size, (i) => {
      this.refs[refPrefix + i].showErrorMessages();
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

  render: function() {
    const schema = this.props.schema;
    const refPrefix = this.props.refPrefix;
    const defaultValue = this.props.defaultValue;
    const onChange = this.props.onChange;
    const validateOnSubmit = this.props.validateOnSubmit;

    let arrayFields = [];
    _.times(this.state.size, (i) => {
      const defaultVal = (defaultValue && defaultValue[i]) || '';
      const fieldRef = refPrefix + i;
      // Flat/native type
      if (typeof schema === 'function') {
        const mockSchema = {
          type: schema,
          label: this.props.label,
          defaultValue: defaultVal
        };
        arrayFields.push(
          FormGenerator.generateFlatField(
            fieldRef, mockSchema, defaultVal, onChange, validateOnSubmit, i
          )
        );
      } else {
        // It's an object or an object array, so use 'generate'
        let schemaWrapper = {};
        schemaWrapper[fieldRef] = {
          type: schema,
          defaultValue: defaultVal
        };
        arrayFields.push(
          FormGenerator.generate(
            schemaWrapper, defaultVal, onChange, validateOnSubmit, i
          )
        );
      }
    });
    return (
      <div key={this.props.id}>
        <Panel header={this.props.label}>
          {arrayFields}
          <Button
            bsStyle='primary'
            bsSize='xsmall'
            onClick={this.addField}>
            Add
          </Button>
          <Button
            bsStyle='primary'
            bsSize='xsmall'
            onClick={this.removeField}>
            Remove
          </Button>
        </Panel>
      </div>
    );
  }
});

export default ArrayField
