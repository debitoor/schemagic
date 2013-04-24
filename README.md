schemagic
=========

JSON validation with schemagic, and schema tools

Put your JSV schemagic in a directory called `schemagic` in your root folder.

Each schema will be loaded with `require`. This is an example of a schema in the file `schemagic/login.js`

```js
//JSON Schemas defined according to the standard JSV http://tools.ietf.org/html/draft-zyp-json-schema-03
module.exports = {
	login:{
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

schemagic.login.`validate(object, options)`
================================

You will be able to validate a JavaScript object against the schema definition with the `validate` function. 
This is just a proxy for the [`json-schema`](https://github.com/kriszyp/json-schema) validate function.

Options can be passed to the `validate` function:
```js
{
	removeReadOnlyFields: true, // remove readonly fields from the object, default: true
	removeEmptyFields: true,     // remove empty fields (null, "" and undefined) from the object, default: true
	doDecimalsValidation: true,  // enable maxDecimals check, default:true
	filter: true  // filter away any properties not in schema (if additionalProperties:false), default: false
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

schemagic.login.`exampleJson`
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

schemagic.login.`exampleJsonArray`
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


schemagic.`getSchemaFromObject()` (non-enumerable)
=====================================
EXPERIMENTAL (NOTE: on root schemagic object)

When `getSchemaFromObject` is called with a JavaScript object, it will return a suggested schema for that object.
It's far from perfect, but it gives you a starting point if you are creating a schema for a large object.
