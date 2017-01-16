define({ "api": [
  {
    "type": "post",
    "url": "/portfolio/portfolios/",
    "title": "Add New Portfolio",
    "name": "AddNewPortfolio_",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API Adds Portfolio.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj\n  \"Content-Type\" : application/json \n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "modelId",
            "description": "<p>Model Id.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "isSleevePortfolio",
            "description": "<p>Sleeve Portfolio - 0/1(true/false).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tags",
            "description": "<p>Tags name.</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "teamIds",
            "description": "<p>Portfolio team id.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "primaryTeamId",
            "description": "<p>Portfolio Primary team id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n     \"name\": \"Demo Portfolio\",\n     \"modelId\": 11111,\n     \"isSleevePortfolio\" :false,\n     \"tags\" : \"test\",\n     \"teamIds\": [ 1,2,5],\n     \"primaryTeamId\": 1\n   }",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The Portfolio Id.</p>"
          },
          {
            "group": "Success 201",
            "type": "String",
            "optional": false,
            "field": "general",
            "description": "<p>General information of the Portfolio.</p>"
          },
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "teams",
            "description": "<p>Teams of the Portfolio.</p>"
          },
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "issues",
            "description": "<p>Issues In Portfolio.</p>"
          },
          {
            "group": "Success 201",
            "type": "Boolean",
            "optional": false,
            "field": "summary",
            "description": "<p>Portfolio summary.</p>"
          },
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "accounts",
            "description": "<p>Portfolio Accounts information.</p>"
          },
          {
            "group": "Success 201",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 201",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Full Name of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 201",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 201",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Full Name of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 OK\n    {\n     \"id\":13,\n     \"general\" : {\n         \"portfolioName\" : \"Demo Portfolio\",\n         \"sleevePortfolio\" : false,\n         \"modelId\" : 11111,\n         \"modelName\" : \"My Model\",\n         \"tags\" : \"test\"\n     },\n     \"teams\" : [{\n         \"id\" : 1,\n         \"name\" : \"Team-One\",\n         \"isPrimary\" : true\n         },{\n         \"id\" : 2,\n         \"name\" : \"Team-Two\",\n         \"isPrimary\" : false\n         },{\n         \"id\" : 5,\n         \"name\" : \"Team-Five\",\n         \"isPrimary\" : false\n     }],\n     \"issues\" : {\n         \"outOfTolerance\" : 12,\n         \"cashNeed\" : 1200,\n         \"setForAutoRebalance\" : true,\n         \"contributions\" : 100,\n         \"distribution\" : 4000,\n         \"modelAssociation\" : true,\n         \"blocked\" : false,\n         \"TLHOpportunity\" : false,\n         \"dataErrors\" : 15,\n         \"pendingsTrades\" : 7\n     },\n     \"summary\" : {\n         \"AUM\" : {\n             \"total\" : 4000,\n             \"managed\" : 1250,\n             \"excludedValue\" : 1000,\n             \"totalCash\" : {\n             \"total\" : 1750,\n             \"reserve\" : 1000,\n             \"cash\" : 750\n             }\n             },\n         \"realized\" : {\n             \"total\" : 400,\n             \"shortTerm\" : 500,\n             \"shortTermStatus\"  :\"high\",\n             \"longTerm\" : 100,\n             \"longTermStatus\"  :\"low\"\n         }\n     },\n     \"accounts\" : {\n         \"regular\" : [\n         {\n         \"id\" : 1299,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ],\n         \"sma\" : [\n         {\n         \"id\" : 1279,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ],\n         \"sleeved\" : [\n         {\n         \"id\" : 1259,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ]\n     },\n     \"isDeleted\": 0,\n     \"createdOn\": \"0000-00-00 00:00:00\",\n     \"createdBy\": \"ETL ETL\",\n     \"editedOn\": \"0000-00-00 00:00:00\",\n     \"editedBy\": \"ETL ETL\"\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid / Without JWT Token.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_Request",
            "description": "<p>When without request data.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unprocessable_Entity",
            "description": "<p>When Portfolio already exist with same name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad_Request\n{\n  \"message\": \"Bad Request: Verify request data\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 422 Unprocessable_Entity\n{\n  \"message\": \"Portfolio already exist with same name\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "post",
    "url": "/portfolio/portfolios/:id/accounts",
    "title": "Assign Portfolio to Accounts",
    "name": "AssignPortfolioToAccounts_",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API Assign portfolio to Accounts.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj\n  \"Content-Type\" : application/json \n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "accountIds",
            "description": "<p>Accounts id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n     \"accountIds\" : [1120129,2324242]\n   }",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/13/accounts",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n      \"message\": \"Portfolio assigned to accounts successfully\"\n    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid / Without JWT Token.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_Request",
            "description": "<p>When without request data.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad_Request\n{\n  \"message\": \"Bad Request: Verify request data\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "delete",
    "url": "/portfolio/portfolios/:id",
    "title": "Delete Portfolio",
    "name": "DeletePortfolio",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API deletes Portfolio (soft delete).</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolio/1",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n        \"message\": \"Portfolio deleted successfully\"\n    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid / Without JWT Token.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_Found",
            "description": "<p>When Portfolio does not exist or already deleted.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 404 Not_Found\n{\n  \"message\": \"Portfolio does not exist or already deleted\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/:id/accounts/summary",
    "title": "Get accounts count of portfolio.",
    "name": "GetAccountssountOfPortfolio_",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API Get accounts count of portfolio</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj\n  \"Content-Type\" : application/json \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/13/accounts/summary",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "count",
            "description": "<p>The Portfolio Id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n      \"count\" : 2\n    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid / Without JWT Token.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_Request",
            "description": "<p>When without request data.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad_Request\n{\n  \"message\": \"Bad Request: Verify request data\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios",
    "title": "Get All Portfolios",
    "name": "GetAllPortfolios",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API gets Portfolio List.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/portfolioStatus",
    "title": "Get All Portfolios Status List",
    "name": "GetPortfolioStatus",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API gets portfolio status list.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/portfolioStatus",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>The Portfolio Status.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n     {\n        \"id\": 1,\n        \"status\": \"Out of Tolerance\"\n     }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/simple",
    "title": "Get All Portfolio(Simple)",
    "name": "GetSimplePortfolioList",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API gets portfolio list.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/simple",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Portfolio created by team/advisor.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n      {\n        \"id\": 1,\n        \"name\": \"Test Portfolio\",\n        \"source\": \"Advisor\",\n        \"isDeleted\": 0,\n        \"createdOn\": \"2016-06-17T05:57:22.000Z\",\n        \"createdBy\": 0,\n        \"editedOn\": \"2016-06-17T05:57:22.000Z\",\n        \"editedBy\": 0\n      }\n    ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/new",
    "title": "List all newly created Portfolios",
    "name": "NewPortfoliosList",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API lists all newly created Portfolios.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/new",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/:id",
    "title": "Get Portfolio Details",
    "name": "PortfolioDetails_",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API gets Portfolio Details.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj\n  \"Content-Type\" : application/json \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/13",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The Portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "general",
            "description": "<p>General information of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "teams",
            "description": "<p>Teams of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "issues",
            "description": "<p>Issues In Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "summary",
            "description": "<p>Portfolio summary.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "accounts",
            "description": "<p>Portfolio Accounts information.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Full Name of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Full Name of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n     \"id\":13,\n     \"general\" : {\n         \"portfolioName\" : \"Demo Portfolio\",\n         \"sleevePortfolio\" : false,\n         \"modelId\" : 11111,\n         \"modelName\" : \"My Model\",\n         \"tags\" : \"test\"\n     },\n     \"teams\" : [{\n         \"id\" : 1,\n         \"name\" : \"Team-One\",\n         \"isPrimary\" : true\n         },{\n         \"id\" : 2,\n         \"name\" : \"Team-Two\",\n         \"isPrimary\" : false\n         },{\n         \"id\" : 5,\n         \"name\" : \"Team-Five\",\n         \"isPrimary\" : false\n     }],\n     \"issues\" : {\n         \"outOfTolerance\" : 12,\n         \"cashNeed\" : 1200,\n         \"setForAutoRebalance\" : true,\n         \"contributions\" : 100,\n         \"distribution\" : 4000,\n         \"modelAssociation\" : true,\n         \"blocked\" : false,\n         \"TLHOpportunity\" : false,\n         \"dataErrors\" : 15,\n         \"pendingsTrades\" : 7\n     },\n     \"summary\" : {\n         \"AUM\" : {\n             \"total\" : 4000,\n             \"managed\" : 1250,\n             \"excludedValue\" : 1000,\n             \"totalCash\" : {\n             \"total\" : 1750,\n             \"reserve\" : 1000,\n             \"cash\" : 750\n             }\n             },\n         \"realized\" : {\n             \"total\" : 400,\n             \"shortTerm\" : 500,\n             \"shortTermStatus\"  :\"high\",\n             \"longTerm\" : 100,\n             \"longTermStatus\"  :\"low\"\n         }\n     },\n     \"accounts\" : {\n         \"regular\" : [\n         {\n         \"id\" : 1299,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ],\n         \"sma\" : [\n         {\n         \"id\" : 1279,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ],\n         \"sleeved\" : [\n         {\n         \"id\" : 1259,\n         \"name\" : \"PortfolioName\",\n         \"account\" : \"100333\",\n         \"managed\" : 100000,\n         \"excludedValue\" : 5000,\n         \"total\" : 105000,\n         \"tradePending\" : true,\n         \"status\" : \"active\"\n         }\n         ]\n     },\n     \"isDeleted\": 0,\n     \"createdOn\": \"0000-00-00 00:00:00\",\n     \"createdBy\": \"ETL ETL\",\n     \"editedOn\": \"0000-00-00 00:00:00\",\n     \"editedBy\": \"ETL ETL\"\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid / Without JWT Token.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_Request",
            "description": "<p>When without request data.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_Found",
            "description": "<p>When Portfolio does not exist.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad_Request\n{\n  \"message\": \"Bad Request: Verify request data\"\n}",
          "type": "json"
        },
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 404 Not_Found\n{\n  \"message\": \"Portfolio does not exist\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios?householdIds={Household_Id}",
    "title": "List all Portfolios by householdIds",
    "name": "PortfoliosListOnHousehold",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API filters Portfolios on the basis of householdIds.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios?householdIds={Household_Id}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios?status={Portfolio_Status_Id}",
    "title": "List Portfolios of Portfolio Status",
    "name": "PortfoliosListOnPortfolioStatus",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API list portfolios on basis of Portfolio Status.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios?status={Portfolio_Status_Id}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/new?search={id/name}",
    "title": "Search Portfolios",
    "name": "SearchNewPortfolios",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API search in new portfolios.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/new?search={id/name}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios?search={id/name}",
    "title": "Search Portfolios",
    "name": "SearchPortfolios",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API search portfolio.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios?search={id/name}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "account",
            "description": "<p>Accounts assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model assigned to portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "team",
            "description": "<p>Primary Team of portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "managed",
            "description": "<p>Portfolio value managed by user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "excludedValue",
            "description": "<p>Portfolio value not managed by current user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total Portfolio Value (Managed Value + Excluded Value).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradesPending",
            "description": "<p>Yes/No –Whether trades are pending on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "percentDeviations",
            "description": "<p>Percent Deviations of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashReserve",
            "description": "<p>Min cash value that portfolio needs to hold to be active.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashNeed",
            "description": "<p>Cash needed (in %) to maintain reserves.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cash",
            "description": "<p>Cash (held by portfolio) managed by user(value in $).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "cashPercent",
            "description": "<p>Cash (held by portfolio) managed by user(value in %).</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCash",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "minCashPercent",
            "description": "<p>Minimum Cash to be held in Portfolio (from Preferences) – value in %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCash",
            "description": "<p>Sum of Cash reserve and Cash $.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "totalCashPercent",
            "description": "<p>Total cash held by portfolio in terms of %.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "autoRebalanceDate",
            "description": "<p>Next Auto Rebalance date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "OUB",
            "description": "<p>True/False – Whether Portfolio is currently Out of Balance.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "contribution",
            "description": "<p>Portfolio contribution.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "tradeBlocked",
            "description": "<p>Yes/No –Whether trades are blocked on this Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>will contain an icon for [Ok,Warning,Error]</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "TLH",
            "description": "<p>True/False – Tax loss harvesting.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "advisor",
            "description": "<p>Advisor Name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Portfolio value.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style (from the assigned model).</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastRebalancedOn",
            "description": "<p>Last Rebalanced Date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n    \"id\" : 1,\n    \"name\" : \"Test Portfolio\", \n    \"account\" :  [\n      {\n       \"id\" : 1299,\n       \"name\" : \"Demo Account\",\n       \"account\" : \"100333\",\n       \"managed\" : 100000,\n       \"excludedValue\" : 5000,\n       \"total\" : 105000,\n       \"tradePending\" : true,\n       \"cashValue\" : 5000,\n       \"cashReserve\" : 1000,\n       \"totalCash\" : 6000\n      }\n     ],\n    \"model\" : \"aggressive\",\n    \"team\" : \"Team-One\" ,\n    \"managed\" : 100000,\n    \"excludedValue\" : 90000,\n    \"total\" : 190000,\n    \"action\" : \"Rebalance\",\n    \"tradesPending\" : true,\n    \"percentDeviations\": 5,\n    \"cashReserve\": 1000,\n    \"cashNeed\": 8,\n    \"cash\": 10000,\n    \"cashPercent\": 10,\n    \"minCash\": 1000,\n    \"minCashPercent\": 10,\n    \"totalCash\": 11000,\n    \"totalCashPercent\": 30,\n    \"autoRebalanceDate\": \"0000-00-00\",\n    \"OUB\": true,\n    \"contribution\": 1000,\n    \"tradeBlocked\": true,\n    \"status\": \"ok\",\n    \"TLH\": true,\n    \"advisor\": \"advisor\",\n    \"value\": 10000,\n    \"style\": \"style\",\n    \"lastRebalancedOn\": \"0000-00-00\",\n    \"isDeleted\": 0,\n    \"createdOn\": \"0000-00-00 00:00:00\",\n    \"createdBy\": \"ETL ETL\",\n    \"editedOn\": \"0000-00-00 00:00:00\",\n    \"editedBy\": \"ETL ETL\"\n    }\n   ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  },
  {
    "type": "get",
    "url": "/portfolio/portfolios/simple?search={id/name}",
    "title": "Search Portfolios(Simple)",
    "name": "SearchSimplePortfolios",
    "version": "1.0.0",
    "group": "Portfolios",
    "permission": [
      {
        "name": "appuser"
      }
    ],
    "description": "<p>This API search simple portfolio.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "JWTToken",
            "description": "<p>The JWT auth token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj \n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://baseurl/v1/portfolio/portfolios/simple?search={id/name}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>The portfolio Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the Portfolio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Portfolio created by team/advisor.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isDeleted",
            "description": "<p>Portfolio exist or not into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdOn",
            "description": "<p>Portfolio creation date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "createdBy",
            "description": "<p>Id of user who created the Portfolio into the system.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "editedOn",
            "description": "<p>Portfolio edited date into application.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "editedBy",
            "description": "<p>Id of user who edited the Portfolio details into the system.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n      {\n        \"id\": 1,\n        \"name\": \"Test Portfolio\",\n        \"source\": \"Advisor\",\n        \"isDeleted\": 0,\n        \"createdOn\": \"2016-06-17T05:57:22.000Z\",\n        \"createdBy\": 0,\n        \"editedOn\": \"2016-06-17T05:57:22.000Z\",\n        \"editedBy\": 0\n      }\n    ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Invalid/Without JWT Token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  \"message\": \"Invalid Authorization Header\"\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/portfolio/PortfolioController.js",
    "groupTitle": "Portfolios"
  }
] });
