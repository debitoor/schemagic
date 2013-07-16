schemagic
=========

JSON validation with schemagic, and schema tools

Put your json-schemas in a directory called `schemas` in your root folder.

Each schema will be loaded with `require`. This is an example of a schema in the file `schemas/login.js`

```js
//JSON Schemas defined according to the standard json-schema http://json-schema.org/latest/json-schema-core.html
var regexpPatternUtil = require("./util/regexpPatternUtil");
module.exports = {
	"description":"Login",
	"required":true,
	"type":"object",
	"properties":{
		"email":{
			"description":"Email of the user",
			"required":true,
			"type":"string",
			"format":"email",
			"pattern": regexpPatternUtil.emailPattern.source,
			"example": "email@mydomain.com"
		},
		"password":{
			"description":"Password of the user",
			"required":true,
			"type":"string",
			"example": "*********"
		}
	}
};
```

When you require schemagic
```
var schemagic = require("schemagic");
```

You will find the following things on `schemagic.login`

NOTE: if you do:
```
Object.keys(schmagic)
```
You will ONLY get schemas. Anything not a schema on schemagic is non-enumerable

schemagic.login.validate(object, options[, callback])
================================

You will be able to validate a JavaScript object against the schema definition with the `validate` function. 
This is just a proxy for the [`json-schema`](https://github.com/kriszyp/json-schema) validate function.

Options can be passed to the `validate` function:
```js
{
	removeReadOnlyFields: true, // remove readonly fields from the object, default: true
	removeEmptyFields: true,     // remove empty fields (null, "" and undefined) from the object, default: true
	decimalsValidation: true,  // enable maxDecimals check, default:true
	stringFormatValidation: true, // enable check of date and date-time formats to be ANSI standard, default: true
	filter: true  // filter away any properties not in schema (if additionalProperties:false), default: false
	foreignKeys: false //check MongoDB foreign keys (callback is required), default: false
	mongo: [tenantmongo-object] // this is just passed to the functions in schemas/foreignKeys.js
}
```

It will return this kind of response if there is an error:
```js
{
	valid: false,
	errors: [
		{
    		"property":"a",
    		"message":"string value found, but a number is required"
    	}
	]
}
```

schemagic.login.exampleJson
===========================
This property wil contain a string, with pretty-printed JSON and comments about what is required, read only and so on.
This example JSON is generated directly from the schema definition, using the `example` properties, if available (not required).
Example:

```js
//Signup and login
{
     //Email of the user
    //Required
    email:"email@mydomain.com",
    //Password of the user
    //Required
    password:"*********"
}
```

schemagic.login.exampleJsonArray
================================
This property wil contain a string, with pretty-printed JSON and comments about what is required, read only and so on.
This example is almost the same as above, except the example shows an Array of objects that satisfy the schema.
Example:

```js
//Array
[
    //Signup and login
    {
        //Email of the user
        //Required
        email:"email@mydomain.com",
        //Password of the user
        //Required
        password:"*********"
    }
    , ...
]
```

schemagic.login.`schema`
======================
This property wil contain the result of `require("schemagic/login.js")`, the raw schema as it was required from disk.


Foreign key constraints in MongoDB (`schemas/foreignKeys.js`)
===================================================================
In the file `schemas/foreignKeys.js` you can specify foreign key constraints for MongoDB like this

NOTE: It makes sense to extract the first function here into helper function and reuse

```js
module.exports = {
	invoiceId: function(invoiceIds, options, callback){
		var ids = invoiceIds.map(function(invoiceId){
			return new options.mongo.ObjectID(invoiceId);
		});
		options.mongo("invoices").find({_id: {$in: ids} }, {_id:1}, getArray);

		function getArray(err, cursor){
			if(err){
				return callback(err);
			}
			cursor.toArray(checkResults);
		}

		function checkResults(err, invoicesInDb){
			var result;
			if(err){
				return callback(err);
			}
			if(invoicesInDb.length === invoiceIds.length){
				//Array of length = invoiceIds.length, with values all TRUE
				result = invoicesInDb.map(Boolean); //truthy values become TRUE
				return callback(null, result); //result array must have same order as array passed in invoiceIds param
			}
			var idsInDb = invoicesInDb.map(function(invoice){
                invoice._id.toString();
            });
			result = invoiceIds.map(function(invoiceId){
				return idsInDb.indexOf(invoiceId) !== -1;
			});
			return callback(null, result); //result array must have same order as array passed in invoiceIds param
		}
	},
	unitId: function(unitIds, options, callback){
		//unitIds === [1,9999,2]
		//lookup in memory: result = [true, false, true]; array must have same order as array passed in unitIds param
		return callback(null, result);
	}
};
```

Foreign keys are specified by convention. Meaning that with the above specification, ANY property with the name
`invoiceId` or `unitId` will be subject to a foreign key check in ALL schemas.


schemagic.getSchemaFromObject() (non-enumerable)
=====================================
EXPERIMENTAL (NOTE: on root schemagic object)

When `getSchemaFromObject` is called with a JavaScript object, it will return a suggested schema for that object.
It's far from perfect, but it gives you a starting point if you are creating a schema for a large object.
