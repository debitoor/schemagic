var path = require("path");
var injectr = require("injectr");

describe("/source/util/readRawSchemas", function(){
	describe("when it thinks it is in /test/integration/schemas/tmp/tmp", function(){
		var rawSchemas;
		before(function(){
			rawSchemas = injectr("source/util/readRawSchemas.js", {}, {
				"__dirname" : path.join(__dirname, "schemas/tmp/tmp")
			});
		});

		it("will check parent directory and read the schemas from /test/integration/schemas", function(){
			expect(rawSchemas).to.have.property("test").to.eql(require("./schemas/test"));
		});
	});

	describe("when it thinks it is in /test/integration/schemas/tmp/", function(){
		var rawSchemas;
		before(function(){
			rawSchemas = injectr("source/util/readRawSchemas.js", {}, {
				"__dirname" : path.join(__dirname, "schemas/tmp")
			});
		});

		it("will read the schemas from /test/integration/schemas", function(){
			expect(rawSchemas).to.have.property("test").to.eql(require("./schemas/test"));
		});
	});

});