var traverse = require('traverse');
var async = require('async');

module.exports = function foreignKeyValidationFactory(foreignKeys) {
	return foreignKeyValidation;

	function foreignKeyValidation(document, options, callback) {
		var valuesToCheck = getValuesToCheck(foreignKeys, document);
		if (Object.keys(valuesToCheck).length === 0) {
			return callback(null, []);
		}
		var tasks = Object.keys(valuesToCheck).map(function (propertyName) {
			var foreignKeyCheckFunction = foreignKeys[propertyName];
			return getForeignKeyCheckTask(foreignKeyCheckFunction, valuesToCheck[propertyName], options);
		});
		async.parallel(tasks, function (err, results) {
			if (err) {
				return callback(err);
			}
			var errors = Array.prototype.concat.apply([], results);
			return callback(null, errors);
		});
	}
};

function getValuesToCheck(foreignKeys, document) {
	var memo = {};
	Object.keys(foreignKeys).forEach(function (propertyName) {
		memo[propertyName] = [];
	});
	memo = traverse(document).reduce(function (memo, value) {
		if (memo[this.key]) {
			memo[this.key].push({
				path: this.path,
				value: value
			});
		}
		return memo;
	}, memo);
	Object.keys(memo).forEach(function (propertyName) {
		if (memo[propertyName].length === 0) {
			delete memo[propertyName];
		}
	});
	return memo;
}

function getForeignKeyCheckTask(foreignKeyCheckFunction, valuesToCheck, options) {
	return function foreignKeyCheck(callback) {
		var values = valuesToCheck.map(function (o) {
			return o.value;
		});
		return foreignKeyCheckFunction(values, options, returnErrors);

		function returnErrors(err, validArray) {
			if (err) {
				return callback(err);
			}
			if (validArray.length !== valuesToCheck.length) {
				var error = new Error('Foreign key check function did not return array of same length as values array passed to it');
				error.forignKeyFunction = foreignKeyCheckFunction.toString();
				error.valuesPassed = values;
				error.valuesReturned = validArray;
				return callback(error);
			}
			var errors = [];
			for (var i = 0; i < validArray.length; i++) {
				if (!validArray[i]) {
					errors.push({
						property: valuesToCheck[i].path.join('.'),
						value: valuesToCheck[i].value,
						message: 'This is not a valid value'
					});
				}
			}
			return callback(null, errors);
		}
	};
}