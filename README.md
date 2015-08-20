## react-form-generator

Generate, validate, and parse React forms based on arbitrary JSON schemas. 

### Usage
To instantiate a FormGeneratorForm component, just call
```js
FormGenerator.create(<formSchema>, <ref>, <onSubmit>);
```
- `formSchema` is a JSON schema for the form
- `ref` is the ref-string for the FormGeneratorForm
- `onSubmit` is the submission callback for the form, whose first parameter is an object in the same form as the initial schema, but with the form data filled in where the form field definitions were previously.

### Form Schema Options
A valid form schema is just an object of the form
```js
var schema = {
  fieldName1: <FormField>,
  fieldName2: <FormField>,
  ...
};
```
Where `FormField` values are objects with metadata describing a field's type, along with additional metadata for things like default values, validation, labels, and the like. 

#### `FormField` Options
A valid `FormField` object must have a `type` attribute (with the exception of hidden fields) and can contain additional metadata.

##### `FormField` `type` Options
- `String`
- `Number`
- `Boolean`
- `[String]`
- `[Number]`
- `[Boolean]`
- `[<FormField>]`
- `{ objectField: <FormField>, ... }`
- `[{ objectField: <FormField>, ... }]`

Note how in the last three type examples, we define `FormField`'s recursively as objects or arrays of arbitrarily-nested `FormField`'s, each of which can have all of the same metadata as top-level fields (like default values, validators, etc.). 

#### Additional `FormField` Options
- `enum`: for `Number` and `String` fields, you can add an `enum` attribute that equals an array of allowed values. Adding an `enum` attribute will render the field as a `<select>` tag. 
- `label`: the label for a particular field in the form view.
- `defaultValue`: a default value for the field. This works for primitive types, arrays, objects, and arrays of objects/arrays. Note that for recursive `FormField` definitions, the more deeply nested `defaultValue`'s will take precedence.
- `isRequired`: if true, it will automatically validate using the `FormGenerator.validators.nonEmpty` validator.
- `hidden`: if true, the field will be hidden from the form view, but its `defaultValue` will show up in the parsed form data after submission. Note that hidden fields do not need to have a `type`. 
- `validate`: a validator function whose first argument is the value of the field at the time of validation and whose return value is some error message in case where the value does not pass some predicate test. 
- `validators`: the same as `validate` but for multiple validators.

#### `FormField` Validators

Here is a list of currently built-in validator-generators, located in the `FormGenerator.validators` object. Each one returns a validator function that takes in a field's current value at the time of invokation and returns an error message (which is then rendered in the form view) if some predicate test fails.
- `lengthEquals(len)`: validates that length equals `len`
- `minLength(len)`: validates length is at least `len`
- `maxLength(len)`: validates length is at most `len`
- `regex(expr)`: validates that the field matches the regular expression `expr`
- `nonEmpty()`: validates that field is not empty
- `number()`: validates that field is a number

### Example
```js
var Example = React.createClass({
  schema: {
    stringField: {
      type: String,
      label: 'String Field',
      defaultValue: 'Welp',
      validators: [
          FormGenerator.validators.minLength(1),
          FormGenerator.validators.maxLength(10),
          function(val) {
            if (val.toLowerCase().indexOf('welp') === -1) {
              return 'Error: input must contain "welp"';
            }
          }
      ],
      isRequired: true
    },
    numberField: {
      type: Number,
      label: 'Number Field',
      validate: function(val) {
        if (val % 10 !== 0) {
          return 'Error: input must be divisible by 10';
        }
      }
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
          defaultValue: 3,
          label: 'Enum Field'
        }
      }],
      label: 'Array of Objects Field'
    },
    arrayOfArraysField: {
      type: [[String]],
      defaultValue: [['1', '2'], ['3', '4']],
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
      defaultValue: [
        [
          [{
            stringField: 'String 1',
            arrayField: [1, 2]
          },
          { stringField: 'String 2',
            arrayField: [3, 4]
          }]
        ],
        [
          [{
            stringField: 'String 3',
            arrayField: [5, 6]
          }]
        ]
      ],
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