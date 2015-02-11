schemagic [![Build Status](https://travis-ci.org/e-conomic/schemagic.svg?branch=master)](https://travis-ci.org/e-conomic/schemagic)
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

additionalProperties, default false
===================================
Instead of as in the spec where the default for the schema is to allow additionalProperties. Schmagic will insert
`additionalProperties:false` if you have not specified a `additionalProperties`value. We have done this to avoid
programmer mistakes of forgetting `additionalProperties:false` in schemas.

NOTE: Schemagic 2.0 does not support removing properties with the values null, empty string or undefined.
Take a look at the node module [groom](https://github.com/e-conomic/groom), for this functionality.


Build in formats
===================================
Schmagic has these build in formats:
- `currency`. Use this for numbers that are currency. Will allow maximum 2 decimals after the decimal point.
- `currency-rate` Positive number. Minimum 0.000001, maximum 999,999,999. Will allow maximum 6 decimals after the decimal point.
- `date`. Is verified to be a date of the format `YYYY-MM-DD`
- `date-time`. Is verified to be a valid date and time in the format `YYYY-MM-DDThh:mm:ssZ`
- `rate`. Positive number, between zero and 100. Will allow maximum 2 decimals after the decimal point
- `rate-negative`. Negative number, between zero and -100. Will allow maximum 2 decimals after the decimal point

schemagic.login.validate(object, options[, callback])
================================

You will be able to validate a JavaScript object against the schema definition with the `validate` function. 
This is just a proxy for the [`is-my-json-valid`](https://github.com/mafintosh/is-my-json-valid) validate function.

Options can be passed to the `validate` function:
```js
{
	removeReadOnlyFields: true, // remove readonly fields from the object, default: true
	filter: false  // filter away any properties not in schema (if additionalProperties:false), default: false
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

It will return this response if there is no error:
```js
{
	valid: true,
	errors: []
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

schemagic.login.schema
======================
This property wil contain the result of `require("schemagic/login.js")`, the raw schema as it was required from disk.


schemagic.login.patch
======================
This property wil contain a schemagic schema like `login` except ALL required properties are now optional and all
properties allow null values. This schema is intended for validation of JSON-PATCH. It has the properties:
```
- schemagic.login.patch.validate
- schemagic.login.patch.exampleJson
- schemagic.login.patch.exampleJsonArray
- schemagic.login.patch.schema
```


Foreign key constraints (`schemas/foreignKeys.js`)
===================================================================
In the file `schemas/foreignKeys.js` you can specify foreign key constraints for MongoDB and in-memory lookups
like this:

```js
function getForeignKeyChecker(collectionName, propertyName) {
	return function (documentIds, options, callback) {
		var ids = [], formatErrors = [], anyFormatError = false;
		documentIds.forEach(function (invoiceId) {
			var id;
			try {
				id = new options.mongo.ObjectID(invoiceId);
				formatErrors.push(true);
			} catch (ex) {
				formatErrors.push(false);
				anyFormatError = true;
			}
			ids.push(id);
		});
		if(anyFormatError){
			return callback(null, formatErrors);
		}
		var query = {};
		query[propertyName] = {$in: ids};
		var fields = {};
		fields[propertyName] = 1;
		return options.mongo(collectionName).find(query, fields, getArray);

		function getArray(err, cursor) {
			if (err) {
				return callback(err);
			}
			return cursor.toArray(checkResults);
		}

		function checkResults(err, documentsInDb) {
			var result;
			if (err) {
				return callback(err);
			}
			if (documentsInDb.length === documentIds.length) {
				//Array of length = invoiceIds.length, with values all TRUE
				result = documentsInDb.map(Boolean); //truthy values become TRUE
				return callback(null, result); //result array must have same order as array passed in documentIds param
			}
			var idsInDb = documentsInDb.map(function (invoice) {
				return traverse(invoice).get(propertyName.split(".")).toString();
			});
			result = documentIds.map(function (id) {
				return idsInDb.indexOf(id) !== -1;
			});
			return callback(null, result); //result array must have same order as array passed in documentIds param
		}
	};
}

module.exports = {
	invoiceId: getForeignKeyChecker("invoices", "_id"),
	unitId: function(unitIds, options, callback){
		//unitIds === [1,9999,2]
		//lookup in memory: result = [true, false, true]; array must have same order as array passed in unitIds param
		return callback(null, result);
	}
};
```

Foreign keys are specified by convention. Meaning that with the above specification, ANY property with the name
`invoiceId` or `unitId` will be subject to a foreign key check in ALL schemas.

If you want to use foreignKey checks you will have to pass `mongo` (and anything else used by your foreign key checkers) 
in `options` when you call `validate` like this:

```js
schemagic.invoice.validate(doc, {foreignKey:true, mongo: mongo}, callback);
```


If you want specific checks that only apply to one schema, for now you have to do them elswhere.

TODO: Specifying a foreign key check for one schema only could be done like this
```js
module.exports = {
	"expense.categoryId": function(categoryIds, options, callback){
		//...
	}
}
```
Where the above foreign key constraint only applies to the expense schema. THIS IS NOT IMPLEMENTED YET.


schemagic.getSchemaFromObject() (non-enumerable)
=====================================
EXPERIMENTAL (NOTE: on root schemagic object)

When `getSchemaFromObject` is called with a JavaScript object, it will return a suggested schema for that object.
It's far from perfect, but it gives you a starting point if you are creating a schema for a large object.
