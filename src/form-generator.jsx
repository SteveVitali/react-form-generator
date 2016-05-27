import _ from 'underscore'
import React from 'react'
import { Button, Panel, FormControl, FormGroup, ControlLabel} from 'react-bootstrap'

const FormGenerator = {
  /**
   * This creates a new FormGenerator form based on the schema
   * and gives it a particular ref for access later
   * @param  {Object} schema The mongoose-esque form schema
   * @param  {String} ref    The ref of the resultant JSX form
   * @param  {Function} onSubmit What do do on submission
   * @param  {Boolean} validateOnSubmit Wait until submit to validate
   * @return {JSX} The FormGeneratorForm for this schema
   */
  create: function(schema, ref, onSubmit, validateOnSubmit) {
    return (
      <FormGeneratorForm
        schema={schema}
        ref={ref}
        onSubmit={onSubmit}
        validateOnSubmit={validateOnSubmit}/>
    );
  },

  /**
   * Generate a set of input fields based on a form schema.
   * @param  {Schema}   schema     A mongoose-yform schema
   * @param  {Any}      defaultValue The default value for this field
   * @param  {Function} onChange   Function to run any time a field changes
   * @param  {Boolean} validateOnSubmit Wait until submit to validate
   * @param  {Number}  i Optional array "key" prop
   * @return {Array} An array of JSX Input fields representing the schema
   */
  generate: function(schema, defaultValue, onChange, validateOnSubmit, i) {
    i = _.isNumber(i) ? i : 0;
    // Special case for array schemas
    if (_.isArray(schema)) {
      return [
        <ArrayField
          ref={key}
          key={0}
          id={0}
          schema={schema[0]}
          onChange={onChange}/>
      ];
    }
    let fields = [];
    for (let key in schema) {
      let field = schema[key];
      // Lower level default values take precedence
      defaultValue = defaultValue || {};
      let defaultVal = field.defaultValue || defaultValue[key] || '';

      if (typeof field.type === 'object') {
        // Validate that it's an array
        if (field.type.length && field.type.length === 1) {
          // Array of native type like [String]
          // or [{ object: type, like: this }]
          fields.push(
            <ArrayField
              ref={key}
              key={i}
              id={i}
              label={field.label}
              schema={field.type[0]}
              onChange={onChange}
              defaultValue={defaultVal}
              validateOnSubmit={validateOnSubmit}/>
          );
        } else {
          // Regular { embedded: object }
          fields.push(
            <ObjectField
              ref={key}
              key={i}
              id={i}
              label={field.label}
              schema={field.type}
              onChange={onChange}
              defaultValue={defaultVal || {}}
              validateOnSubmit={validateOnSubmit}/>
          );
        }
      } else {
        // Flat field
        fields.push(
          this.generateFlatField(
            key, field, defaultVal, onChange, validateOnSubmit, i
          )
        );
      }
      i++;
    }
    return fields;
  },

  /**
   * Generate a flat field based on its name and type data
   * @param  {String}   name     The name (ref) of the field
   * @param  {Object}   field    The Field object
   * @param  {String}   defaultValue The default value for this field
   * @param  {Function} onChange Function to run any time a field changes
   * @param  {Boolean} validateOnSubmit Wait until submit to validate
   * @param  {Number}  i Optional array "key" prop
   * @return {JSX}      A JSX representation of the field
   */
  generateFlatField: function(name, field, defaultValue, onChange, validateOnSubmit, i) {
    i = _.isNumber(i) ? i : 0;
    let validators =
      field.validators || (field.validate && [field.validate]) || [];

    if (field.hidden) {
      return (
        <FlatField
          type='hidden'
          ref={name}
          key={i}
          id={i}
          defaultValue={defaultValue}/>
      );
    }

    if (field.type === String || field.type === Number) {
      if (field.enum) {
        return (
          <FlatField
            type='select'
            ref={name}
            key={i}
            id={i}
            label={field.label || ''}
            placeholder={field.enum[0] || ''}
            defaultValue={defaultValue || field.enum[0]}
            children={ _.map(field.enum, function(val, i) {
                return (
                  <option value={val} key={i}>
                    {val}
                  </option>
                );
              })
            }
            validators={validators}
            onChange={onChange}
            isRequired={field.isRequired}
            validateOnSubmit={validateOnSubmit}/>
        );
      }
      else {
        return (
          <FlatField
            type={field.isPassword ? 'password' : 'text'}
            ref={name}
            key={i}
            id={i}
            label={field.label}
            placeholder={field.label || ''}
            defaultValue={defaultValue}
            validators={validators}
            onChange={onChange}
            isRequired={field.isRequired}
            isNumerical={field.type === Number}
            validateOnSubmit={validateOnSubmit}/>
        );
      }
    }
    else if (field.type === Boolean) {
      return (
        <FlatField
          type='checkbox'
          label={field.label}
          ref={name}
          key={i}
          id={i}
          defaultValue={defaultValue}
          validators={validators}
          onChange={onChange}
          isRequired={field.isRequired}
          validateOnSubmit={validateOnSubmit}/>
      );
    }
    else if (field.type === Date) {
      return (
        <FlatField
          type='date'
          label={field.label}
          ref={name}
          key={i}
          id={i}
          defaultValue={defaultValue}
          validators={validators}
          onChange={onChange}
          isRequired={field.isRequired}
          validateOnSubmit={validateOnSubmit}/>
      );
    }
    else {
      throw 'Unsupported type';
    }
  },

  // Useful validator functions
  validators: {
    lengthEquals: function(len) {
      return function(val) {
        return (val || '').length !== len
          ? 'Error: must be of length ' + len
          : null;
      };
    },

    minLength: function(min) {
      return function(val) {
        return (val || '').length < min
          ? 'Error: must be at least ' + min + ' characters'
          : null;
      };
    },

    maxLength: function(max) {
      return function(val) {
        return (val || '').length > max
          ? 'Error: must be less than ' + (max + 1) + ' characters'
          : null;
      };
    },

    regex: function(regex) {
      return function(val) {
        return !(val || '').match(regex)
          ? 'Error: invalid input'
          : null;
      };
    },

    nonEmpty: function() {
      return function(val) {
        return !val
          ? 'Error: field is required'
          : null;
      };
    },

    number: function() {
      return function(val) {
        return isNaN(val)
          ? 'Error: value must be numerical'
          : null;
      };
    }
  }
};

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

const flatTypes = [
  React.PropTypes.string,
  React.PropTypes.number,
  React.PropTypes.boolean
];

const FlatField = React.createClass({
  propTypes: {
    // text or select
    type: React.PropTypes.string,
    label: React.PropTypes.oneOfType(flatTypes),
    placeholder: React.PropTypes.oneOfType(flatTypes),
    children: React.PropTypes.array,
    defaultValue: React.PropTypes.any,
    validators: React.PropTypes.arrayOf(React.PropTypes.func),
    onChange: React.PropTypes.func,
    isRequired: React.PropTypes.bool,
    isNumerical: React.PropTypes.bool,
    isPassword: React.PropTypes.bool,
    validateOnSubmit: React.PropTypes.bool,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      type: 'text',
      label: '',
      placeholder: '',
      children: [],
      validators: [],
      onChange: function() {},
      defaultValue: '',
      isRequired: false,
      isNumerical: false,
      id: 0
    };
  },

  getInitialState: function() {
    return {
      value: this.props.defaultValue || '',
      errorMessages: []
    };
  },

  componentDidMount: function() {
    const errorMessages = this.props.validateOnSubmit
      ? []
      : this.validate(this.getValue());

    this.setState({
      errorMessages: errorMessages
    });
    this.props.onChange();
  },

  validate: function(value) {
    let validators = this.props.validators;
    // If required, add the nonEmpty validator
    validators = this.props.isRequired
      ? validators.concat([FormGenerator.validators.nonEmpty()])
      : validators;

    // If type Number, add the number validator
    validators = this.props.isNumerical
      ? validators.concat([FormGenerator.validators.number()])
      : validators;

    return _.compact(
      _.map(validators, function(validate) {
        return validate(value);
      })
    );
  },

  isValid: function() {
    return !this.validate(this.getValue()).length;
  },

  showErrorMessages: function() {
    this.setState({
      errorMessages: this.validate(this.getValue())
    });
  },

  getValue: function() {
    return this.state.value;
  },

  setValue: function(newValue) {
    const errorMessages = this.props.validateOnSubmit
      ? []
      : this.validate(this.getValue());

    this.setState({
      value: newValue,
      errorMessages: errorMessages
    }, this.props.onChange);
  },

  reset: function() {
    this.setValue(this.props.defaultValue);
  },

  onChange: function(e) {
    // If checkbox type, toggle value;
    // otherwise, use the event target value
    const newValue = this.props.type === 'checkbox'
      ? !this.state.value
      : e.target.value;

    this.setValue(newValue);
  },

  render: function() {
    const errorClass = this.state.errorMessages.length
      ? ' has-error'
      : '';

    return (function(that) {
      switch (that.props.type) {
        case 'text':
        case 'password': return (
          <div className={'form-group' + errorClass} key={that.props.id}>
            <label className='control-label'>
              {that.props.label}
            </label>
            <input className={'form-control'}
              type={that.props.type}
              label={that.props.label}
              placeholder={that.props.placeholder}
              onChange={that.onChange}
              value={that.state.value}/>
            { _.map(that.state.errorMessages, function(msg, i) {
                return (
                  <span className='help-block' key={i}>
                    {msg}
                  </span>
                );
            })}
          </div>
        );
        case 'checkbox': return (
          <FormControl
            type={that.props.type}
            key={that.props.id}
            label={that.props.label}
            placeholder={that.props.placeholder}
            onChange={that.onChange}
            checked={that.getValue()}/>
        );
        case 'select':
        return (
          <FormGroup key={that.props.id}>
            <ControlLabel>
              {that.props.label}
            </ControlLabel>
            <FormControl
              componentClass='select'
              placeholder={that.props.placeholder}
              onChange={that.onChange}
              value={that.state.value}>
              {that.props.children}
            </FormControl>
          </FormGroup>
        );
        case 'hidden': return <span key={that.props.id}/>;
        case 'date': throw 'Unimplemented';
        default: throw 'Unimplemented';
      }
    })(this);
  }
});

module.exports = FormGenerator;
