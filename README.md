react-form-generator
---
Generate, validate, and parse React forms based on arbitrary JSON schemas. 

Usage
---
```js
var ExampleForm = React.createClass({
  schema: {
    stringField: {
      type: String,
      label: 'String Field',
      defaultValue: 'Welp',
      validators: [
          FormGenerator.validators.minLength(1),
          FormGenerator.validators.maxLength(10)
      ],
      isRequired: true
    },
    numberField: {
      type: Number,
      label: 'Number Field'
    },
    enumField: {
      type: String,
      enum: ['', 'option 1', 'option 2'],
      label: 'Enum Field',
      defaultValue: 'option 2'
    },
    booleanField: {
      type: Boolean,
      label: 'Boolean Field',
      defaultValue: true
    },
    arrayField: {
      type: [String],
      label: 'Simple Array Field'
    },
    hiddenField: {
      hidden: true,
      defaultValue: 'Hidden Field Data'
    },
    objectField: {
      type: {
        embeddedString: {
          type: String,
          label: 'Object String'
        },
        embeddedArray: {
          type: [String],
          label: 'Embedded Array',
          defaultValue: ['array value 1', 'array value 2']
        },
        embeddedHiddenObjectArray: {
          hidden: true,
          defaultValue: [{
            hiddenFieldData: 'Hidden field data',
            moreHiddenData: 'More hidden data'
          }]
        }
      },
      label: 'Object Field'
    },
    arrayOfObjectsField: {
      type: [{
        embeddedString: {
          type: String,
          label: 'Array Object String'
        },
        embeddedEnum: {
          type: Number,
          enum: [1, 2, 3, 4],
          defaultValue: 3
        }
      }],
      label: 'Array of Objects Field'
    },
    arrayOfArraysField: {
      type: [[String]],
      label: 'Array of Array of Strings'
    },
    arrayOfArrayOfArrayOfObjectsField: {
      type: [[[{
        stringField: {
          type: String,
          label: 'String Field'
        },
        arrayField: {
          type: [Number],
          label: 'Array of Numbers'
        }
      }]]],
      label: 'Array of Array of Array of Objects'
    }
  },

  onSubmit: function(data) {
    console.log('Parsed form data', data);
    // Reset fields back to default values
    this.refs.myFormRef.reset();
  },

  render: function() {
    var schema = this.schema;
    var ref = 'myFormRef';
    var onSubmit = this.onSubmit;
    var formElement = FormGenerator.create(schema, ref, onSubmit);

    return <span>{formElement}</span>;
  }
});
```