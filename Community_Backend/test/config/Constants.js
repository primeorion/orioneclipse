"use strict";
exports.Constants = {

   // baseurl: 'http://54.173.63.220:4000/',   //Dev
    //   baseurl:'http://52.90.255.6:4000/',  //QA
    //   baseurl:'http://54.225.10.87:4000/', //HDC 
     baseurl:'http://localhost:4000/', //Local 

    expect: 200,
    timeout: 20000,

    login: {
        api: 'v1/admin/Token',
        input: {
            username: 'primetgi',
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


    // Strategist--------START---------------------------------------------------

    strategists: {
        api: 'v1/community/strategists',
    },
    strategistSimple: {
        api: 'v1/community/strategists/simple'
    },
    strategistStatusList: {
        api: 'v1/community/strategists/master/status'
    },
    strategistUserVerify : {
        api : 'v1/community/strategists/user/verify'
    }, 
    // Strategist--------END-------------------------------------------------------


    // User--------START---------------------------------------------------
    userRoles: {
        api: 'v1/community/users/master/roles',
    },
    loggedInUserRole: {
        api: 'v1/community/users/role'
    },
    // User--------END-------------------------------------------------------

    /**Upload Begins*/
    logoUploadSmall :{
        api : 'v1/community/strategists/13/logo/small'
    },
    logoUploadLarge : {
        api : 'v1/community/strategists/13/logo/large'
    },
    documentUpload :{
        api : 'v1/community/strategists/13/document'
    },
    modelUpload : {
        api : 'v1/community/strategists/13/models'
    }
    /*Upload Ends*/

}