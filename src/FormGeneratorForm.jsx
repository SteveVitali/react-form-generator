import React from 'react'
import { Button } from 'react-bootstrap'
import ObjectField from './ObjectField.jsx'

const FormGeneratorForm = React.createClass({
  propTypes: {
    schema: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func,
    defaultValue: React.PropTypes.object,
    label: React.PropTypes.string,
    validateOnSubmit: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      label: '',
      onSubmit: function() {}
    };
  },

  getInitialState: function() {
    return {
      isValid: true,
      validateOnSubmit: this.props.validateOnSubmit
    };
  },

  onChange: function() {
    setTimeout(() => {
      this.setState({
        isValid: this.isValid()
      });
    }, 100);
  },

  onSubmit: function() {
    if (this.state.validateOnSubmit && !this.state.isValid) {
      return this.setState({
        validateOnSubmit: false
      }, this.showErrorMessages);
    }
    const onSubmit = this.props.onSubmit;
    onSubmit && onSubmit(this.getValue());
  },

  getValue: function() {
    return this.refs.toplevelForm.getValue();
  },

  setValue: function(val) {
    this.refs.toplevelForm.setValue(val);
  },

  reset: function() {
    this.refs.toplevelForm.reset();
  },

  isValid: function() {
    return this.refs.toplevelForm.isValid();
  },

  showErrorMessages: function() {
    this.refs.toplevelForm.showErrorMessages();
  },

  render: function() {
    const buttonDisabled = this.state.validateOnSubmit
      ? false
      : !this.state.isValid;

    return (
      <form>
        <ObjectField ref='toplevelForm'
          schema={this.props.schema}
          defaultValue={this.props.defaultValue}
          label={this.props.label}
          onChange={this.onChange}
          validateOnSubmit={this.state.validateOnSubmit}/>
        <Button
          bSize='large'
          onClick={this.onSubmit}
          disabled={buttonDisabled}>
          Submit
        </Button>
      </form>
    );
  }
});

export default FormGeneratorForm
