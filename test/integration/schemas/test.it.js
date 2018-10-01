const test = require('./test.js');
const extend = require('deep-extend');

module.exports = extend(test, {
	"description": 'Simple object for Italy',
	"required": true,
	"type": 'object',
	"properties": {
		"a": {
			"type": 'number',
			"required": true
		},
		"b": {
			"type": 'number'
		},
		"itField": {
			"type": 'string',
			"required": false,
			"readonly": false
		}
	}
});