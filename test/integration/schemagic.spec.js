var injectr = require("injectr");
var schemas = JSON.parse(JSON.stringify(require("../exampleSchemas")));


describe("/source/schemagic with valid example schemas injected", function () {
	var schemagic;

	before(function(){
		delete schemas.emptySchema; //remove invalid schema
	});

	before(function () {
		schemagic = injectr("./source/schemagic.js", {
			"./util/readRawSchemas":schemas,
			"./util/schemaFactory": require("../../source/util/schemaFactory"),
			"./util/getSchemaFromObject": require("../../source/util/getSchemaFromObject")
		});
	});

	it("returns a schemagic object", function(){
		expect(schemagic).to.be.a("object");
	});

	it("has all the schemas as properties", function(){
		Object.keys(schemas).forEach(function(schemaName){
			expect(schemagic).to.have.property(schemaName);
		});
	});

	it("has all the exact number og keys at there are schemas (schemagic.getSchemaFromObject is not enumerable)", function(){
		expect(Object.keys(schemagic)).to.have.property("length").to.equal(Object.keys(schemas).length);
	});

	it("has getSchemaFromObject as property", function(){
		expect(schemagic).to.have.property("getSchemaFromObject").to.be.a("function");
	});
});
