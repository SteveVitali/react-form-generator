import _ from 'underscore'
import React from 'react'
import FormGeneratorForm from './FormGeneratorForm.jsx'
import ObjectField from './ObjectField.jsx'
import ArrayField from './ArrayField.jsx'
import FlatField from './FlatField.jsx'
import validators from './validators.js'

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

  validators: validators
};

export default FormGenerator
