"use strict";
exports.Constants = {

    baseurl: 'http://34.192.23.30:3000/',   //Dev
    //   baseurl:'http://54.88.201.4:3000/',  //QA
    //baseurl: 'http://54.225.10.87:3000/', //HDC 
    //  baseurl:'http://localhost:3000/', //Local 

    expect: 200,
    timeout: 20000,
    // Authorization---------START----------------------------

    login: {
        api: 'v1/admin/Token',
        input: {
            username: 'primetgi_salesmain',
            password: 'primetgi22!'
        },
        type: '/json/',
    },
    user: {
        api: 'v1/admin/authorization/user',
    },
    logout: {
        api: 'v1/admin/logout',
    },
    loginAs: {
        api: 'v1/admin/token/loginas',
        input: {
            "userId": 1,
            "firmId": 477
        }
    },
    loginAsRevert: {
        api: 'v1/admin/token/loginas/revert'
    },

    // Authorization---------END-----------------------------
    // Roles---------START-----------------------------------
    Roles: {
        api: 'v1/admin/Roles',
    },
    roleType: {
        api: 'v1/admin/Roles/roleType',
        roleTypeNotFound: 'v1/admin/Roles?roleType=qqq',
    },
    onRoleType: {
        api: 'v1/admin/Roles?roleType=USER',
    },
    searchRole: {
        api: 'v1/admin/Roles?search=',
        searchRoleNotFound: 'v1/admin/Roles?search=ff',
    },
    reAssignRole: {
        api: 'v1/admin/Roles/Action/ReassignRole',
        input: {
            "oldId": 167,
            "newId": 168
        }
    },

    // Roles---------END-------------------------------------

    // Users--------START------------------------------------

    Users: {
        api: 'v1/admin/Users',
        userId: 66
    },

    assignTeam: {
        api: 'v1/admin/Users/66/Teams/1',
        assignTeamToUserNotFound: 'v1/admin/Users/99999999/Teams/1'
    },
    assignRole: {
        api: 'v1/admin/Users/66/Roles/168',
        assignRoleToUserNotFound: 'v1/admin/Users/999999/Roles/1'
    },
    userPrivileges: {
        api: 'v1/admin/Users/66/privileges',
        userPrivilegesNotFound: 'v1/admin/Users/999999999/privileges'
    },
    searchUser: {
        api: 'v1/admin/Users?search=john',
        searchUserNotFound: 'v1/admin/Users?search=madan'
    },
    deleteUser: {
        api: 'v1/admin/users/1431131',
        deleteUserNotFound: 'v1/admin/users/9999999'
    },
    // Users--------END------------------------------------

    // Teams--------START----------------------------------

    Teams: {
        api: 'v1/admin/Teams'
    },
    searchTeam: {
        api: 'v1/admin/Teams?Search=',
    },
    // Teams--------END------------------------------------
    // Preferences--------START----------------------------

    preferenceSummary: {
        api: 'v1/preference/summary',
    },
    levels: {
        api: 'v1/preference/levels',
    },
    preference: {
        api: 'v1/preference',
    },
    preferenceCategories: {
        api: 'v1/preference',
    },
    preferenceMaster: {
        api: 'v1/preference/master',
    },
    levelById: {
        api: 'v1/preference/level',
    },
    bitValue: {
        api: 'v1/preference/record',
    },
    communityStrategistSetting: {
        api: 'v1/preference/communityStrategist',
    },
    locationOptimization: {
        api: 'v1/preference/locationOptimization',
    },
    massUpdate: {
        api: 'v1/preference/Action/massUpdateAll',
    },
    // Preferences--------END-------------------------------------------------------

    // Custodian--------START-------------------------------------------------------
    Allcustodians: {
        api: 'v1/admin/custodians'
    },
    custodianSearch: {
        api: 'v1/admin/custodians?Search='
    },
    // Custodian--------END--------------------------------------------------------

    // security--------START-------------------------------------------------------
    securities: {
        api: 'v1/security/securities'
    },
    orionSecuritiesSearch: {
        api: 'v1/security/securities/orion?search=APPL'
    },
    eclipseSecuritiesSearch: {
        api: 'v1/security/securities?search=APPL'
    },
    securityType: {
        api: 'v1/security/securities/securitytype'
    },
    securityStatus: {
        api: 'v1/security/securities/securitystatus'
    },
    securitiesAssetweightings: {
        api: 'v1/security/securities/assetweightings'
    },

    // security--------END--------------------------------------------------------

    // categories--------START----------------------------------------------------
    categories: {
        api: 'v1/security/categories'
    },
    assetCategory: {
        api: 'v1/security/securities?assetCategoryId='
    },
    // categories--------END------------------------------------------------------
    // classes--------START-------------------------------------------------------
    classes: {
        api: 'v1/security/classes'
    },
    assetClass: {
        api: 'v1/security/securities?assetClassId='
    },
    // classes--------END-------------------------------------------------------
    // classes--------START-----------------------------------------------------
    subClasses: {
        api: 'v1/security/subclasses'
    },
    assetSubClass: {
        api: 'v1/security/securities?assetSubClassId='
    },
    // classes--------END-------------------------------------------------------
    // classes--------START-----------------------------------------------------
    securitySets: {
        api: 'v1/security/securityset'
    },
    buyPriorities: {
        api: 'v1/security/securityset/buypriority'
    },
    sellPriority: {
        api: 'v1/security/securityset/sellpriority'
    },
    // classes--------END-------------------------------------------------------
    // Portfolios--------START---------------------------------------------------

    portfolios: {
        api: 'v1/portfolio/portfolios',

        assignAccounts: {
            "accountIds": [
                1,
                2
            ]
        }
    },
    portfoliosSimple: {
        api: 'v1/portfolio/portfolios/simple'
    },
    portfoliosSimpleSearch: {
        api: 'v1/portfolio/portfolios/simple?search='
    },
    portfoliosStatus: {
        api: 'v1/portfolio/portfolios/portfolioFilters'
    },

    portfoliosSearch: {
        api: 'v1/portfolio/portfolios?search=1'
    },
    // Portfolio--------END-------------------------------------------------------

    // settings--------START-------------------------------------------------------

    allViews: {
        api: 'v1/settings/views/',
    },
    viewType: {
        api: 'v1/settings/views?type=',
    },
    // settings--------END-------------------------------------------------------

    // EclipseCommunity --------START-------------------------------------------------------

    strategists: {
        api: 'v1/community/strategists',
    },
    models: {
        api: 'v1/community/models?strategistId=1,2',
    },
    approvedModels: {
        api: 'v1/community/models/approved?strategistId=1',
    },

    // EclipseCommunity--------END-------------------------------------------------------

    // Holding --------START-------------------------------------------------------

    holdingDashBoardSummmayByPortfolioId: {
        api: 'v1/dashboard/portfolio/1/holdings/summary',
    },
    holdingDashBoardSummmayByAccountId: {
        api: 'v1/dashboard/account/1/holdings/summary',
    },
    holdings: {
        api: 'v1/holding/holdings',
    },
    holdingfilters: {
        api: 'v1/holding/holdings/holdingfilters',
    },
    portfoliosHoldings: {
        api: 'v1/portfolio/portfolios/1/holdings',
    },
    accountHoldings: {
        api: 'v1/account/accounts/1/holdings',
    },
    accounTransactions: {
        api: 'v1/holding/holdings/1/transactions',
    },
    holdingsFilter: {
        api: 'v1/portfolio/portfolios/1/holdings?filter=excluded',
    },
    taxlots: {
        api: 'v1/holding/holdings/1/taxlots',
    },
    holdingsSearch: {
        api: 'v1/holding/holdings?search=1',
    },


    // Holding--------END-------------------------------------------------------

    // Accounts--------START------------------------------------------------------
    asideCashAmountType: {
        api: 'v1/account/accounts/asideCashAmountType',
    },
    asideCashExpirationType: {
        api: 'v1/account/accounts/asideCashExpirationType ',
    },
    asideCashTransactionType: {
        api: 'v1/account/accounts/asideCashTransactionType',
    },
    // Accounts--------END-------------------------------------------------------
    
 // SpendCash--------START------------------------------------------------------
    spendCashMethodsList:{
    	api:'v1/tradetool/spendcash/calculation_methods',
    },
    spendCashGenerateTrade:{
    	api:'v1/tradetool/spendcash/action/generatetrade',
    },
    nodesFromModel:{
    	api:'v1/portfolio/portfolios/1/model/nodes'	,	//v1/portfolio/portfolios/{portfolioId}/Model/nodes
    },
    contributionamount:{
    	api:'v1/portfolio/portfolios/2/contributionamount'
    },
    sleeveaccount :{
    	api:'v1/account/accounts/simple?inSleeve=true&search=1'
    },
    SleevePortfolios:{
    	api:'v1/portfolio/portfolios/simple?inSleeve=true&search=2'
    },
    
 // SpendCash--------END------------------------------------------------------
    
}