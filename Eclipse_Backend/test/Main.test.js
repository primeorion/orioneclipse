"use strict";

//require('test/common/');

module.exports = {

        userAuthorizationTest: require('./controller/UserAuthorizationTest.js'),
        spendCashTest  :require('./controller/spendCash/SpendCashTest.js'),
        userRoleTest: require('./controller/userManagement/UserRoleTest.js'),
        usersTest : require('./controller/userManagement/UsersTest.js'),
        teamsTest : require('./controller/userManagement/TeamsTest.js'),
        custodianTest : require('./controller/userManagement/CustodianTest.js'),
        preferenceTest : require('./controller/preferences/PreferenceTest.js'),
        inheritedPreferenceTest : require('./controller/preferences/InheritedPreferenceTest.js'),
        securityTest : require('./controller/security/SecurityTest.js'),
        categoriesTest : require('./controller/security/CategoriesTest.js'),
        classesTest : require('./controller/security/ClassesTest.js'),
        subClassesTest : require('./controller/security/SubClassesTest.js'),
        securitySetTest : require('./controller/security/SecuritySetTest.js'),
        portfolioTest : require('./controller/portfolio/PortfolioTest.js'),
        settingsTest : require('./controller/settings/SettingsTest.js'),
        //stategistTest : require('./controller/eclipseCommunity/StrategistTest.js'),
       // modelTest : require('./controller/eclipseCommunity/ModelTest.js'),    
        holdingTest : require('./controller/holding/HoldingTest.js'),    
        logoutTest: require('./controller/LogoutTest.js')
        
};

