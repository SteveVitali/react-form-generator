// Useful validator functions
var validators = {
  lengthEquals: function(len) {
    return function(val) {
      return (val || '').length !== len
        ? 'Error: must be of length ' + len
        : null;
    };
  },

  minLength: function(min) {
    return function(val) {
      return (val || '').length < min
        ? 'Error: must be at least ' + min + ' characters'
        : null;
    };
  },

  maxLength: function(max) {
    return function(val) {
      return (val || '').length > max
        ? 'Error: must be less than ' + (max + 1) + ' characters'
        : null;
    };
  },

  regex: function(regex) {
    return function(val) {
      return !(val || '').match(regex)
        ? 'Error: invalid input'
        : null;
    };
  },

  nonEmpty: function() {
    return function(val) {
      return !val
        ? 'Error: field is required'
        : null;
    };
  },

  number: function() {
    return function(val) {
      return isNaN(val)
        ? 'Error: value must be numerical'
        : null;
    };
  }
}

export default validators
