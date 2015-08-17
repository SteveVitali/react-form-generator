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
        label: 'Flat Field',
        defaultValue: 'Flat Field Default Value',
        validate: function(val) {
          return val.length > 10 && 'Error: max length is 10 chars';
        },
        isRequired: true
      },
      enum_field: {
        type: String,
        enum: ['', 'value 1', 'value 2', 'value 3', 'enum default'],
        label: 'Enum field',
        defaultValue: 'enum default'
      },
      boolean_field: {
        type: Boolean,
        label: 'Boolean field',
        defaultValue: true
      },
      simple_object_field: {
        type: {
          embedded_field1: {
            type: String,
            label: 'Embedded Field 1',
            validators: [
              function(val) {
                return val.length > 4 && 'Error: max length is 4 chars';
              },
              function(val) {
                return val.indexOf('lmao') === -1 && 'Error: needs lmao';
              }
            ]
          },
          embedded_field2: {
            type: String,
            enum: ['', 'embedded value 1', 'embedded value 2'],
            label: 'Embedded Field 2'
          }
        },
        label: 'Simple Object Field'
      },
      simple_array_field: {
        type: [String],
        label: 'Array of Strings'
      },
      simple_object_array: {
        type: [{
          obj_arr_field1: {
            type: String,
            label: 'Object array field 1'
          },
          obj_arr_field2: {
            type: String,
            label: 'Object array field 2'
          },
          hidden_embedded_object_array: {
            hidden: true,
            defaultValue: [{
              ayy: 'lmao',
              ayy: 'lmao'
            }, {
              lmao: 'ayy',
              lmao: 'ayy'
            }]
          }
        }],
        label: 'Simple Object Array'
      },
      object_of_objects: {
        type: {
          flat_field1: {
            type: String,
            label: 'Embedded string field'
          },
          embedded_object1: {
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
              },
              embedded_object_object: {
                type: {
                  embedded_object_object_field: {
                    type: String,
                    label: 'Embedded object object field'
                  }
                },
                label: 'Embedded object object'
              }
            },
            label: 'Embedded Object Field'
          }
        },
        label: 'Object of Objects'
      },
      complex_object_array_field: {
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
      },
      hidden_object_array: {
        hidden: true,
        defaultValue: [{
          ayy: 'lmao',
          ayy: 'lmao'
        }, {
          lmao: 'ayy',
          lmao: 'ayy'
        }]
      }
    },
    'myFormRef',
    function() {
      var myForm = that.refs.myFormRef;
      console.log('Submit clicked!');
      console.log('Parsing form!', myForm.parse());
      // myForm.reset();
    });
  }
});
