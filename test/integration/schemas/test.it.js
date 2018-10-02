const test = require('./test.js');
const extend = require('deep-extend');

module.exports = extend(test, {
	"description": 'Simple object for Italy',
	"required": true,
	"type": 'object',
	"properties": {
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