"use strict";

//require('test/common/');

module.exports = {

    userAuthorizationTest: require('./controller/UserAuthorizationTest.js'),
    userTest : require('./controller/community/UserTest.js'),
    strategistTest : require('./controller/community/StrategistTest.js'),
    logoutTest: require('./controller/LogoutTest.js')
        //uploadTest: require('./controller/uploads/UploadTest.js')
};

