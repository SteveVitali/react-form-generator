var FormGenerator = {
  /**
   * This creates a new FormGenerator form based on the schema
   * and gives it a particular ref for access later
   * @param  {Object} schema The mongoose-esque form schema
   * @param  {String} ref    The ref of the resultant JSX form
   * @return {JSX} The FormGeneratorForm for this schema
   */
  create: function(schema, ref) {
    return <FormGeneratorForm schema={schema} ref={ref}/>;
  },

  /**
   * Generate a set of input fields based on a form schema.
   * @param  {Schema}  schema     The mongoose-esque form schema
   * @return {Array} An array of JSX Input fields representing the schema
   */
  generate: function(schema) {
    var fields = [];
    for (var fieldName in schema) {
      var field = schema[fieldName];

      if (typeof field.type === 'object') {
        // Validate that it's an array
        if (field.type.length && field.type.length === 1) {
          // Array of native type like [String]
          // or [{ object: type, like: this }]
          fields.push(this.generateArrayField(fieldName, field));
        } else {
          // Regular { embedded: object }
          fields.push(this.generateObjectField(fieldName, field));
        }
      } else {
        // Flat field
        fields.push(this.generateFlatField(fieldName, field));
      }
    }
    return fields;
  },

  /**
   * Generate a flat field based on its name and type data
   * @param  {String} name  The name (ref) of the field
   * @param  {Object} field The Field object
   * @return {JSX}          A JSX representation of the field
   */
  generateFlatField: function(name, field) {
    if (field.type === String || field.type === Number) {
      if (field.enum) {
        return (
          <ReactBootstrap.Input
            type='select'
            ref={name}
            label={field.label || ''}
            placeholder={field.enum[0] || ''}>
            { _.map(field.enum, function(val) {
                return (
                  <option value={val}>{val}</option>
                );
              })
            }
          </ReactBootstrap.Input>
        );
      } else {
        return (
          <ReactBootstrap.Input
            type='text'
            ref={name}
            label={field.label}
            placeholder={field.label || ''}/>
        );
      }
    }
    else if (field.type === Date) {
      throw 'Date types unimplemented';
    }
  },

  /**
   * Generate an array field based on its name and type data
   * @param  {String} name  The name (ref) of the array field
   * @param  {Object} fieldSchema Array with one object, the array Field object
   * @return {ArrayField} A JSX ArrayField representation of the field
   */
  generateArrayField: function(name, fieldSchema) {
    var schema = fieldSchema.type[0];
    return (
      <ArrayField
        ref={name}
        label={fieldSchema.label}
        schema={schema}/>
    );
  },

  /**
   * Generate an object field based on its name and type data
   * @param  {String} name  The name (ref) of the object field
   * @param  {Object} field The form-schema of the object-field
   * @return {JSX}          A JSX representation of the object field
   */
  generateObjectField: function(name, fieldSchema) {
    // Update schema to use dot notation on form field refs
    // to indicate the object-embedded-ness during form construction
    var embeddedSchema = {};
    // Note: fieldSchema.type is itself a schema
    for (var field in fieldSchema.type) {
      var embeddedAccessor = name + '.' + field;
      embeddedSchema[embeddedAccessor] = fieldSchema.type[field];
    }
    var embeddedFields = this.generate(embeddedSchema);
    return (
      <ReactBootstrap.Panel header={fieldSchema.label}>
        {embeddedFields}
      </ReactBootstrap.Panel>
    );
  }
};

var ArrayField = React.createClass({
  propTypes: {
    ref: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    schema: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.func
    ])
  },

  getDefaultProps: function() {
    return {
      label: '',
      schema: String
    };
  },

  getInitialState: function() {
    return {
      // The number of things in the array
      values: 1
    };
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
            var customName = that.props.name + '.' + field + '-' + index;
            objectSchema[customName] = that.props.schema[field];
            var formField = FormGenerator.generate(objectSchema);
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
            that.props.name + '-' + index, {
              type: that.props.schema,
              label: that.props.label
            }
          )
        );
      }
    });
    return (
      <span>
        {elements}
        <ReactBootstrap.Button
          bsStyle='primary'
          bsSize='xsmall'
          onClick={this.addField}>
          Add
        </ReactBootstrap.Button>
        <ReactBootstrap.Button
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
    schema: React.PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {};
  },

  getInitialState: function() {
    return {
    };
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

    var getRawFormData = function(ref) {
      var node = React.findDOMNode(that.refs[ref]);
      console.log('found DOM node', node, 'for ref', ref);
      return node.value;
    };

    var parseFlatField = function(field) {
      parsedFormData[field] = getRawFormData(field);
    };

    // This converts the array-form-field-ref naming scheme of
    // field-0, field-1, field-2, etc. into an actual array
    // in the parsedFormData object
    var parseFlatArrayField = function(field) {
      var count = 0;
      var value = getRawFormData(field + '-' + count);
      while (value !== undefined) {
        if (!parsedFormData[field]) {
          parsedFormData[field] = [];
        }
        parsedFormData[field].push(value);
      }
    };

    var parseObjectField = function(field) {
      throw 'Unimplemented';
    };

    var parseObjectArrayField = function(field) {
      throw 'Unimplemented';
    };

    // baseField is the top-level field from the form schema
    // whereas accumulatorField represents the fields actual
    // name attribute in the JSX form
    // e.g. array-of-objects field could be called 'things'
    // whereas individual things would have name attributes
    // like 'things.thing_attribute-0'
    var parseField = function(baseField, accumulatorField) {
      var field = schema[accumulatorField];
      // Native type
      if (typeof field.type === 'function') {
        parseFlatField(accumulatorField);
      }
      else if (typeof field.type === 'object') {
        if (field.type.length) {
          // Array field
          if (field.type.length === 1) {
            // Array of native types
            if (typeof field.type[0] === 'function') {
              parseFlatArrayField(fieldKey);
            }
            // Array of objects
            else if (typeof field.type[0] === 'object') {
              parseObjectArrayField(fieldKey);
            }
            else {
              throw 'Parse Error: Unsupported schema';
            }
          }
          // Invalid schema
          else {
            throw 'Parse Error: Invalid schema';
          }
        }
        // Regular object field
        else {
          parseObjectField(fieldKey);
        }
      }
    };
    // Parse the fields
    for (var field in schema) {
      parseField(field, field);
    }
    return parsedFormData;
  },

  validate: function() {
    throw 'Unimplemented';
  },

  render: function() {
    return (
      <form>
        {FormGenerator.generate(this.props.schema)}
      </form>
    );
  }
});
