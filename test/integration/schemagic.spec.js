describe('/source/schemagic with valid example schemas', function () {
	var schemagic;

	describe('requiring schemagic here', function () {
		before(function() {
			schemagic = require('../../');
		});

		it('returns a schemagic object', function () {
			expect(schemagic).to.be.a('object');
		});

		it('has the \'test\' schema', function () {
			expect(schemagic).to.have.property('test');
		});
		it('has the \'test2\' schema', function () {
			expect(schemagic).to.have.property('test2');
		});
		it('has the \'test.patch\' schema', function () {
			expect(schemagic).to.have.property('test').to.have.property('patch');
		});
		it('has the \'test.array.validate\' schema', function () {
			expect(schemagic).to.have.deep.property('test.array.validate');
		});
		it('has the \'test2.patch\' schema', function () {
			expect(schemagic).to.have.property('test2').to.have.property('patch');
		});
		it('has the \'test2.array.validate\' schema', function () {
			expect(schemagic).to.have.deep.property('test2.array.validate');
		});
		it('has required=true in \'test\' schema', function () {
			expect(schemagic.test.schema).to.have.property('properties').to.have.property('a').to.have.property('required', true);
		});
		it('has set required=false in  \'test.patch\' schema', function () {
			expect(schemagic.test.patch.schema).to.have.property('properties').to.have.property('a').to.have.property('required', false);
		});
		it('has added \'null\' in type to non-required property in \'test.patch\' schema', function () {
			expect(schemagic.test.patch.schema).to.have.property('properties').to.have.property('c').to.have.property('type').to.contain('null');
		});
		it('has all the exact number of keys at there are schemas (schemagic.getSchemaFromObject is not enumerable)', function () {
			expect(Object.keys(schemagic)).to.have.property('length').to.equal(3);
		});

		it('has getSchemaFromObject as property', function () {
			expect(schemagic).to.have.property('getSchemaFromObject').to.be.a('function');
		});

		it('has parseExampleJson as property', function () {
			expect(schemagic).to.have.property('parseExampleJson').to.be.a('function');
		});

		describe('validating against test2 schema that has foreign key value, foreignKey:false - no callback', function() {
			var result;
			var doc;
			before(function() {
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				result = schemagic.test2.validate(doc);
			});

			it('should return valid result', function() {
				expect(result).to.eql({
					"valid": true,
					"errors": []
				});
			});

		});

		describe('array.validate: validating against test2 array schema that has foreign key value, foreignKey:false - no callback', function() {
			var result;
			var doc;
			before(function() {
				doc =  [{
					testForeignKey: 3 //this is invalid in foreign key check
				}];
				result = schemagic.test2.array.validate(doc);
			});

			it('should return valid result', function() {
				expect(result).to.eql({
					"valid": true,
					"errors": []
				});
			});

		});
		describe('array.validate: validating against test2 array schema that has foreign key value, foreignKey:false - no callback, two items', function() {
			var result;
			var doc;
			before(function() {
				doc =  [{
					testForeignKey: 3 //this is invalid in foreign key check
				}, {
					testForeignKey: 3 //this is invalid in foreign key check
				}];
				result = schemagic.test2.array.validate(doc);
			});

			it('should return valid result', function() {
				expect(result).to.eql({
					"valid": true,
					"errors": []
				});
			});

		});

		describe('validating against test2 schema that has foreign key value, foreignKey:true - no callback', function() {
			var doc, options, validate;
			before(function() {
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				options = {foreignKey:true};
				validate = function() {
					schemagic.test2.validate(doc, options);
				};
			});

			it('should throw an error because of no callback', function() {
				expect(validate).to['throw'];
			});
		});

		describe('array.validate: validating against test2 array schema that has foreign key value, foreignKey:true - no callback', function() {
			var doc, options, validate;
			before(function() {
				doc =  [{
					testForeignKey: 3 //this is invalid in foreign key check
				}];
				options = {foreignKey:true};
				validate = function() {
					schemagic.test2.array.validate(doc, options);
				};
			});

			it('should throw an error because of no callback', function() {
				expect(validate).to['throw'];
			});
		});

		describe('validating against test2 schema that has invalid foreign key value, foreignKey:true - callback', function() {
			var result;
			var doc;
			var options;
			before(function(done) {
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				options = {foreignKey:true};
				return schemagic.test2.validate(doc, options, saveResult);

				function saveResult(err, res) {
					if(err) {
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it('should return result with error', function() {
				expect(result).to.eql({
					"valid": false,
					"errors": [{
						property: 'testForeignKey',
						value: 3,
						message: 'This is not a valid value'
					}]
				});
			});
		});

		describe('array.validate: validating against test2 schema that has invalid foreign key value, foreignKey:true - callback', function() {
			var result;
			var doc;
			var options;
			before(function(done) {
				doc =  [{
					testForeignKey: 3 //this is invalid in foreign key check
				}];
				options = {foreignKey:true};
				return schemagic.test2.array.validate(doc, options, saveResult);

				function saveResult(err, res) {
					if(err) {
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it('should return result with error', function() {
				expect(result).to.eql({
					"valid": false,
					"errors": [{
						property: '0.testForeignKey',
						value: 3,
						index: 0,
						message: 'This is not a valid value'
					}]
				});
			});
		});

		describe('validating against test1 schema that has valid foreign key value, ' +
			'foreignKey defined with dot notation and belongs to the schema, foreignKey:true - callback', function() {
			var result;
			before(function(done) {
				var doc =  {
					a: 1,
					testForeignKey2: 12 //this is valid in 'test.testForeignKey2' foreign key check
				};
				var options = {foreignKey:true};
				return schemagic.test.validate(doc, options, saveResult);

				function saveResult(err, res) {
					if(err) {
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it('should return result without error', function() {
				expect(result).to.eql({
					valid: true,
					errors: []
				});
			});
		});

		describe('validating against test2 schema that has invalid foreign key value, ' +
			'foreignKey defined with dot notation and belongs to the schema, foreignKey:true - callback', function() {
			var result;
			before(function(done) {
				var doc =  {
					testForeignKey2: 12 //this is invalid in 'test2.testForeignKey2' foreign key check
				};
				var options = {foreignKey:true};
				return schemagic.test2.validate(doc, options, saveResult);

				function saveResult(err, res) {
					if(err) {
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it('should return result with error', function() {
				expect(result).to.eql({
					"valid": false,
					"errors": [{
						property: 'testForeignKey2',
						value: 12,
						message: 'This is not a valid value'
					}]
				});
			});
		});

		describe('validating against test3.with.dot schema that has invalid foreign key value, ' +
			'foreignKey defined with dot notation and belongs to the schema, ' +
			'schema has dot in its name, foreignKey:true - callback', function() {
			var result;
			before(function(done) {
				var doc =  {
					testForeignKey2: 12 //this is invalid in 'test3.with.dot.testForeignKey2' foreign key check
				};
				var options = {foreignKey:true};
				return schemagic['test3.with.dot'].validate(doc, options, saveResult);

				function saveResult(err, res) {
					if(err) {
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it('should return result with error', function() {
				expect(result).to.eql({
					"valid": false,
					"errors": [{
						property: 'testForeignKey2',
						value: 12,
						message: 'This is not a valid value'
					}]
				});
			});
		});

		describe('validating against test2 schema with foreign key check that fails, foreignKey:true - callback', function() {
			var error;
			var doc;
			var options;
			before(function(done) {
				doc =  {
					testForeignKeyError: 3 //this foreign key checker fails
				};
				options = {foreignKey:true};
				return schemagic.test2.validate(doc, options, saveResult);

				function saveResult(err) {
					error = err;
					return done();
				}
			});

			it('should error', function() {
				expect(error).to.be.instanceOf(Error).to.have.property('message', 'This mock foreign key check fails');
			});
		});
	});

	describe('having required schemagic in test1 dir', function () {
		var schemagic1;
		before(function() {
			schemagic1 = require('./dirCacheTest/test1/requireSchemagic');
		});

		it('will have the test1 schema', function () {
			expect(schemagic1).to.have.property('test1');
		});

		it('will have only oen schema', function () {
			expect(Object.keys(schemagic1)).to.have.property('length').to.equal(1);
		});

		describe('requiring it again ()', function() {
			var shcmemagic2;
			before(function() {
				//requireSchemagic is not cached in require cache
				shcmemagic2 = require('./dirCacheTest/test1/requireSchemagic');
			});

			it('will be the same instance', function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
	describe('having required schemagic in test2 dir', function () {
		var schemagic1;
		before(function() {
			schemagic1 = require('./dirCacheTest/test2/requireSchemagic');
		});

		it('will have the test2 schema', function () {
			expect(schemagic1).to.have.property('test2');
		});

		it('will have only one schema', function () {
			expect(Object.keys(schemagic1)).to.have.property('length').to.equal(1);
		});

		describe('requiring it from subdir', function() {
			var shcmemagic2;
			before(function() {
				shcmemagic2 = require('./dirCacheTest/test2/test2subdir/requireSchemagic');
			});

			it('will be the same instance', function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
});
