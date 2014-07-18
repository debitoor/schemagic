var propertyHandlerFactory = require('./propertyHandlerFactory.js');

var maxDecimalHandler = propertyHandlerFactory({
	toBeProcess: function(properties) {
		return properties.readonly;
	},

	processHandler: function(document, property, data) {
		delete document[property];
	}
});


module.exports = maxDecimalHandler.getProcessFunction;

// methods exported for unit testing
module.exports.getDefinition = maxDecimalHandler.getDefinition;
module.exports.process = maxDecimalHandler.process;