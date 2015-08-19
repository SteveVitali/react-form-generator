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
      string_field: {
        type: String,
        label: 'Flat Field',
        defaultValue: 'Flat Field Default Value',
        validators: [
          FormGenerator.validators.regex(/\d+/),
          FormGenerator.validators.maxLength(10),
          FormGenerator.validators.minLength(1),
          FormGenerator.validators.lengthEquals(5)
        ],
        isRequired: true
      },
      number_field: {
        type: Number,
        label: 'Number Field'
      },
      enum_field: {
        type: String,
        enum: ['', 'value 1', 'value 2', 'value 3', 'enum default'],
        label: 'Enum field',
        defaultValue: 'enum default',
        isRequired: true
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
        label: 'Array of Strings',
        isRequired: true,
        defaultValue: ['ayy', 'lmao', 'welp', 'womp']
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
            defaultValue: [
              { ayy: 'lmao' },
              { lmao: 'ayy' }
            ]
          }
        }],
        defaultValue: [
          { obj_arr_field1: 'lol',
            obj_arr_field2: 'ayy' },
          { obj_arr_field1: 'womp',
            obj_arr_field2: 'welp' }
        ],
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
        label: 'Object Array',
        defaultValue: [{
          flat_field: 'flat field',
          object_field: {
            object_array_object_field1: 'object field',
            object_array_array_field: [{
              object_array_object_array_field1: 'ayyy',
              object_array_object_array_field2: 'lmao'
            }]
          }
        }]
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
      },
      simple_array_of_arrays: {
        type: [[String]],
        label: 'Array of Array of Strings'
      },
      simple_array_of_object_arrays: {
        type: [[{
          welp: {
            type: String,
            label: 'lol'
          }
        }]],
        label: 'Hm'
      },
      complex_array_of_arrays: {
        type: [[[{
          array_array_field: {
            type: String,
            label: 'Array Array Field'
          },
          array_array_array_array: {
            type: [[String]],
            label: 'Array Array Array Array'
          }
        }]]],
        label: 'Complex Array of Arrays'
      }
    },
    'myFormRef',
    function() {
      var myForm = that.refs.myFormRef;
      console.log('Submit clicked!');
      console.log('Parsing form!', myForm.getValue());
      myForm.reset();
    });
  }
});
