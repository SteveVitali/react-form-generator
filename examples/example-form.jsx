var Example = React.createClass({
  propTypes: {},

  getDefaultProps: function() {
    return {};
  },

  getInitialState: function() {
    return {};
  },

  render: function() {
    var that = this;
    return FormGenerator.create({
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
      },
      array_field: {
        type: [String],
        label: 'Array of Strings'
      },
      simple_object_array: {
        type: [{
          obj_arr_field1: {
            type: String,
            label: 'Obj arr field 1'
          },
          obj_arr_field2: {
            type: String,
            label: 'Obj arr field 2'
          }
        }],
        label: 'Simple Object Array'
      },
      object_array_field: {
        type: [{
          flat_field: {
            type: String,
            label: 'Flat Object Array Field'
          },
          object_field: {
            type: {
              object_array_object_field1: {
                type: String,
                label: 'Flat Object-Array Object-Field'
              },
              object_array_array_field: {
                type: [{
                  object_array_object_array_field1: {
                    type: String,
                    label: 'Object-Array Object-Array Field 1'
                  },
                  object_array_object_array_field2: {
                    type: String,
                    label: 'Object-Array Object-Array Field 2'
                  }
                }],
                label: 'Object-Array Object-Array Field'
              }
            },
            label: 'Object Array Object Field'
          }
        }],
        label: 'Object Array'
      }
    }, 'myFormRef', function() {
      console.log('Submit clicked!');
      console.log('Parsing form!', that.refs.myFormRef.parse());
    });
  }
});
