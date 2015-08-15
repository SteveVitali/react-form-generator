var FormGenerator = {
  /**
   * Generate a set of input fields based on a form schema.
   * This is the main function that gets called externally
   * when a form is getting generated.
   * @param  {Schema}  schema     The mongoose-esque form schema
   * @param  {Boolean} isEmbedded Whether the form is embedded or not
   * @return {FormGeneratorForm} If isEmbedded
   * @return {Array of form inputs} If !isEmbedded
   */
  generate: function(schema, isEmbedded) {
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
    return isEmbedded
      ? fields
      : <FormGeneratorForm schema={schema}/>;
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
    var embeddedFields = this.generate(embeddedSchema, true);
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
            var formField = (
              FormGenerator.generate(objectSchema, true)
            );
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

  parse: function() {
    throw 'Unimplemented';
  },

  validate: function() {
    throw 'Unimplemented';
  },

  render: function() {
    return (
      <form>
        {FormGenerator.generate(this.props.schema, true)}
      </form>
    );
  }
});
