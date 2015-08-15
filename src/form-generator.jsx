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

  render: function() {
    var schema = this.props.schema;
    var fields = [];
    for (var fieldName in schema) {
      var field = schema[fieldName];

      if (typeof field.type === 'object') {
        if (field.type.length && field.type.length === 1) {
          fields.push(this.generateArrayField(fieldName, field));
        } else {
          throw 'Embedded objects not supported';
        }
      } else {
        fields.push(this.generateFlatField(fieldName, field));
      }
    }
    return <form>{fields}</form>;
  }
});
