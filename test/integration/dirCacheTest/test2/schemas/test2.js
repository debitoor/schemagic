module.exports = {
	"description":'Simple object',
	"required":true,
	"type":'object',
	"properties":{
		"a":{
			"type":'number',
			"required":true
		},
		"b":{
			"type":'string',
			"required":false,
			"readonly":true
		},
		"c":{
			"type":'string',
			"required":true,
			"readonly":false
		},
		"d":{
			"type":'string',
			"required":false,
			"readonly":true
		}
	}
};