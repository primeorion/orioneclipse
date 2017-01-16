var applicationEnum = {
	privilege: {
		0: 'Record',
		1: 'Function'
	},
	preferences:{
		AUTO_IMPORT: 'autoImportDailySync'
	},
	priceSource: {
		ORION_PRICE: 'Orion Price',
		XIGNITE_REALTIME: 'Xignite Realtime'
	},
	roleType: {
		FIRMADMIN: 1,
		TEAMADMIN: 2,
		USER: 3
	},
	MODULE_NAME: {
		MODEL: "Models",
		ACCOUNT: "Accounts",
		HOLDING: "Holdings",
		PORTFOLIO: "Portfolios",
		TRADE: "TradeOrders"
	},
	SECURITY_TYPE:{
		MUTUAL_FUND : 1,
		CASH : 2,
		CD : 4,
		EQUITY : 5, 
		BOND : 6,
		OPTION : 7,
		STOCK : 8,
		ANNUITY: 9,
		OTHER: 10
	},
	ETLUserId: 1,
	relatedType: {
		CLASS: 'CLASS',
		CATEGORY: 'CATEGORY',
		SUBCLASS: 'SUBCLASS'
	},
	/*
	 * normal security search = 2 security search when adding to securityset = 6
	 */securityStatus: {
		OPEN: 6, // 2 searchable
		NOT_APPROVED: 1, // non searchable
		EXCLUDED: 2, // 6 searchable but cannot be added to securityset
	},
	sellPriorities: {
		DO_NOT_SELL: 0,
		HARD_TO_SELL: 1,
		SELL_IF_NO_GAIN: 2,
		CAN_SELL: 3,
		SELL_TO_TARGET: 4,
		PRIORITY_SELL: 5
	},
	buyPriorities: {
		DO_NOT_BUY: 0,
		HARD_TO_BUY: 1,
		CAN_BUY: 2,
		BUY_TO_TARGET: 3,
		PRIORITY_BUY: 4
	},
	securitySetToleranceType: {
		BAND: 1,
		ABSOLUTE: 0
	},
	modelStatus: {
		APPROVED: 1,
		NOT_ACTIVE: 2,
		NOT_APPROVED: 3,
		DRAFT: 4
	},
	modelPortfolioStatus: {
		APPROVED: 1,
		NOT_APPROVED: 2
	},
	modelValidations: {
		modelTypeHierachy: {
			0: [1, 2, 4],
			1: [2, 4],
			2: [3, 4],
			3: [4]
		}
	},
	dynamicModelArbitraryAmount: 10000,
	modelActionStatus: {
		APPROVE: "approve",
		REJECT: "reject"
	},
	relatedTypeCodeToId: {
		CATEGORY: 1,
		CLASS: 2,
		SUBCLASS: 3,
		SECURITYSET: 4
	},
	preferenceLevel: {
		FIRM: 1,
		MODEL: 4
	},
	relatedTypeCodeToDisplayName: {
		CATEGORY: "Category",
		CLASS: "Class",
		SUBCLASS: "Sub Class",
		SECURITYSET: "Security Set"
	},
	tradeSideCode: {
		BUY: "Buy",
		SELL: "Sell"
	},
	tradeSideCodeId: {
		BUY: 1,
		SELL: 2
	},
	tradeFileTemplates: {
		2: "Schwab",
		3: "Tda",
		4: "Fidelity",
		5: "Perishing"
	},
	TRADE_ORDER: {
		TYPE: {
			ACCOUNT: 1,
			PORTFOLIO: 2
		},
		ACTION: {
			BUY: 1,
			SELL: 2,
			REBALANCE: 3,
			BUY_REBALANCE: 4,
			SELL_REBALANCE: 5,
		    LIQUIDATE: 6
		},
		ACTION_NAME: {
			1: "BUY",
			2: "SELL",
			3: "REBALANCE",
			4: "BUY_REBALANCE",
			5: "SELL_REBALANCE",
			6: "LIQUIDATE"
		},
		ACTION_PROP_TYPE: {
			DOLLAR: 1,
			SHARE: 2,
			PERCENT: 3
		},
		ACCOUNT_TAXABLE_TYPE: {
			TAXABLE: "TAXABLE",
			TAX_EXEMPT: "TAXEXMPT",
			TAX_DEFFERED: "TAXDEF"
		},
		APPROVAL_TYPE: {
			APPROVED: 1,
			NOT_APPROVED: 3,
			PENDING_APPROVAL: 2
		},
		ORDER_STATUS: {
			NOT_SENT: "not sent",
			SENT: "sent",
			PARTIALLY_FILLED: "Partially Filled",
			DONE_FOR_DAY: "Done for Day",
			PENDING_CANCEL: "Pending Cancel",
			PENDING_REPLACE: "Pending Replace"
		}
	},
	TRADE_ORDER_MESSAGE: {
		SHORT_CODES: {
			TRADE_RULE_ALREADY_TRADED: "TradeRuleAlreadyTraded",
			ORDER_IS_DISABLED: "ODisabled",
			NOT_ENOUGH_CASH: "NoCash",
			RESULTING_PERCENTAGE: "RPercent",
			RESERVE_CASH: "ReserveC",
			AVAILABLE_CASH: "AvailableC",
			CASH_WAS_OVERSPENT: "COverspent",
			PRODUCT_ZERO_PRICE: "PZeroPrice",
			TRADE_BLOCKED_ASSET_BUY: "BlockedBuy",
			TRADE_BLOCKED_ASSET_SELL: "BlockedSell",
			TRADE_OVER_SPEND_CASH : "OverspendCash",
			TRADE_AMOUNT_MORE : "TradeAmountMore",
			SHORT_TERM_FEES : "ShortTermFees",
			SMA_ACCOUNT : "SmaAccount"
			
		}
	},
	SPEND_CASH:{
		METHOD_ID:{
			BUY_REBALANCE:"41",
			SELL_REBALANCE:"41"
		}
	},
	corporateAction: {
		STOCK_SPLIT: 1,
		REVERSE_SPLIT: 2,
		SPIN_OFF: 3
	},
	modelApprovePrivilege: "APPROVEMODELCHG",
	roleTypeWhoCanModelChangeStatus: [1],
	notificationCategoryCode: "notificationCategoryCode",
	sleeveFiles: {
		ACCOUNT: {
			HEADERS: ["OrionFirmId", "ExternalId", "AccountId", "AccountNumber", "AccountName", "PortfolioId", "PortfolioName",
				"HouseholdId", "HouseholdName", "AccountType", "Taxable", "AccountYTDRealizedSTGL", "AccountYTDRealizedLTGL",
				"SSN", "SweepSymbol", "Custodian", "CustodialAccountNumber", "AdvisorName", "AdvisorExternalId",
				"SleeveType", "SleeveTarget", "SleeveContributionPercent", "SleeveDistributionPercent", "SleeveToleranceLower",
				"SleeveToleranceUpper", "SMA", "SMATradeable", "BillingAccount", "SystematicAmount", "SystematicDate",
				"HashedSSN", "SleeveStrategyName", "SleeveContributionMethod", "SleeveDistributionMethod", "RegistrationId"],
			FILENAME: "_Account.tsv"
		},
		ADVISOR: {
			HEADERS: ["OrionFirmId", "ExternalId", "AdvisorNumber", "BrokerDealer", "AdvisorName"],
			FILENAME: "_Advisor.tsv"
		},
		CUSTODIAN: {
			HEADERS: ["OrionFirmId", "ExternalId", "Name", "Code", "MasterAccountNumber"],
			FILENAME: "_Custodian.tsv"
		},
		HOLDING: {
			HEADERS: ["OrionFirmId", "ExternalId", "Symbol", "Price", "PriceDate",
				"AccountNumber", "AccountId", "MarketValue", "Quantity",
				"PositionYTDRealizedSTGL", "PositionYTDRealizedLTGL"],
			FILENAME: "_Holding.tsv"
		},
		REALIZEDGAINLOSS: {
			HEADERS: ["OrionFirmId", "ExternalId", "Symbol", "AccountId", "AccountNumber",
				"GrossProceeds", "NetProceeds", "CostAmount", "DateAquired", "SellDate",
				"Quantity", "LongTerm", "SellMethod", "TotalGains"],
			FILENAME: "_RealizedGainLoss.tsv"
		},
		SECURITY: {
			HEADERS: ["OrionFirmId", "ExternalId", "Symbol", "Name", "Price",
				"SecurityType", "AssetCategory", "AssetClass", "SubClass",
				"MaturityDate", "IsCustodialCash"],
			FILENAME: "_Security.tsv"
		},
		TAXLOT: {
			HEADERS: ["OrionFirmId", "ExternalId", "AccountId", "Symbol",
				"AccountNumber", "DateAcquired", "Quantity", "CostAmount",
				"CostPerShare", "Price", "MarketValue", "PriceDate"],
			FILENAME: "_TaxLot.tsv"
		},
		TRANSACTION: {
			HEADERS: ["OrionFirmId", "ExternalId", "AccountId", "AccountNumber",
				"Symbol", "TradeDate", "Quantity", "Amount", "Type", "Action",
				"TradeCost", "EclipseTradeOrderId", "Status"],
			FILENAME: "_Transaction.tsv"
		},
	},
	portfolioType: {
		NORMAL_PORTFOLIO: 'NORMAL_PORTFOLIO',
		SLEEVE_PORTFOLIO: 'SLEEVE_PORTFOLIO',
		SLEEVE_ACCOUNT: 'SLEEVE_ACCOUNT'
	},
	IMPORT: {
		TYPE: {
			FULL: 'Full',
			PARTIAL: 'Partial',
			ACCEPT: 'Accept'
		},
		STATUS: {
			PROGRESS: 'IN_PROGRESS',
			DONE: 'COMPLETED'
		}
	},
	templates: "templates",
	notificationCategoryType: {
		TRADE_GENERATION: "TRADEGEN",
		COMMUNITY_MODEL_UPDATE: "COMMODUPD",
		MODEL_ASSIGNMENT_APPROVAL: "MODASSIGNAPP",
		MODEL_CHANGE_APPROVAL: "MODCHANGAPP",
		DATA_IMPORT: "DATAIMPORT"
	}
};

var securityStatus = applicationEnum.securityStatus;
var reverseSecurityStatus = {};
applicationEnum.reverseSecurityStatus = reverseSecurityStatus;
for (var key in securityStatus) {
	if (securityStatus.hasOwnProperty(key)) {
		reverseSecurityStatus[securityStatus[key]] = key;
	}
}

var buyPriorities = applicationEnum.buyPriorities;
var reverseBuyPriorities = {};
applicationEnum.reverseBuyPriorities = reverseBuyPriorities;

for (var key in buyPriorities) {
	if (buyPriorities.hasOwnProperty(key)) {
		reverseBuyPriorities[buyPriorities[key]] = key;
	}
}

var sellPriorities = applicationEnum.sellPriorities;
var reverseSellPriorities = {};
applicationEnum.reverseSellPriorities = reverseSellPriorities;

for (var key in sellPriorities) {
	if (sellPriorities.hasOwnProperty(key)) {
		reverseSellPriorities[sellPriorities[key]] = key;
	}
}

var securitySetToleranceType = applicationEnum.securitySetToleranceType;
var reverseSecuritySetToleranceType = {};
applicationEnum.reverseSecuritySetToleranceType = reverseSecuritySetToleranceType;

for (var key in securitySetToleranceType) {
	if (securitySetToleranceType.hasOwnProperty(key)) {
		reverseSecuritySetToleranceType[securitySetToleranceType[key]] = key;
	}
}

var modelStatus = applicationEnum.modelStatus;
var reverseModelStaus = {};
applicationEnum.reverseModelStaus = reverseModelStaus;

for (var key in modelStatus) {
	if (modelStatus.hasOwnProperty(key)) {
		reverseModelStaus[modelStatus[key]] = key;
	}
}

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = {};
applicationEnum.reverseRelatedTypeCodeToId = reverseRelatedTypeCodeToId;

for (var key in relatedTypeCodeToId) {
	if (relatedTypeCodeToId.hasOwnProperty(key)) {
		reverseRelatedTypeCodeToId[relatedTypeCodeToId[key]] = key;
	}
}

var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = {};
applicationEnum.reverseRelatedTypeCodeToDisplayName = relatedTypeCodeToDisplayName;

for (var key in relatedTypeCodeToDisplayName) {
	if (relatedTypeCodeToDisplayName.hasOwnProperty(key)) {
		reverseRelatedTypeCodeToDisplayName[relatedTypeCodeToDisplayName[key]] = key;
	}
}

module.exports = applicationEnum;