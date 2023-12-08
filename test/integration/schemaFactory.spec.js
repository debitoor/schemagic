const schemaFactory = require('../../schemaFactory');
const rawSchemas = require('../exampleSchemas');
const exampleJson = require('../../generateExampleJson');

describe('/source/util/schemaFactory run on simpleSchema, the returned object', function () {
	let schema;
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
		expect(schema).to.have.property('exampleJsonArray').to.equal(exampleJson(rawSchemas.simpleSchema, { asArray: true }));
	});
	it('has example', function () {
		expect(schema).to.have.property('example').to.be.ok;
	});

	it('has exampleArray', function () {
		expect(schema).to.have.property('exampleArray').to.be.ok;
	});

	it('generates correct json for schema', function () {
		const correctJsonOutput = {
			'description': 'Simple object',
			'required': true,
			'type': 'object',
			'properties': {
				'a': {
					'type': 'number',
					'required': true
				},
				'b': {
					'type': 'string',
					'required': false,
					'readonly': true
				},
				'c': {
					'type': 'string',
					'required': true,
					'readonly': false
				},
				'd': {
					'type': 'string',
					'required': false,
					'readonly': true
				}
			},
			'additionalProperties': false
		};

		expect(schema).to.have.property('schema');
		expect(JSON.stringify(schema.schema)).to.be.eql(JSON.stringify(correctJsonOutput));
	});


	describe('loading schema with property that requires string', function () {
		let schema2;
		before(function () {
			schema2 = schemaFactory(rawSchemas.schemaWithStringEscapePropertyName);
		});

		it('has example', function () {
			expect(schema2).to.have.property('example').to.be.ok;
		});

	});

	describe('validating valid document with removeReadOnlyFields option not set', function () {
		const document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		let result;

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
		const document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		let result;

		before(function () {
			result = schema.validate(document, { removeReadOnlyFields: true });
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will have removed the document', function () {
			expect(document).to.eql({
				'a': 1,
				'c': 'y'
			});
		});
	});

	describe('validating valid document with removeReadOnlyFields option set to false', function () {
		const document = {
			a: 1,
			b: 'x',
			c: 'y',
			d: 'z'
		};
		let result;

		before(function () {
			result = schema.validate(document, { removeReadOnlyFields: false });
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
		const document = {
			a: 'I SHOULD BE A NUMBER',
			b: 'x',
			c: 'y',
			d: 'z'
		};
		let result;

		before(function () {
			result = schema.validate(document);
		});

		it('will not validate the document', function () {
			expect(result).to.have.property('valid').to.equal(false);
		});

		it('will have the correct error', function () {
			expect(result.errors).to.containSubset([
				{
					'property': 'a',
					'message': 'is the wrong type'
				}
			]
			);
		});
	});

	describe('validating an Array in root, where schema requires an object', function () {
		const document = ['test'];
		let result;

		before(function () {
			result = schema.validate(document, { emptyStringsToNull: false, removeEmptyFields: false });
		});

		it('should not validate the document', function () {
			expect(result).to.have.deep.property('errors.0.message', 'is the wrong type');
		});
	});

	describe('validating document with date and date-time', function () {
		let document, result;

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

		describe('and pass date without ms as datetime', () => {
			before('validate the document', () => {
				document = {
					b: '2013-01-01T12:00:00Z'
				};
				result = schema.validate(document);
			});

			it('should be valid', () => expect(result).to.have.property('valid', true));
		});

		describe('and pass date with ms as datetime', () => {
			before('validate the document', () => {
				document = {
					b: '2013-01-01T12:00:00.123Z'
				};
				result = schema.validate(document);
			});

			it('should be invalid', () => expect(result).to.have.property('valid', false));
		});

		describe('and pass date with ms for checking date-time-iso format', () => {
			before('validate the document', () => {
				document = {
					c: '2013-01-01T12:00:00.123Z'
				};
				result = schema.validate(document);
			});

			it('should be valid', () => expect(result).to.have.property('valid', true));
		});

		describe('and pass date without ms for checking date-time-iso format', () => {
			before('validate the document', () => {
				document = {
					c: '2013-01-01T12:00:00Z'
				};
				result = schema.validate(document);
			});

			it('should be invalid', () => expect(result).to.have.property('valid', false));
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
			let result;

			const document = {
				a: { b: 'yes' }
			};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('test 1st invalid document', function () {
			let result;

			const document = {
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
			let result;

			const document = {
				a: { b: 'yess', c: 'de' }
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
		let schema;
		before(function () {
			schema = schemaFactory(rawSchemas.schemaWithEnum);
		});

		describe('default positive case', function () {
			let result;

			const document = {
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
			let result;

			const document = {};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with no errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});
	});

	describe('test currency format', function () {
		let schema;
		before(function () {
			schema = schemaFactory(rawSchemas.currencySchema);
		});

		describe('default positive case', function () {
			let result;

			const document = {
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
			let result;

			const document = {
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
			let result;

			const document = {};

			before(function () {
				result = schema.validate(document);
			});

			it('should validate with errors', function () {
				expect(result).to.have.property('valid', true);
			});
		});

		describe('allow null', function () {
			let result;

			const document = {
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
		let schema;

		before(function () {
			schema = schemaFactory(rawSchemas.simpleSchemaWithNoAdditionalProperties);
		});

		describe('simple schema validation without filter: true', function () {
			let result;
			const document = { a: 1, b: 'd', notInSchemaField: 'foo' };

			before(function () {
				result = schema.validate(document);
			});

			it('should not validate', function () {
				expect(result).to.have.property('valid', false);
			});

			it('should provide errors', function () {
				expect(result.errors).to.deep.equal([
					{
						message: 'has additional properties',
						schemaPath: [],
						property: 'notInSchemaField',
						type: 'object'
					}
				]);
			});
			it('should not remove properties that are not in schema', function () {
				expect(document).to.eql({ a: 1, b: 'd', notInSchemaField: 'foo' });
			});

		});

		describe('simple schema validation with filter: true', function () {
			let result;
			const document = { a: 1, b: 'd', thisIsNotInSchemaField: 'foo' };

			before(function () {
				result = schema.validate(document, { filter: true });
			});

			it('should not validate', function () {
				expect(result).to.have.property('valid', false);
			});

			it('should remove properties that are not in schema', function () {
				expect(document).to.eql({ a: 1, b: 'd' });
			});
		});

		describe('nested objects schema validation with filter: true', function () {
			let result;
			const document = {
				a: 1,
				b: 'd',
				thisIsNotInSchemaField: 'foo',
				c: { a: 1, b: 'd', thisIsNotInSchemaField: 'foo' }
			};

			before(function () {
				result = schema.validate(document, { filter: true });
			});

			it('should not validate', function () {
				expect(result).to.have.property('valid', false);
			});

			it('should remove properties that are not in schema', function () {
				expect(document).to.eql({
					'a': 1,
					'b': 'd',
					'c': {
						'a': 1,
						'b': 'd'
					}
				});
			});
		});
	});
});
