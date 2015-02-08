module.exports = {
	testForeignKey: function (testValues, options, callback) {
		return callback(null, testValues.map(function (val) {
			return val === 1;
		}));
	},
	testForeignKeyError: function (testValues, options, callback) {
		return callback(new Error('This mock foreign key check fails'));
	}
};