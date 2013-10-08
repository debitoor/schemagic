var schemaFactory = require("../../source/util/schemaFactory");
var rawSchemas = require("../exampleSchemas");
var exampleJson = require("../../source/util/exampleJson");

describe("/source/util/schemaFactory run on simpleSchema, the returned object", function () {
	var schema;
	before(function () {
		schema = schemaFactory(rawSchemas.simpleSchema);
	});

	it("has a validate function", function () {
		expect(schema).to.have.property("validate").to.be.a("function");
	});

	it("has exampleJson", function () {
		expect(schema).to.have.property("exampleJson").to.equal(exampleJson(rawSchemas.simpleSchema));
	});

	it("has exampleJsonArray", function () {
		expect(schema).to.have.property("exampleJsonArray").to.equal(exampleJson(rawSchemas.simpleSchema, {asArray:true}));
	});

	describe("validating valid document with removeReadOnlyFields option not set", function () {
		var document = {
			a:1,
			b:"x",
			c:"y",
			d:"z"
		};
		var result;

		before(function () {
			result = schema.validate(document);
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will have removed the document", function () {
			expect(document).to.eql({
				"a":1,
				"c":"y"
			});
		});
	});

	describe("validating valid document with removeReadOnlyFields option set to true", function () {
		var document = {
			a:1,
			b:"x",
			c:"y",
			d:"z"
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeReadOnlyFields:true});
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will have removed the document", function () {
			expect(document).to.eql({
				"a":1,
				"c":"y"
			});
		});
	});

	describe("validating valid document with removeReadOnlyFields option set to false", function () {
		var document = {
			a:1,
			b:"x",
			c:"y",
			d:"z"
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeReadOnlyFields:false});
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will not remove the document", function () {
			expect(document).to.eql({
				a:1,
				b:"x",
				c:"y",
				d:"z"
			});
		});
	});

	describe("validating an invalid document", function () {
		var document = {
			a:"I SHOULD BE A NUMBER",
			b:"x",
			c:"y",
			d:"z"
		};
		var result;

		before(function () {
			result = schema.validate(document);
		});

		it("will not validate the document", function () {
			expect(result).to.have.property("valid").to.equal(false);
		});

		it("will have the correct error", function () {
			expect(result.errors).to.eql([
				{
					"property":"a",
					"message":"string value found, but a number is required"
				}
			]
			);
		});
	});

	describe("validating valid document with removeEmptyFields option not set", function () {
		var document = {
			a:1,
			c:"y",
			e:""
		};
		var result;

		before(function () {
			result = schema.validate(document);
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will have removed the document", function () {
			expect(document).to.eql({
				"a":1,
				"c":"y"
			});
		});
	});

	describe("validating valid document with removeEmptyFields option set to true", function () {
		var document = {
			a:1,
			c:"y",
			e:""
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeEmptyFields: true});
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will have removed the document", function () {
			expect(document).to.eql({
				"a":1,
				"c":"y"
			});
		});
	});

	describe("validating valid document with removeEmptyFields option set to false", function () {
		var document = {
			a:1,
			c:"y",
			e:""
		};
		var result;

		before(function () {
			result = schema.validate(document, {removeEmptyFields:false});
		});

		it("will validate the document", function () {
			expect(result).to.have.property("valid").to.equal(true);
		});

		it("will not remove the document", function () {
			expect(document).to.eql({
				a:1,
				c:"y",
				e:""
			});
		});
	});

	describe('validating valid document with emptyStringsToNull option set to true, removeEmptyFields to false', function () {
		var document = {
			a: 1,
			c: 'y',
			e: ''
		};
		var result;

		before(function () {
			result = schema.validate(document, {emptyStringsToNull: true, removeEmptyFields: false});
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will have document with null instead', function () {
			expect(document).to.eql({
				a: 1,
				c: 'y',
				e: null
			});
		});
	});

	describe('validating valid document with emptyStringsToNull option set to false, removeEmptyFields to false', function () {
		var document = {
			a: 1,
			c: 'y',
			e: ''
		};
		var result;

		before(function () {
			result = schema.validate(document, {emptyStringsToNull: false, removeEmptyFields: false});
		});

		it('will validate the document', function () {
			expect(result).to.have.property('valid').to.equal(true);
		});

		it('will have document with empty string', function () {
			expect(document).to.eql({
				a: 1,
				c: 'y',
				e: ''
			});
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
					a: '2013-01-01T12:00:00Z'
				};
			});

			before(function () {
				result = schema.validate(document);
			});

			it('should be valid', function () {
				expect(result).to.have.property("valid").to.equal(true);
			});

			it('should have to be modifed to date (without time)', function () {
				expect(document.a).to.equal('2013-01-01');
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

			it('should be valid', function () {
				expect(result).to.have.property("valid").to.equal(true);
			});

			it('should have to be modifed to date (without time)', function () {
				expect(document.a).to.equal('2013-01-01');
			});
		});

		describe('and pass datetime as date', function () {
			before(function () {
				document = {
					b: '2013-01-01'
				};
			});

			before(function () {
				result = schema.validate(document);
			});

			it('should be invalid', function () {
				expect(result).to.have.property("valid").to.equal(false);
			});
		});
	});
});