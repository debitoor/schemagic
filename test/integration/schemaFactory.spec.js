var schemaFactory = require('../../schemaFactory');
var rawSchemas = require('../exampleSchemas');
var exampleJson = require('../../exampleJson');

describe('/source/util/schemaFactory run on simpleSchema, the returned object', function () {
	var schema;
	before(function () {
		schema = schemaFactory(rawSchemas.simpleSchema);
	});

	it('has a validate function', function () {
		expect(schema).to.have.property('validate').to.be.a('function');
	});

	it('has exampleJson', function () {
		expect(schema).to.have.property('exampleJson').to.equal(exampleJson(rawSchemas.simpleSchema));
	});

	it('has exampleJsonArray', function () {
		expect(schema).to.have.property('exampleJsonArray').to.equal(exampleJson(rawSchemas.simpleSchema, {asArray: true}));
	});

	describe('validating valid document with removeReadOnlyFields option not set', function () {
		var document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		var result;

		before(function () {
			result = schema.validate(document);
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will have removed the document', function () {
			expect(document).to.eql({
				a: 1,
				b: 'x',
				c: 'y',
				d: 'z'
			});
		});
	});

	describe('validating valid document with removeReadOnlyFields option set to true', function () {
		var document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeReadOnlyFields: true});
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will have removed the document', function () {
			expect(document).to.eql({
				"a": 1,
				"c": 'y'
			});
		});
	});

	describe('validating valid document with removeReadOnlyFields option set to false', function () {
		var document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeReadOnlyFields: false});
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will not remove the document', function () {
			expect(document).to.eql({
				a: 1,
				b: 'x',
				c: 'y',
				d: 'z'
			});
		});
	});

	describe('validating an invalid document', function () {
		var document = {
			a: 'I SHOULD BE A NUMBER',
			b: 'x',
			c: 'y',
			d: 'z'
		};
		var result;

		before(function () {
			result = schema.validate(document);
		});

		it('will not validate the document', function () {
			expect(result).to.have.property('valid').to.equal(false);
		});

		it('will have the correct error', function () {
			expect(result.errors).to.containSubset([
					{
						"property": 'data.a',
						"message": 'is the wrong type'
					}
				]
			);
		});
	});

	describe('validating an Array in root, where schema requires an object', function () {
		var document = ['test'];
		var result;

		before(function () {
			result = schema.validate(document, {emptyStringsToNull: false, removeEmptyFields: false});
		});

		it('should not validate the document', function () {
			expect(result).to.have.deep.property('errors.0.message', 'is the wrong type');
		});
	});

	describe('validating document with date and date-time', function () {
		var document, result;

		before(function () {
			schema = schemaFactory(rawSchemas.dateTimeSchema);
		});

		describe('and pass date as datetime', function () {
			before(function () {
				document = {
					a: '2013-01-01'
				};
			});

			before(function () {
				result = schema.validate(document);
			});

			it('should be valid', function () {
				expect(result).to.have.property('valid').to.equal(true);
			});
		});

		describe('and pass new date stringify as json', function () {
			before(function () {
				document = {
					a: JSON.stringify(new Date('2013-01-01T12:00:00Z'))
				};
			});

			before(function () {
				result = schema.validate(document);
			});

			it('should be invalid', function () {
				expect(result).to.have.property('valid').to.equal(false);
			});
		});

		describe('and pass date as datetime', function () {
			before(function () {
				document = {
					b: '2013-01-01'
				};
			});

			before(function () {
				result = schema.validate(document);
			});

			it('should be invalid', function () {
				expect(result).to.have.property('valid').to.equal(false);
			});
		});
	});

	describe('test v4 features', function () {
		before(function () {
			schema = schemaFactory(rawSchemas.oneOfSchema);
		});

		describe('test valid document', function () {
			var result;

			var document = {
				a: {b: 'yes'}
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('test 1st invalid document', function () {
			var result;

			var document = {
				a: {}
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', false);
			});
		});

		describe('test 2nd invalid document', function () {
			var result;

			var document = {
				a: {b: 'yess', c: 'de'}
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', false);
			});
		});

	});

	describe('test enum fields', function () {
		var schema;
		before(function () {
			schema = schemaFactory(rawSchemas.schemaWithEnum);
		});

		describe('default positive case', function () {
			var result;

			var document = {
				a: 'foo'
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('not required field', function () {
			var result;

			var document = {};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});
	});

	describe('test currency format', function () {
		var schema;
		before(function () {
			schema = schemaFactory(rawSchemas.currencySchema);
		});

		describe('default positive case', function () {
			var result;

			var document = {
				a: 100.01
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('invalid format', function () {
			var result;

			var document = {
				a: 100.001
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with errors', function () {
				expect(result).to.have.property('valid', false);
			});
		});

		describe('not required field', function () {
			var result;

			var document = {};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('allow null', function () {
			var result;

			var document = {
				a: null
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});
	});

	describe('validate with filter', function () {
		var schema;

		before(function () {
			schema = schemaFactory(rawSchemas.simpleSchemaWithNoAdditionalProperties);
		});

		describe('simple schema validation without filter: true', function () {
			var result;
			var document = {a: 1, c: 'd', notInSchemaField: 'foo'};

			before(function () {
				result = schema.validate(document);
			});

			it('should not validate', function () {
				expect(result).to.have.property('valid', false);
			});

			it('should provide errors', function () {
				expect(result.errors).to.not.deep.equal([]);
			});

		});

		describe('simple schema validation with filter: true', function () {
			var result;
			var document = {a: 1, c: 'd', thisIsNotInSchemaField: 'foo'};

			before(function () {
				result = schema.validate(document, {filter: true});
			});

			it('should not validate', function () {
				expect(result).to.have.property('valid', false);
			});

			it('should remove properties that are not in schema', function () {
				expect(document).to.not.have.property('thisIsNotInSchemaField');
			});
		});
	});
});