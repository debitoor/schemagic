describe("/source/schemagic with valid example schemas", function () {
	var schemagic;

	describe("requiring schemagic here", function () {
		before(function () {
			schemagic = require("../../source/schemagic");
		});

		it("returns a schemagic object", function () {
			expect(schemagic).to.be.a("object");
		});

		it("has the 'test' schema", function () {
			expect(schemagic).to.have.property("test");
		});
		it("has the 'test2' schema", function () {
			expect(schemagic).to.have.property("test2");
		});
		it("has the 'test.patch' schema", function () {
			expect(schemagic).to.have.property("test").to.have.property("patch");
		});
		it("has the 'test2.patch' schema", function () {
			expect(schemagic).to.have.property("test2").to.have.property("patch");
		});
		it("has required=true in 'test' schema", function () {
			expect(schemagic.test.schema).to.have.property("properties").to.have.property("a").to.have.property("required", true);
		});
		it("has set required=false in  'test.patch' schema", function () {
			expect(schemagic.test.patch.schema).to.have.property("properties").to.have.property("a").to.have.property("required", false);
		});
		it("has added 'null' in type to non-required property in 'test.patch' schema", function () {
			expect(schemagic.test.patch.schema).to.have.property("properties").to.have.property("c").to.have.property("type").to.contain('null');
		});
		it("has all the exact number og keys at there are schemas (schemagic.getSchemaFromObject is not enumerable)", function () {
			expect(Object.keys(schemagic)).to.have.property("length").to.equal(2);
		});

		it("has getSchemaFromObject as property", function () {
			expect(schemagic).to.have.property("getSchemaFromObject").to.be.a("function");
		});

		describe("validating against test2 schema that has foreign key value, foreignKey:false - no callback", function(){
			var result;
			var doc;
			before(function(){
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				result = schemagic.test2.validate(doc);
			});

			it("should return valid result", function(){
				expect(result).to.eql({
					"valid": true,
					"errors": []
				});
			});

		});

		describe("validating against test2 schema that has foreign key value, foreignKey:true - no callback", function(){
			var doc, options, validate;
			before(function(){
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				options = {foreignKey:true};
				validate = function(){
					schemagic.test2.validate(doc, options);
				};
			});

			it("should throw an error because of no callback", function(){
				expect(validate).to["throw"];
			});

		});

		describe("validating against test2 schema that has invalid foreign key value, foreignKey:true - callback", function(){
			var result;
			var doc;
			var options;
			before(function(done){
				doc =  {
					testForeignKey: 3 //this is invalid in foreign key check
				};
				options = {foreignKey:true};
				return schemagic.test2.validate(doc, options, saveResult);

				function saveResult(err, res){
					if(err){
						return done(err);
					}
					result = res;
					return done();
				}
			});

			it("should return result with error", function(){
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
		describe("validating against test2 schema with foreign key check that fails, foreignKey:true - callback", function(){
			var error;
			var doc;
			var options;
			before(function(done){
				doc =  {
					testForeignKeyError: 3 //this foreign key checker fails
				};
				options = {foreignKey:true};
				return schemagic.test2.validate(doc, options, saveResult);

				function saveResult(err){
					error = err;
					return done();
				}
			});

			it("should error", function(){
				expect(error).to.be.instanceOf(Error).to.have.property("message", "This mock foreign key check fails");
			});
		});
	});

	describe("having required schemagic in test1 dir", function () {
		var schemagic1;
		before(function () {
			schemagic1 = require("./dirCacheTest/test1/requireSchemagic");
		});

		it("will have the test1 schema", function () {
			expect(schemagic1).to.have.property("test1");
		});

		it("will have only oen schema", function () {
			expect(Object.keys(schemagic1)).to.have.property("length").to.equal(1);
		});

		describe("requiring it again ()", function(){
			var shcmemagic2;
			before(function(){
				//requireSchemagic is not cached in require cache
				shcmemagic2 = require("./dirCacheTest/test1/requireSchemagic");
			});

			it("will be the same instance", function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
	describe("having required schemagic in test2 dir", function () {
		var schemagic1;
		before(function () {
			schemagic1 = require("./dirCacheTest/test2/requireSchemagic");
		});

		it("will have the test2 schema", function () {
			expect(schemagic1).to.have.property("test2");
		});

		it("will have only one schema", function () {
			expect(Object.keys(schemagic1)).to.have.property("length").to.equal(1);
		});

		describe("requiring it from subdir", function(){
			var shcmemagic2;
			before(function(){
				shcmemagic2 = require("./dirCacheTest/test2/test2subdir/requireSchemagic");
			});

			it("will be the same instance", function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
});
