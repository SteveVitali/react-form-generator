var FormGenerator = React.createClass({
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

  generateArrayField: function(name, field) {
    throw 'Array fields unimplemented';
  },

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
  },

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
        fields.push(this.generateFlatField(fieldName, field));
      }
    }
    return fields;
  },

  render: function() {
    return (
      <form>
        {this.generate(this.props.schema)}
      </form>
    );
  }
});
