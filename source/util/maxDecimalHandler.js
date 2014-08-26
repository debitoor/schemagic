var propertyHandlerFactory = require('./propertyHandlerFactory.js');

var maxDecimalHandler = propertyHandlerFactory({
	toBeProcess: function(properties) {
		if (properties.maxDecimal &&
			(properties.type==="number" || (Array.isArray(properties.type) && properties.type.indexOf("number") !== -1))) {
			return {
				maxDecimal: properties.maxDecimal
			};
		}
		return null;
	},

	processHandler: function(document, property, data) {
		var number = document[property];
		var maxDecimal = data.maxDecimal;
		if (typeof number !== 'number') {
			return;
		}
		var split = number.toString().split('.');
		var result = (split.length>1) ? split[0] + '.' + split[1].substr(0,maxDecimal) : number;
		document[property] = parseFloat(result);
	}
});


module.exports = maxDecimalHandler.getProcessFunction;

// methods exported for unit testing
module.exports.getDefinition = maxDecimalHandler.getDefinition;
module.exports.process = maxDecimalHandler.process;