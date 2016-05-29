import _ from 'underscore'
import React from 'react'
import { Panel, Button } from 'react-bootstrap'

const DefaultArrayInput = React.createClass({
  propTypes: {
    buildElement: React.PropTypes.func.isRequired,
    addField: React.PropTypes.func.isRequired,
    removeField: React.PropTypes.func.isRequired,
    size: React.PropTypes.number,
    errors: React.PropTypes.array,
    label: React.PropTypes.string,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      size: 0,
      errors: [],
      label: '',
      id: 0
    };
  },

  addField: function() {
    this.props.addField();
  },

  removeField: function() {
    this.props.removeField();
  },

  render: function() {
    let arrayFields = [];
    _.times(this.props.size, (i) => {
      arrayFields.push(this.props.buildElement(i));
    });

    return (
      <div key={this.props.id}>
        <Panel header={this.props.label}>
          {arrayFields}
          <Button
            bsStyle='primary'
            bsSize='xsmall'
            onClick={this.addField}>
            Add
          </Button>
          <Button
            bsStyle='primary'
            bsSize='xsmall'
            onClick={this.removeField}>
            Remove
          </Button>
        </Panel>
      </div>
    );
  }
});

export default DefaultArrayInput
