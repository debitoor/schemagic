var path = require("path");
var readRawSchemas = require("../../source/util/readRawSchemas");

describe("/source/util/redRawSchemas", function(){
	describe("will read schema", function(){
		var schemas;
		before(function(){
			schemas = readRawSchemas(path.join(__dirname, "schemas"));
		});

		it("reads the test schema", function(){
			expect(schemas).to.eql({
				test: require("./schemas/test")
			});
		});
	});
});