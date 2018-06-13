module.exports = {
	"description":'Simple object',
	"required":true,
	"type":'object',
	"properties":{
		testForeignKey:{
			"type":'number',
			"required":false
		},
		testForeignKeyError:{
			"type":'number',
			"required":false
		},
		testForeignKey2:{
			"type":'number',
			"required":false
		},
		hiddenProperty: {
			type: ['null', 'string'],
			enum: [null, 'test', 'test2'],
			required: false,
			hidden: true
		}
	}
};