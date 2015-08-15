var Example = React.createClass({
  propTypes: {},

  getDefaultProps: function() {
    return {};
  },

  getInitialState: function() {
    return {};
  },

  render: function() {
    return <FormGenerator schema={{
      flat_field: {
        type: String,
        label: 'Flat Field'
      },
      enum_field: {
        type: String,
        enum: ['', 'value 1', 'value 2', 'value 3'],
        label: 'Enum field'
      },
      object_field: {
        type: {
          embedded_field1: {
            type: String,
            label: 'Embedded Field 1'
          },
          embedded_field2: {
            type: String,
            enum: ['embedded value 1', 'embedded value 2'],
            label: 'Embedded Field 2'
          },
          embedded_object: {
            type: {
              embedded_object_field1: {
                type: String,
                label: 'Embedded Object Field 1'
              },
              embedded_object_field2: {
                type: String,
                enum: [
                  'embedded object field value 1',
                  'embedded object field value 2'
                ],
                label: 'Embedded Object Field 2'
              }
            },
            label: 'Embedded Object'
          }
        },
        label: 'Simple Object Field'
      }
    }}/>;
  }
});
