module.exports = {

	// Common
	emptySchema:{

	},

	schemaRootObjectWithoutPropertiesSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object"
	},

	schemaObjectWithoutPropertiesSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"object",
				"required":true
			}
		}
	},

	noReadOnlySchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"type":"string",
				"required":true
			},
			"c":{
				"type":"string",
				"required":true,
				"readonly":false
			},
			"d":{
				"type":"string",
				"required":false
			}
		}
	},

	simpleSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"type":"string",
				"required":false,
				"readonly":true
			},
			"c":{
				"type":"string",
				"required":true,
				"readonly":false
			},
			"d":{
				"type":"string",
				"required":false,
				"readonly":true
			}
		}
	},

	simpleSchemaWithNoAdditionalProperties:{
		description: "Simple object",
		required: true,
		type: "object",
		additionalProperties: false,
		properties:{
			a: {
				"type":"number",
				"required":true
			},
			b: {
				"type":"string",
				"required":false,
				"readonly":true
			}
		}
	},

	nestedSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"required":true,
				"type":"object",
				"properties":{
					"d":{
						"type":"string",
						"required":false,
						"readonly":true
					},
					"e":{
						"type":"string",
						"required":true
					}
				}
			},
			"c":{
				"type":"string",
				"required":false,
				"readonly":true
			}
		}
	},

	arrayReadOnlyItemsSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"required":true,
				"type":"array",
				"items":{
					"required":false,
					"readonly":true,
					"type":"object",
					"properties":{
						"d":{
							"type":"string",
							"required":false,
							"readonly":true
						},
						"e":{
							"type":"string",
							"required":false
						}
					}
				}
			},
			"c":{
				"type":"string",
				"required":false,
				"readonly":true
			}
		}
	},

	arraySchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"d":{
							"type":"string",
							"required":false,
							"readonly":true
						},
						"e":{
							"type":"string",
							"required":true
						}
					}
				}
			},
			"c":{
				"type":"string",
				"required":false,
				"readonly":true
			}
		}
	},

	arrayNestedSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"b":{
							"required":true,
							"type":"object",
							"properties":{
								"c":{
									"type":"string",
									"required":false,
									"readonly":true
								},
								"d":{
									"type":"string",
									"required":true
								}
							}
						}
					}
				}
			}
		}
	},

	arrayAtRootSchema:{
		"description":"Schema that contains an array at root level",
		"required":true,
		"type":"array",
		"items":{
			"description":"The id",
			"required":true,
			"type":"object",
			"properties":{
				"id":{
					"description":"Must be a valid id",
					"required":false,
					"readonly":true,
					"type":"string",
					"example":"503714a74400b29809000004"
				}
			}
		}
	},

	// DecimalSchema

	noDecimalSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"type":"string",
				"required":true
			},
			"c":{
				"type":"string",
				"required":true,
				"readonly":false
			},
			"d":{
				"type":"string",
				"required":false
			}
		}
	},

	simpleDecimalSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"type":"number",
				"required":false,
				"maxDecimal":2
			},
			"c":{
				"type":["null","number"],
				"required":true
			},
			"d":{
				"type":["null","number"],
				"required":false,
				"maxDecimal":3
			}
		}
	},

	nestedDecimalSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"required":true,
				"type":"object",
				"properties":{
					"d":{
						"type":"number",
						"required":false,
						"maxDecimal":2
					},
					"e":{
						"type":"string",
						"required":true
					}
				}
			},
			"c":{
				"type":"number",
				"required":false,
				"maxDecimal":3
			}
		}
	},

	arrayDecimalSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"d":{
							"type":"number",
							"required":false,
							"maxDecimal":2
						},
						"e":{
							"type":"string",
							"required":true
						}
					}
				}
			},
			"c":{
				"type":"number",
				"required":false,
				"maxDecimal":3
			}
		}
	},

	arrayNestedDecimalSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"b":{
							"required":true,
							"type":"object",
							"properties":{
								"c":{
									"type":"number",
									"required":false,
									"maxDecimal":2
								},
								"d":{
									"type":"string",
									"required":true
								}
							}
						}
					}
				}
			}
		}
	},

	arrayAtRootDecimalSchema:{
		"description":"Schema that contains an array at root level",
		"required":true,
		"type":"array",
		"items":{
			"description":"The id",
			"required":true,
			"type":"object",
			"properties":{
				"a":{
					"required":false,
					"maxDecimal":2,
					"type":"number"
				}
			}
		}
	},

	// StringFormatSchema

	noStringFormatSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"number",
				"required":true
			},
			"b":{
				"type":"string",
				"required":true
			},
			"c":{
				"type":"string",
				"required":true,
				"readonly":false
			},
			"d":{
				"type":"string",
				"required":false
			}
		}
	},

	simpleStringFormatSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"string",
				"required":true
			},
			"b":{
				"type":"string",
				"required":false,
				"format": "date"
			},
			"c":{
				"type":["null","string"],
				"required":true
			},
			"d":{
				"type":["null","string"],
				"required":false,
				"format": "date"
			}
		}
	},

	nestedStringFormatSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"string",
				"required":true
			},
			"b":{
				"required":true,
				"type":"object",
				"properties":{
					"d":{
						"type":"string",
						"required":false,
						"format": "date"
					},
					"e":{
						"type":"string",
						"required":true
					}
				}
			},
			"c":{
				"type":"string",
				"required":false,
				"format": "date"
			}
		}
	},

	arrayStringFormatSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"string",
				"required":true
			},
			"b":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"d":{
							"type":"string",
							"required":false,
							"format": "date"
						},
						"e":{
							"type":"string",
							"required":true
						}
					}
				}
			},
			"c":{
				"type":"string",
				"required":false,
				"format": "date"
			}
		}
	},

	arrayNestedStringFormatSchema:{
		"description":"Simple object",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"required":true,
				"type":"array",
				"items":{
					"required":true,
					"type":"object",
					"properties":{
						"b":{
							"required":true,
							"type":"object",
							"properties":{
								"c":{
									"type":"string",
									"required":false,
									"format": "date"
								},
								"d":{
									"type":"string",
									"required":true
								}
							}
						}
					}
				}
			}
		}
	},

	arrayAtRootStringFormatSchema:{
		"description":"Schema that contains an array at root level",
		"required":true,
		"type":"array",
		"items":{
			"description":"The id",
			"required":true,
			"type":"object",
			"properties":{
				"a":{
					"required":false,
					"format": "date",
					"type":"string"
				}
			}
		}
	},

	dateTimeSchema: {
		"description":"Simple object with date and datetime",
		"required":true,
		"type":"object",
		"properties":{
			"a":{
				"type":"string",
				"format": "date",
				"required":false
			},
			"b":{
				"type":"string",
				"format": "date-time",
				"required":false
			}
		}
	},
	
	oneOfSchema: {
		description: "Simple object with 2 possible subdocuments",
		required: true,
		type: "object",
		properties: {
			a: {
				type: "object",
				oneOf: [
					{
						type: 'object',
						properties: {
							b: {
								type: "string",
								required: true
							}
						}
					}, {
						type: 'object',
						properties: {
							c: {
								type: "string",
								required: true
							}
						}
					}
				]
			}
		}
	},

	schemaWithEnum: {
		description: "Simple object with enum",
		required: true,
		type: 'object',
		properties: {
			a: {
				description: 'Type of invoice/creditNote',
				required: false,
				type: ['null', 'string'],
				enum: ['foo', 'bar', undefined],
				example: 'bar'
			}
		}
	}
};
