const foreignKeyValidationFactory = require('../../lib/foreignKeyValidationFactory');

describe('creating foreignKeyValidation with mock foreign keys definition', function () {

	let foreignKeyValidation;
	let foreignKeys;

	beforeEach(function () {
		foreignKeys = {
			test: function (testValues, options, callback) {
				return callback(null, testValues.map(function (val) {
					return val === 1;
				}));
			},
			testError: function (testValues, options, callback) {
				return callback(new Error('This mock foreign key check fails'));
			}
		};
		foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	});

	describe('validating foreign keys, with document that has no properties that should be checked', function () {

		let result;
		let doc, options;

		beforeEach(function (done) {
			foreignKeys.test = sinon.spy(foreignKeys.test);
			foreignKeys.testError = sinon.spy(foreignKeys.testError);
			doc = {
				a: [1, 2, 3],
				b: 4,
				c: [5, 6],
				d: { e: [7, 8], f: 'IAmATestString' }
			};
			options = {};
			foreignKeyValidation(doc, options, function (err, foreignKeyErrors) {
				if (err) {
					return done(err);
				}
				result = foreignKeyErrors;
				return done();
			});
		});

		it('should return empty array of errors', function () {
			expect(result).to.be.instanceOf(Array).to.have.property('length', 0);
		});

		it('should not call \'test\' foreignKey function', function () {
			expect(foreignKeys.test).to.not.be.called;
		});

		it('should not call \'testError\' foreignKey function', function () {
			expect(foreignKeys.testError).to.not.be.called;
		});
	});

	describe('validating foreign keys, with document that has 4 properties that should be checked, all values are valid', function () {

		let result;
		let doc, options;

		beforeEach(function (done) {
			foreignKeys.test = sinon.spy(foreignKeys.test);
			foreignKeys.testError = sinon.spy(foreignKeys.testError);
			doc = {
				a: [1, 2, {test: 1}],
				b: {test: 1},
				c: [5, 6],
				d: { e: [7, 8], "test": 1 },
				test: 1
			};
			options = {};
			foreignKeyValidation(doc, options, function (err, foreignKeyErrors) {
				if (err) {
					return done(err);
				}
				result = foreignKeyErrors;
				return done();
			});
		});

		it('should return empty array of errors', function () {
			expect(result).to.be.instanceOf(Array).to.have.property('length', 0);
		});

		it('should call \'test\' foreignKey function one time', function () {
			expect(foreignKeys.test).to.be.calledOnce;
		});

		it('should not call \'testError\' foreignKey function', function () {
			expect(foreignKeys.testError).to.not.be.called;
		});
	});

	describe('validating foreign keys, with document that has 4 properties that should be checked, 2 values are invalid', function () {

		let result;
		let doc, options;

		beforeEach(function (done) {
			foreignKeys.test = sinon.spy(foreignKeys.test);
			foreignKeys.testError = sinon.spy(foreignKeys.testError);
			doc = {
				a: [1, 2, {test: 1}],
				b: {test: 'IAmInvalid'},
				c: [5, 6],
				d: { e: [7, 8, {"test": 'IAmInvalidToo'}] },
				test: 1
			};
			options = {};
			foreignKeyValidation(doc, options, function (err, foreignKeyErrors) {
				if (err) {
					return done(err);
				}
				result = foreignKeyErrors;
				return done();
			});
		});

		it('should return array of errors', function () {
			expect(result).to.eql([
				{
					"property": 'b.test',
					"value": 'IAmInvalid',
					"message": 'This is not a valid value'
				},
				{
					"property": 'd.e.2.test',
					"value": 'IAmInvalidToo',
					"message": 'This is not a valid value'
				}
			]);
		});

		it('should call \'test\' foreignKey function one time', function () {
			expect(foreignKeys.test).to.be.calledOnce;
		});

		it('should not call \'testError\' foreignKey function', function () {
			expect(foreignKeys.testError).to.not.be.called;
		});
	});

	describe('validating foreign keys, with document that has a property where the foreign key check fails', function () {

		let error;
		let doc, options;

		beforeEach(function (done) {
			foreignKeys.test = sinon.spy(foreignKeys.test);
			foreignKeys.testError = sinon.spy(foreignKeys.testError);
			doc = {
				testError: 'IWillCauseAnErrorInTheForeignKeyCheck'
			};
			options = {};
			foreignKeyValidation(doc, options, function (err, foreignKeyErrors) {
				error = err;
				return done();
			});
		});

		it('should return an error', function () {
			expect(error).to.be.instanceOf(Error).to.have.property('message', 'This mock foreign key check fails');
		});

		it('should not call \'test\' foreignKey function', function () {
			expect(foreignKeys.test).to.not.be.called;
		});

		it('should call \'testError\' foreignKey function once', function () {
			expect(foreignKeys.testError).to.be.calledOnce;
		});
	});

	describe('validating foreign keys, with document that has three properties where the foreign key check fails', function () {

		let error;
		let doc, options;

		beforeEach(function (done) {
			foreignKeys.test = sinon.spy(foreignKeys.test);
			foreignKeys.testError = sinon.spy(foreignKeys.testError);
			doc = {
				testError: 'IWillCauseAnErrorInTheForeignKeyCheck',
				a: {
					testError: 'IWillCauseAnErrorInTheForeignKeyCheck'
				},
				b: {
					testError: 'IWillCauseAnErrorInTheForeignKeyCheck'
				}
			};
			options = {};
			foreignKeyValidation(doc, options, function (err, foreignKeyErrors) {
				error = err;
				return done();
			});
		});

		it('should return an error', function () {
			expect(error).to.be.instanceOf(Error).to.have.property('message', 'This mock foreign key check fails');
		});

		it('should not call \'test\' foreignKey function', function () {
			expect(foreignKeys.test).to.not.be.called;
		});

		it('should call \'testError\' foreignKey function once', function () {
			expect(foreignKeys.testError).to.be.calledOnce;
		});
	});
});