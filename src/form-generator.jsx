var FormGenerator = {
  /**
   * This creates a new FormGenerator form based on the schema
   * and gives it a particular ref for access later
   * @param  {Object} schema The mongoose-esque form schema
   * @param  {String} ref    The ref of the resultant JSX form
   * @param  {Function} onSubmit What do do on submission
   * @return {JSX} The FormGeneratorForm for this schema
   */
  create: function(schema, ref, onSubmit) {
    return (
      <FormGeneratorForm
        schema={schema}
        ref={ref}
        onSubmit={onSubmit}/>
    );
  },

  /**
   * Generate a set of input fields based on a form schema.
   * @param  {Schema}   schema     The mongoose-esque form schema
   * @param  {Function} onChange   Function to run any time a field changes
   * @return {Array} An array of JSX Input fields representing the schema
   */
  generate: function(schema, onChange) {
    var fields = [];
    for (var fieldName in schema) {
      var field = schema[fieldName];

      if (typeof field.type === 'object') {
        // Validate that it's an array
        if (field.type.length && field.type.length === 1) {
          // Array of native type like [String]
          // or [{ object: type, like: this }]
          fields.push(this.generateArrayField(fieldName, field, onChange));
        } else {
          // Regular { embedded: object }
          fields.push(this.generateObjectField(fieldName, field, onChange));
        }
      } else {
        // Flat field
        fields.push(this.generateFlatField(fieldName, field, onChange));
      }
    }
    return fields;
  },

  /**
   * Generate a flat field based on its name and type data
   * @param  {String}   name     The name (ref) of the field
   * @param  {Object}   field    The Field object
   * @param  {Function} onChange Function to run any time a field changes
   * @return {JSX}      A JSX representation of the field
   */
  generateFlatField: function(name, field, onChange) {
    var validators =
      field.validators || (field.validate && [field.validate]) || [];

    if (field.isRequired) {
      validators.push(this.validateNonEmpty);
    }

    if (field.type === String || field.type === Number) {
      if (field.enum) {
        return (
          <FlatField
            type='select'
            ref={name}
            name={name}
            label={field.label || ''}
            placeholder={field.enum[0] || ''}
            defaultValue={field.defaultValue || field.enum[0]}
            children={ _.map(field.enum, function(val) {
                return (
                  <option value={val}>{val}</option>
                );
              })
            }
            validators={validators}
            onChange={onChange}/>
        );
      }
      else {
        return (
          <FlatField
            type='text'
            ref={name}
            name={name}
            label={field.label}
            placeholder={field.label || ''}
            defaultValue={field.defaultValue}
            validators={validators}
            onChange={onChange}/>
        );
      }
    }
    else if (field.type === Boolean) {
      return (
        <FlatField
          type='checkbox'
          label={field.label}
          ref={name}
          name={name}
          defaultValue={field.defaultValue}
          validators={validators}
          onChange={onChange}/>
      );
    }
    else if (field.type === Date) {
      throw 'Date types unimplemented';
    }
    else {
      throw 'Unsupported type';
    }
  },

  /**
   * Generate an array field based on its name and type data
   * @param  {String} name  The name (ref) of the array field
   * @param  {Object} fieldSchema Array with one object, the array Field object
   * @param  {Function} onChange  Function to run any time a field changes
   * @return {ArrayField} A JSX ArrayField representation of the field
   */
  generateArrayField: function(name, fieldSchema, onChange) {
    var schema = fieldSchema.type[0];
    return (
      <ArrayField
        ref={name}
        name={name}
        label={fieldSchema.label}
        schema={schema}
        onChange={onChange}/>
    );
  },

  /**
   * Generate an object field based on its name and type data
   * @param  {String} name  The name (ref) of the object field
   * @param  {Object} field The form-schema of the object-field
   * @param  {Function} onChange Function to run any time a field changes
   * @return {JSX} A JSX representation of the object field
   */
  generateObjectField: function(name, fieldSchema, onChange) {
    // Update schema to use dot notation on form field refs
    // to indicate the object-embedded-ness during form construction
    var embeddedSchema = {};
    // Note: fieldSchema.type is itself a schema
    for (var field in fieldSchema.type) {
      var embeddedAccessor = name + '.' + field;
      embeddedSchema[embeddedAccessor] = fieldSchema.type[field];
    }
    var embeddedFields = this.generate(embeddedSchema, onChange);
    return (
      <ReactBootstrap.Panel header={fieldSchema.label}>
        {embeddedFields}
      </ReactBootstrap.Panel>
    );
  },

  // Useful validator functions
  validateNonEmpty: function(val) {
    return !val && 'Error: field is required';
  }
};

var FlatField = React.createClass({
  propTypes: {
    // text or select
    type: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    children: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    validators: React.PropTypes.arrayOf(React.PropTypes.func),
    onChange: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      type: 'text',
      label: '',
      placeholder: '',
      children: [],
      validators: [],
      onChange: function() {},
      defaultValue: ''
    };
  },

  getInitialState: function() {
    return {
      value: this.props.defaultValue || '',
      errorMessages: []
    };
  },

  componentDidMount: function() {
    var errorMessages = this.validate(this.getValue());
    var isValid = !errorMessages.length;

    this.setState({
      errorMessages: errorMessages
    });
    this.props.onChange(this.props.name, isValid);
  },

  validate: function(value) {
    return _.compact(
      _.map(this.props.validators, function(validate) {
        return validate(value);
      })
    );
  },

  isValid: function() {
    return !!this.validate(this.getValue()).length;
  },

  getValue: function() {
    return this.state.value;
  },

  setValue: function(newValue) {
    var errorMessages = this.validate(newValue);
    var isValid = !errorMessages.length;

    this.setState({
      value: newValue,
      errorMessages: errorMessages
    });
    this.props.onChange(this.props.name, isValid);
  },

  reset: function() {
    console.log('Resetting node', this.props.name);
    this.setValue(this.props.defaultValue);
  },

  onChange: function(e) {
    // If checkbox type, toggle value;
    // otherwise, use the event target value
    var newValue = this.props.type === 'checkbox'
      ? !this.state.value
      : e.target.value;

    this.setValue(newValue);
  },

  render: function() {
    var errorClass = this.state.errorMessages.length
      ? ' has-error'
      : '';

    return (function(that) {
      switch (that.props.type) {
        case 'text': return (
          <div className={'form-group' + errorClass}>
            <label className='control-label'>
              {that.props.label}
            </label>
            <input className={'form-control'}
              type={that.props.type}
              label={that.props.label}
              placeholder={that.props.placeholder}
              onChange={that.onChange}
              value={that.state.value}/>
            { _.map(that.state.errorMessages, function(msg) {
                return (
                  <span className='help-block'>
                    {msg}
                  </span>
                );
            })}
          </div>
        );
        case 'checkbox': return (
          <ReactBootstrap.Input
            type={that.props.type}
            label={that.props.label}
            placeholder={that.props.placeholder}
            onChange={that.onChange}
            checked={that.getValue()}/>
        );
        case 'select': return (
          <ReactBootstrap.Input
            type={that.props.type}
            label={that.props.label}
            placeholder={that.props.placeholder}
            onChange={that.onChange}
            value={that.state.value}>
            {that.props.children}
          </ReactBootstrap.Input>
        );
      }
    })(this);
  }
});

var ArrayField = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    schema: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.func
    ]),
    onChange: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      label: '',
      schema: String,
      onChange: function() {}
    };
  },

  getInitialState: function() {
    return {
      // The number of things in the array
      values: 1
    };
  },

  reset: function() {
    this.setState({
      values: 1
    });
  },

  addField: function() {
    this.setState({
      values: this.state.values + 1
    });
  },

  removeField: function() {
    var decremented = this.state.values - 1;
    // Don't let the number of values become < 1
    this.setState({
      values: decremented || 1
    });
  },

  render: function() {
    var that = this;
    var elements = [];
    var schema = that.props.schema;
    var onChange = that.props.onChange;

    _.times(this.state.values, function(index) {
      if (typeof schema === 'object') {
        // Case array of natives or objects
        if (schema.length && schema.length === 1) {
          throw 'Arrays of arrays are unimplemented';
        }
        // Case array of objects
        else {
          var objectFields = [];
          for (var field in that.props.schema) {
            var objectSchema = {};
            var customName = that.props.name + '-' + index + '.' + field;
            objectSchema[customName] = that.props.schema[field];
            var formField = FormGenerator.generate(objectSchema, onChange);
           objectFields.push(formField);
          }
          elements.push(
            <ReactBootstrap.Panel header={that.props.label}>
              {objectFields}
            </ReactBootstrap.Panel>
          );
        }
      }
      // Case raw native type
      else if (typeof that.props.schema === 'function') {
        elements.push(
          FormGenerator.generateFlatField(
            that.props.name + '-' + index,
            { type: that.props.schema,
              label: that.props.label
            },
            onChange
          )
        );
      }
    });
    var btnStyle = {
      marginTop: '-14px',
      marginBottom: '10px'
    };
    return (
      <span>
        {elements}
        <ReactBootstrap.Button
          style={btnStyle}
          bsStyle='primary'
          bsSize='xsmall'
          onClick={this.addField}>
          Add
        </ReactBootstrap.Button>
        <ReactBootstrap.Button
          style={btnStyle}
          bsStyle='primary'
          bsSize='xsmall'
          onClick={this.removeField}>
          Remove
        </ReactBootstrap.Button>
      </span>
    );
  }
});

var FormGeneratorForm = React.createClass({
  propTypes: {
    schema: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {};
  },

  getInitialState: function() {
    return {
      isValid: true,
      validFieldsMap: {}
    };
  },

  onChange: function(fieldRef, isFieldValid) {
    var validityMap = this.state.validFieldsMap;
    validityMap[fieldRef] = isFieldValid;

    // isFormValid = true when all fields are valid
    var isFormValid = true;
    for (var field in validityMap) {
      isFormValid = isFormValid && validityMap[field];
    }

    this.setState({
      validFieldsMap: validityMap,
      isValid: isFormValid
    });
  },

  isValid: function() {
    return this.state.isValid;
  },

  reset: function() {
    var clearRefs = function clearRefs(contextNode, ref) {
      var refNode = contextNode.refs[ref];
      refNode.reset && refNode.reset();
      for (var subRef in refNode.refs) {
        clearRefs(refNode, subRef);
      }
    };
    for (var ref in this.refs) {
      clearRefs(this, ref);
    }
  },

  /**
   * Extract from the form data an object that is formatted
   * in the same way as the original form schema
   * @return {Object} An object representing the form data
   */
  parse: function() {
    var that = this;
    var schema = this.props.schema;
    // All the parse functions below will populate this object
    // with the correct form data and in the end build up an
    // object in the same shape as the schema, with data populated
    var parsedFormData = {};

    var getValueFromRef = function(contextNode, ref) {
      var node = contextNode.refs[ref];
      return node ? node.getValue() : undefined;
    };

    var getRawFormData = function(ref) {
      return getValueFromRef(that, ref);
    };

    // e.g. 'welp-12.welp_subfield.womp-4' => welp.welp_subfield.womp
    var getFieldPath = function(fieldString) {
      // This regex matches all the suffixes added to array field
      // property names, like the '-12' in 'welp-12', the 13th
      // element in an array called welp8
      var arrayRegex = /([-][0-9]+)/g;
      var cleanPath = fieldString.replace(arrayRegex, '');
      return cleanPath.split('.');
    };

    var getTokenAccessor = function(token) {
      return isNaN(token)
        ? token
        : (-1 * Number(token));
    };

    // fieldRef is the ref to this field
    var parseFlatField = function(fieldRef, context) {
      console.log('Parsing flat field with ref', fieldRef);
      // Use rawFormData to get the eventual value we store
      var fieldValue = getValueFromRef(context, fieldRef);

      // Don't bother constructing the field in the results object
      // if we're just going to put an emptystring there
      if (fieldValue === '') { return; }

      // e.g. 'welp-1.womp.welp-2.wilp'
      //   => ["welp", "-1", "womp", undefined, "welp", "-2", "wilp"]
      var splitComponents = [];
      var fieldSplit = fieldRef.split('.');
      _.each(fieldSplit, function(token) {
        var arraySplit = token.split('-');
        _.each(arraySplit, function(smallerToken) {
          splitComponents.push(getTokenAccessor(smallerToken));
        });
      });

      console.log('Tokenized', fieldRef, 'into', splitComponents);

      // This will be where we store the eventual fieldValue
      var targetObject = parsedFormData;

      var count = -1;
      while (++count < splitComponents.length) {
        var token = getTokenAccessor(splitComponents[count]);
        console.log('TOKEN' + count, token);
        if (token === undefined) { continue; }
        // Token can be an array accessor or a field name
        // Javascript treats them both the same though :)
        if (count === splitComponents.length - 1) {
          // Set the field and return
          console.log('last token chunk', token, fieldValue);
          return (targetObject[token] = fieldValue);
        } else {
          // If token is an array index, make sure array exists
          // and is big enough
          var nextToken = getTokenAccessor(splitComponents[count + 1]);
          if (!isNaN(nextToken)) {
            if (!targetObject[token] || !targetObject[token].length) {
              console.log('initializing array called', token);
              targetObject[token] = [];
            }
            while (targetObject.length < nextToken) {
              // In 99.99% of cases, this should just add
              // one dummy object so the array is long enough
              targetObject.push({});
            }
          } else {
            if (!targetObject[token]) {
              console.log('initializing object at field', token);
              targetObject[token] = {};
            }
          }
          targetObject = targetObject[token];
        }
      }
    };

    // This converts the array-form-field-ref naming scheme of
    // field-0, field-1, field-2, etc. into an actual array
    // in the parsedFormData object
    var parseFlatArrayField = function(fieldRef, context) {
      console.log('Parsing flat array field with ref', fieldRef);
      var count = 0;
      var arrayParentNode = context.refs[fieldRef];
      var value = getValueFromRef(arrayParentNode, fieldRef + '-' + count);
      while (value !== undefined) {
        if (!parsedFormData[fieldRef]) {
          parsedFormData[fieldRef] = [];
        }
        parsedFormData[fieldRef].push(value);
        var newRef = fieldRef + '-' + (++count);
        value = getValueFromRef(arrayParentNode, newRef);
      }
      parsedFormData[fieldRef] = _.compact(parsedFormData[fieldRef]);
    };

    var parseObjectField = function(field, fieldSchema, context) {
      console.log('Parsing object field', field);
      for (var subField in fieldSchema) {
        parseField(field + '.' + subField, context);
      }
    };

    var parseObjectArrayField = function(fieldRef, fieldSchema, context) {
      console.log('Parsing object array field', fieldRef);

      var arrayParentNode = context.refs[fieldRef];

      // We need to do this to account for cases where there are
      // embedded object arrays, since, for example, we could have
      // a ref to 'object_field.field1', but not to 'object_field'
      var refs = _.keys(arrayParentNode.refs);
      var hasRef = function(ref) {
        return _.reduce(refs, function(memo, r) {
          return memo || r.indexOf(ref) !== -1;
        }, false);
      };

      for (var subField in fieldSchema) {
        var count = 0;
        var fieldPath = fieldRef + '-' + count + '.' + subField;
        while (hasRef(fieldPath)) {
          parseField(fieldPath, arrayParentNode);
          fieldPath = fieldRef + '-' + (++count) + '.' + subField;
        }
      }
    };

    // accumulatorField represents the field's actual
    // nref attribute in the JSX form
    // e.g. array of objects field could be called 'things'
    // whereas individual things would have name attributes
    // like 'things.thing_attribute-0'
    var parseField = function parseField(accumulatorField, context) {
      var fieldPath = getFieldPath(accumulatorField);
      console.log('Calling parseField on', accumulatorField, fieldPath);
      console.log('WITH CONTEXT', context);

      // Dot into the schema field, which may or may not
      // be deeply nested in an object
      var field = schema[fieldPath[0]];
      var count = 0;
      while (++count < fieldPath.length) {
        if (typeof field.type === 'object' && field.type.length === 1) {
          // It's an array and we have to dot into the zeroth element
          field = field.type[0];
        }
        else {
          field = field.type;
        }
        field = field[fieldPath[count]];
      }
      console.log('We get the field', field, schema);
      // Native type
      if (typeof field.type === 'function') {
        parseFlatField(accumulatorField, context);
      }
      else if (typeof field.type === 'object') {
        if (field.type.length) {
          // Array field
          if (field.type.length === 1) {
            // Array of native types
            if (typeof field.type[0] === 'function') {
              parseFlatArrayField(accumulatorField, context);
            }
            // Array of objects
            else if (typeof field.type[0] === 'object') {
              parseObjectArrayField(accumulatorField, field.type[0], context);
            }
            else {
              throw 'Parse Error: Unsupported schema';
            }
          }
          else {
            throw 'Parse Error: Invalid schema';
          }
        }
        // Regular object field
        else {
          parseObjectField(accumulatorField, field.type, context);
        }
      }
    };
    // Parse the fields
    for (var field in schema) {
      parseField(field, that);
    }
    return parsedFormData;
  },

  render: function() {
    return (
      <form>
        {FormGenerator.generate(this.props.schema, this.onChange)}
        <br/>
        <ReactBootstrap.Button
          bSize='large'
          onClick={this.props.onSubmit}
          disabled={!this.state.isValid}>
          Submit
        </ReactBootstrap.Button>
      </form>
    );
  }
});
