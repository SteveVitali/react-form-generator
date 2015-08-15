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
      }
    }}/>;
  }
});
