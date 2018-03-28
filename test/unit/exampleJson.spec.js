var schemas = require('../exampleSchemas');
var exampleJson = require('../../generateExampleJson');

//This is just a helper function I used for adding tests retrospectively
//Given a string output from exampleJson, it will console log
// a nicely formatted string for inserting into your expect statement
function formatJsonExampleForExpect(exampleJsonGenerated) {
	console.log('\n\'' + JSON.stringify(exampleJsonGenerated).replace(/^"/, '').replace(/"$/, '').replace(/\\\"/g, '"').replace(/\\n/g, '\\n\'+\n\'') + '\'\n');
}

describe('/source/util/exampleJson', function () {

	it('will generate correct exampleJsonString for noReadOnlySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.noReadOnlySchema);
		expect(exampleJsonGenerated).to.equal(
			'//Simple object\n' +
			'{\n' +
			'    //Required\n' +
			'    a:1,\n' +
			'    //Required\n' +
			'    b:"value",\n' +
			'    //Required\n' +
			'    c:"value",\n' +
			'    //Optional\n' +
			'    d:"value"\n' +
			'}'
		);
	});

	it('will generate correct exampleMinimalJsonString for schemaOneMinimalProperty', function () {
		var exampleJsonGenerated = exampleJson(schemas.schemaOneMinimalProperty, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Optional
    a:"value"
}`
		);
	});

	it('will generate correct minimal exampleJsonString for noReadOnlySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.noReadOnlySchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:"value",
    //Required
    c:"value"
}`
		);
	});

	it('will generate correct exampleJsonString for schemaWithVeryLongDescription, ' +
		'should word wrap the long description', function () {
		var exampleJsonGenerated = exampleJson(schemas.schemaWithVeryLongDescription);
		expect(exampleJsonGenerated).to.equal(`//long long long long long long long long long long long long long long long long 
//long long long long long long long long long long long long long long long long 
//long long long long long long long long long long long long long long long long 
//long long long long long long long long long long long long long long
{
    //long long long long long long long long long long long long long long long long 
    //long long long long long long long long long long long long long long long long 
    //long long long long long long long long long long long long long long long long 
    //long long long long long long long long long long long long long long
    //Optional
    //Format: currency. Must be a number with a maximum of two decimals after the decimal point. Must be between -90071992547409.9 and 90071992547409.9
    a:1
}`);
	});

	it('will generate correct exampleJsonString for schemaWithFormats', function () {
		var exampleJsonGenerated = exampleJson(schemas.schemaWithFormats);
		expect(exampleJsonGenerated).to.equal(
			`//Formats
{
    //Optional
    //Format: currency. Must be a number with a maximum of two decimals after the decimal point. Must be between -90071992547409.9 and 90071992547409.9
    a:0,
    //Optional
    //Format: rate. Must be a number with a maximum of two decimals after the decimal point. Must be between 0 and 100
    b:1,
    //Optional
    //Format: rate-negative. Must be a number with a maximum of two decimals after the decimal point. Must be between -100 and 0
    c:1,
    //Optional
    //Format: currency-rate. Must be a number with a maximum of six decimals after the decimal point. Must be between 0.000001 and 999999999
    d:1,
    //Optional
    //Format: date. Must be a date in the format YYYY-MM-DD
    e:"value",
    //Optional
    //Format: date-time. Must be a date and time in the format YYYY-MM-DDThh:mm:ssZ
    f:"value",
    //Optional
    g:"",
    //Optional
    //Format: url. Must be a valid http:// or https:// URL
    h:"value",
    //Optional
    //Format: date-time-iso. Must be a date and time in the iso format YYYY-MM-DDThh:mm:ss.SSSZ
    i:"value"
}`
		);
	});

	it('will generate correct minimal exampleJsonString for schemaWithFormats', function () {
		var exampleJsonGenerated = exampleJson(schemas.schemaWithFormats, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Formats
{
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for noReadOnlySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.noReadOnlySchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:"value",
        //Required
        c:"value",
        //Optional
        d:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});
	it('will generate correct minimal exampleJsonString (Array) for noReadOnlySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.noReadOnlySchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:"value",
        //Required
        c:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString for simpleSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.simpleSchema);
		expect(exampleJsonGenerated).to.equal(`//Simple object
{
    //Required
    a:1,
    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
    b:"value",
    //Required
    c:"value",
    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
    d:"value"
}`);
	});

	it('will generate correct minimal exampleJsonString for simpleSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.simpleSchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    c:"value"
}`
		);
	});

	it('will generate correct noReadOnly exampleJsonString for simpleSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.simpleSchema, {noReadOnly: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    c:"value"
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for simpleSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.simpleSchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        b:"value",
        //Required
        c:"value",
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        d:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for simpleSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.simpleSchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        c:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});


	it('will generate correct exampleJsonString for nestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.nestedSchema);
		expect(exampleJsonGenerated).to.equal(`//Simple object
{
    //Required
    a:1,
    //Required
    b:{
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        d:"value",
        //Required
        e:"value"
    },
    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
    c:"value"
}`);
	});

	it('will generate correct minimal exampleJsonString for nestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.nestedSchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:{
        //Required
        e:"value"
    }
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for nestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.nestedSchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:{
            //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
            d:"value",
            //Required
            e:"value"
        },
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        c:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for nestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.nestedSchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:{
            //Required
            e:"value"
        }
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString for arrayReadOnlyItemsSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayReadOnlyItemsSchema);
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:[
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        {
            //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
            d:"value",
            //Optional
            e:"value"
        }
        //, ...
        //Any additional items in this array go here.
    ],
    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
    c:"value"
}`
		);
	});

	it('will generate correct minimal exampleJsonString for arrayReadOnlyItemsSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayReadOnlyItemsSchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:[]
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for arrayReadOnlyItemsSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayReadOnlyItemsSchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:[
            //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
            {
                //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
                d:"value",
                //Optional
                e:"value"
            }
            //, ...
            //Any additional items in this array go here.
        ],
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        c:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for arrayReadOnlyItemsSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayReadOnlyItemsSchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:[]
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString for arraySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arraySchema);
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:[
        //Required
        {
            //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
            d:"value",
            //Required
            e:"value"
        }
        //, ...
        //Any additional items in this array go here.
    ],
    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
    c:"value"
}`
		);
	});

	it('will generate correct minimal exampleJsonString for arraySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arraySchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:1,
    //Required
    b:[
        //Required
        {
            //Required
            e:"value"
        }
        //, ...
        //Any additional items in this array go here.
    ]
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for arraySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arraySchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:[
            //Required
            {
                //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
                d:"value",
                //Required
                e:"value"
            }
            //, ...
            //Any additional items in this array go here.
        ],
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        c:"value"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for arraySchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arraySchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:1,
        //Required
        b:[
            //Required
            {
                //Required
                e:"value"
            }
            //, ...
            //Any additional items in this array go here.
        ]
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString for arrayNestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayNestedSchema);
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:[
        //Required
        {
            //Required
            b:{
                //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
                c:"value",
                //Required
                d:"value"
            }
        }
        //, ...
        //Any additional items in this array go here.
    ]
}`
		);
	});

	it('will generate correct minimal exampleJsonString for arrayNestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayNestedSchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Simple object
{
    //Required
    a:[
        //Required
        {
            //Required
            b:{
                //Required
                d:"value"
            }
        }
        //, ...
        //Any additional items in this array go here.
    ]
}`
		);
	});

	it('will generate correct exampleJsonString (Array) for arrayNestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayNestedSchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:[
            //Required
            {
                //Required
                b:{
                    //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
                    c:"value",
                    //Required
                    d:"value"
                }
            }
            //, ...
            //Any additional items in this array go here.
        ]
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for arrayNestedSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayNestedSchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Simple object
    {
        //Required
        a:[
            //Required
            {
                //Required
                b:{
                    //Required
                    d:"value"
                }
            }
            //, ...
            //Any additional items in this array go here.
        ]
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString for arrayAtRootSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayAtRootSchema);
		expect(exampleJsonGenerated).to.equal(
			`//Schema that contains an array at root level
[
    //The id
    //Required
    {
        //Must be a valid id
        //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
        id:"503714a74400b29809000004"
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString for arrayAtRootSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayAtRootSchema, {minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Schema that contains an array at root level
[
    //The id
    //Required
    {
    }
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct exampleJsonString (Array) for arrayAtRootSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayAtRootSchema, {asArray: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Schema that contains an array at root level
    [
        //The id
        //Required
        {
            //Must be a valid id
            //Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.
            id:"503714a74400b29809000004"
        }
        //, ...
        //Any additional items in this array go here.
    ]
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

	it('will generate correct minimal exampleJsonString (Array) for arrayAtRootSchema', function () {
		var exampleJsonGenerated = exampleJson(schemas.arrayAtRootSchema, {asArray: true, minimal: true});
		expect(exampleJsonGenerated).to.equal(
			`//Array
[
    //Schema that contains an array at root level
    [
        //The id
        //Required
        {
        }
        //, ...
        //Any additional items in this array go here.
    ]
    //, ...
    //Any additional items in this array go here.
]`
		);
	});

});
