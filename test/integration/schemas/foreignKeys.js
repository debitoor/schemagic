module.exports = {
	testForeignKey: function (testValues, options, callback) {
		return callback(null, testValues.map(function (val) {
			return val === 1;
		}));
	},
	testForeignKeyError: function (testValues, options, callback) {
		return callback(new Error('This mock foreign key check fails'));
	},
	'test1.testForeignKey2': function (testValues, options, callback) {
		return callback(null, testValues.map(function (val) {
			return val === 12;
		}));
	},
	'test2.testForeignKey2': function (testValues, options, callback) {
		return callback(null, testValues.map(function (val) {
			return val === 22;
		}));
	},
	'test3.with.dot.testForeignKey2': function (testValues, options, callback) {
		return callback(null, testValues.map(function (val) {
			return val === 32;
		}));
	}
};