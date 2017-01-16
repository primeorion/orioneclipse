"use strict";

module.exports = {

    logout: 'You have been successfully logged out',
    userFirmAssociationNotFound: 'User and firm association not found',
    NoPermissionForLoginAs: 'User do not have permission to LoginAs in this firm',
    noRoleTeamAssociate: 'User has no active role and team associated so can not logIn',
    alreadyLogInWithSameFirm: 'User already login with same user in same firm',
    alreadyLogInAs: 'You can not Login As, please revert first and try again',
    notLoggedInAs: 'You are not logged in as another user',
    inactiveUser:'User is not active so can not logIn',
    jsonParserError: 'Invalid Json response, please verify data',
    redisDeleteError: 'Error occurred  in redis Delete operation',
    redisPutError: 'Error occurred  in redis Put operation',
    redisGetError: 'Error occurred  in redis Get operation',
    notLoggedIn: 'You are not logged in anymore',
    invalidHeaders: 'Invalid Authorization Header',
    invalidToken: 'Invalid Token',
    failedToUpdate: 'Failed to update',
    //please change below message to unauthenticated.
    Unauthorized: 'Unauthorized: Access is denied due to invalid credentials',
    unauthorized: 'User do not have permission',
    userDoNotHavePermission:'User do not have any permission',
    accessDenied: 'Access Denied',
    notFound: 'Not Found',
    badRequest: 'Bad Request: Verify request data',
    errorChangeStatus: 'Error in scheduler during change status',
    internalServerError: 'Your request cannot be processed at the moment, please verify parameters',

    //Role Messages
    roleAdded: 'Role created successfully',
    roleUpdated: 'Role updated successfully',
    roleDeleted: 'Role deleted successfully',
    roleNotFoud: 'Role does not exist',
    roleNotFound: 'Role does not exist',
    roleAssigned: 'Role assigned successfully',
    roleAssignedUpdated: 'Role assigned updated successfully',
    roleNotFoudOrDeleted: 'Role does not exist or already deleted',
    roleReassigned: 'Role reassigned successfully',
    roleAlreadyExist: 'Role already exist with same name',
    roleTypeNotFound: 'Role Type does not exist',
    userAssociated: 'Role has user associated with it so can not delete',
    noUserAssociatedWithRole: 'No user associated with role',
    diffRoleType: 'Roles do not have same roleType',

    //Privileges Messages
    privilegesAdded: 'Privileges added successfully',
    missingParameters: 'Missing required parameters',
    privilegeNotFoud: 'Privilege does not exist',
    interServerError: 'Your request cannot be processed at the moment',
    cannotSubscribeWithRole: 'User having this role cannot subscribe the strategist',
    cannotUnsubscribedWithRole: 'User having this role cannot unsubscribe the strategist',
    cannotUpdateEclipseDatabaseId: 'User do not have permission to update/assign eclipse database id',

    //Preferences messages
    preferencesDataNotFound: 'Unable to find records',
    preferencesInvalidParameters: 'Invalid or wrong query parameters',
    preferencesInvalidList: 'Invalid or wrong list passed',
    invalidPreferencePrivileg: 'User does not has privileges.',
    preferenceRecordIdNotExist: 'Invalid record id.',
    preferenceLevelIdNotExist: 'Invalid level id.',
    preferenceLevelNameNotExist: 'Invalid level name.',
    preferenceLevelInvalidBitValue: 'Invalid bit value.',
    preferencesUpdatedSuccess: 'Preferences updated successfully.',
    //firm messages
    firmNotFound: 'Firm does not exist',
    firmAssigned: 'Firm assigned successfully',
    invalidFirm:  'Invalid associated firm',

    //team messages
    teamNotFound: 'Team does not exist',
    teamNotFoudOrDeleted: 'Team does not exist or already deleted',
    teamDeleted: 'Team deleted successfully',
    teamAssigned: 'Team assigned successfully',
    teamAlreadyExist: 'Team already exist with same name',
    userAssignToTeam: 'User assigned to team successfully',
    portfolioAssignToTeam: 'Portfolio assigned to team successfully',
    advisorAssignToTeam: 'Advisor assigned to team successfully',
    modelAssignToTeam: 'Model assigned to team successfully',
    accountAssignToTeam: 'Account assigned to team successfully',
    teamUserAssociated: 'Team has user associated with it so can not delete',
    accountUnAssignFromTeam: 'Account unassociated from team successfully',
    modelUnAssignFromTeam: 'Model unassociated from team successfully',
    advisorUnAssignFromTeam: 'Advisor unassociated from team successfully',
    portfolioUnAssignFromTeam: 'Portfolio unassociated from team successfully',
    userUnAssignFromTeam: 'User unassociated from team successfully',
    advisorAssignToTeamUpdate: 'Advisor assigned to team updated successfully',
    userAssignToTeamUpdate: 'User assigned to team updated successfully',
    modelAssignToTeamUpdate: 'Model assigned to team updated successfully',
    portfolioAssignToTeamUpdate: 'Portfolio assigned to team updated successfully',
    teamReassigned: 'Team reassigned successfully',
    noUserAssociatedWithTeam: 'No user associated with team',
    oldAndNewSameId: 'oldId and newId can not be same',
    primaryPortfolioMissing: 'Team is associated as primary team to missing portfolio Ids',
    teamAssignedAsPrimary: 'Team is associated as primary team to some portfolios so it can not be deleted',

    //user messages
    userNotFound: 'User does not exist',
    userNotFoudOrDeleted: 'User does not exist or already deleted',
    userFirmNotFound: 'Could not find Current User Firm',
    NoPrivilegeAssociated: 'No Privilege Associate with User',
    userDeleted: 'User deleted successfully',
    userPrivilegeNotFound: 'No privilege exist for user',
    userAlreadyExist: 'User already exist with same orionUserId',
    userNotFoundOnConnect: 'User does not exist on Connect',
    someUserNotFoundOnConnect: 'Some of the users does not exist on Connect',
    noPoolFound: 'No Pool for Database',
    userAlreadyAssigned: 'User is already assigned to strategist.',
    userAssigned: 'User is not assigned.',
    usersAlreadyAssigned : 'Users already assigned to strategist or is Super Admin.',
    onlyOneAssignedUser: 'Strategist have only one user. You cannot delete.',
    atleastOneUserRequired: 'Strategist should have atleast one user',
    notSubscribed : 'User is not subscribed',
    atLeastOneStrategistWithUser: 'At least one strategist should be assign to user',
    atleastOneUserWithSuperAdminRole: 'user with role super admin found.',
    duplicateUsersFound: 'Duplicate Users Found.',
    nameNotFound: 'Atleast name or logo should be present.',
    logoNotFound: 'Logo image not found in request form.',

    //Custodian messages
    custodianNotFound: 'Custodian does not exist',
    custodianAlreadyExist: 'Custodian already exist with same externalId',
    duplicateTradeExecution: 'You can not send both tradeExecutionTypeId and tradeExecutions parameter',
    custodianDeleted: 'Custodian deleted successfully',
    custodianNotFoudOrDeleted: 'Custodian does not exist or already deleted',
    accountAssociated: 'Custodian has account associated to it so it can not be deleted',
    tradeExecutionsNotFound: 'Trade executions doesnot exist',

    //Subclass messages
    subClassNameExists: ' SubClass name already exists ',
    importedSubClassUpdateFail: ' Imported SubClass cannot be updated ',
    importedSubClassRemoveFail: ' Imported SubClass cannot be removed ',
    nonExistingSubClassRemoveFail: ' SubClass does not exists ',
    associatedSubClassRemoveFail: ' SubClass cannot be removed as it is associated with security ',
    subClassRemoved: ' SubClass deleted Successfully ',

    // class messages
    classNameExists: ' Class name already exists ',
    importedClassUpdateFail: ' Imported Class cannot be updated ',
    importedClassRemoveFail: ' Imported Class cannot be removed ',
    nonExistingClassRemoveFail: ' Class does not exists ',
    associatedClassRemoveFail: ' Class cannot be removed as it is associated with security ',
    classRemoved: ' Class deleted Successfully ',

    // Category messages
    categoryNameExists: ' Category name already exists ',
    importedCategoryUpdateFail: ' Imported Category cannot be updated ',
    importedCategoryRemoveFail: ' Imported Category cannot be removed ',
    nonExistingCategoryRemoveFail: ' Category does not exists ',
    associatedCategoryRemoveFail: ' Category cannot be removed as it is associated with security ',
    categoryRemoved: ' Category deleted Successfully ',

    // Security messages
    securityExists: ' Security already exists ',
    securityDeleted: 'Security deleted successfully',
    securityNotFoudOrDeleted: 'Security does not exist',
    nonExistingSecurityRemoveFail: ' Security does not exists ',
    securityNotFound: ' Security Not Found ',
    securityCannotBeDeleted : ' Security cannot be deleted as the security is associated with a security set ',
    securityStatusCannotBeUpdated : ' Security status cannot be updated as the security is associated with a security set ',
    securityTypeIdDoesNotExists : 'Security Type associated with security does not exist, Please import that first !',
    securitySymbolDuplicateConstraint : " Security Symbol already exists ",
    custodianForSecurityDoesNotExists : " Custodians you are adding does not exists ",
    custodianSymbolAlreadyExistsForOtherSecurity : "Custodian security symbol you are trying to add already exists with other securities",
        
    // SecuritySet messages
    securitySetDeleted: 'SecuritySet deleted successfully',
    securitySetNotFoudOrDeleted: 'SecuritySet does not exist or already deleted',
    securitySetNotFound: ' Security Set Not Found ',
    securitySetSecurityCannotBeAddedBecauseTheyAreDeleted: ' Securities which are being added in security set does not exists or have status other than OPEN',
    securitySetSecurityCannotBeAddedBecauseOfStatus: ' Securities which are being added in security set does not exists or have status other than OPEN  ',

    // Data import process messages
    dataImportServerError: ' Unable to notify import process, please contact administrator. ',
    importSucessfull: ' Successfully notified data import startup process. ',

    // DB Error
    badFieldError: 'Unknown column',
    parseError: 'Systex error',
    noSuchTable: 'Table or Database Not Found',
    rowIsReferenced: 'foreign key constraint fails',
    tooLongIdent: 'Identifier name is too long',
    dupEntry: 'Duplicate entry',
    dupUnique: 'Unique constraint',
    requiresPrimaryKey: 'This table type requires a primary key',
    //Model messages
    modelNotFound: 'Model does not exist',
    modelNotSubscribedAgainstStrategist : 'Model is not subscribed by this user',
    invalidModelStatus : 'Invalid model status',
    modelNotSubscribed : 'Model is not subscribed',

    //Portfolio messages
    portfolioNotFound: 'Portfolio does not exist',
    PortfolioNotFoundOrDeleted: 'Portfolio does not exist or already deleted',
    portfolioAlreadyExist: 'Portfolio already exist with same name',
    portfoiloNotAssignedWithAccounts:'Portfolio is not assigned with accounts',
    portfoiloAssignedToAccounts:'Portfolio assigned to accounts successfully',
    portfoiloUnAssignedFromAccounts:'Portfolio unassigned from all accounts successfully',
    portfoiloNotUnAssignedFromAccounts:'Failed to unassign Portfolio from accounts or No accounts are assigned with this portfolio',
    portfoiloUnAssignedFromAccount:'Portfolio unassigned from account successfully',
    portfoiloNotUnAssignedFromAccount:'Failed to unassign Portfolio from account or this portfolio is not assigned to this account',
    portfoiloDeleted:'Portfolio deleted successfully',
    portfolioAccountAssociated:'Portfolio has associated with account so can not delete',
    primaryTeamIdNotFound:'PrimaryTeamId does not exists in teamIds list',
    portfolioNotCreated :'Failed to Created',
    //Advisor messages
    advisorNotFound: 'Advisor does not exist',

    //strategist messages
    strategistNotFound: 'Strategist does not exist.',
    strategistNoRecord: 'No Record Found.',
    strategistDeleted: 'Strategist is deleted successfully',
    strategistFound: 'A record with Strategist id found.',
    modelFound: 'A record with model id found.',    
    atleastOneUserWithAdminRole:'At least one user of role admin should be assigned to strategist.',
    cannotDeleteUser : 'Cannot delete this user as this is the only admin assigned to strategist.',
    strategistEmailIdAlreadyExist : 'A strategist with same email address already exist',
    strategistPhoneAlreadyExist : 'A strategist with same phone no already exist.',
    missingMandatoryFields : 'Cannot assign approved status, mandatory fields are missing',
    strategistAlreadySubscribed : 'Strategist is already subscribed by user',
    strategistUnsubscribedSuccessfully : 'Strategist is unsubscribe successfully',
    strategistIdNotANumber : 'Strategist id not a number.',

    //Community Model
    communityModelNotFound: 'Model does not exist.',
    communityNoRecord: 'No Record Found.',
    communityModelAlreadyExist: 'Model already exist with same name.',
    communityModelDeleted: 'Model deleted successfully.',
    communityModelNotFoudOrDeleted: 'Model does not exist or already deleted.',
    securityNoRecord: 'No Record Found.',
    communitysecurityNotFound: 'Security does not exist.',
    invalidTemplate : 'Invalid template',
    missingModelTemplateHeaders : 'missing headers',
    invalidModelTemplateFormat:'Invalid Template. Pease make sure you are using correct template.',
    
    //Account
    accountNoRecord:'No Record Found.',
    accountNotFound:'Account does not exist.',
    rebalanceError: 'Rebalance request not processed succesfully',
    rebalanceSuccessful: 'Rebalance processed successfully',

    //Views
    viewNotFound: 'View does not exist',
    viewTypeNotFound: 'View Type does not exist',
    viewNotUpdated: 'Failed to update View',
    viewNotCreated: 'Failed to create new View',
    viewDeleted : 'View deleted successfully',
    viewAlreadyExist: 'View already exists with same name',
    viewAccessDenied: 'You do not have permission to delete this view',
	
   //Holding
    holdingNotFound:'Holding does not exist',

    //File-Upload
    logoUploaded : 'Logo successfully uploaded.',
    logoUploadFailed: 'Failed to upload logo',

    documentUploded:'Document successfully uploaded.',
    documentUplodFailed : "Failed to upload document.",

    modelUploaded:'Model successfully uploaded.',
    modelUploadFailed: 'Failed to upload model.',
    modelImport: 'Model successfully imported.',
    modelImportFailed:'Failed to import model.',
    invalidModelTemplate : 'Failed to parse data, Invalid template content.',
    emptyModel :"There was no data in the uploaded template.",
    abortOnMissingColumns : "Failed to parse model due to missing column / header in uploaded file.",
    nonExistingModel : "Model does not exists.",
    modelUpdated: 'Model successfully updated.',
    
    invalidDocumentType:'File type is not supported. Only PDF files allowed.',
    invalidModelType:'File type is not sported. Only XLS and XLSX files allowed.',
    invalidLogoType:'File type is not supported. Only Images allowed.',

    invalidDocumentSize  :"File is too large, we currently support 1 MB files only.", //todo
    invalidModelSize  :"File is too large, we currently support 1 MB files only.", //todo
    invalidLogoSize  :"File is too large, we currently support 1 MB files only.",

    fileNotFound:'The file you specified, is not found.',
    fileDataNotFound : 'File is not present in request. or request is not multipart/formdata.',
    invalidFileAttributeName : 'Invalid name specified for input type file.',

    duplicateDocumentName:'Duplicate document name found.',
    duplicateModelName:'Duplicate model name.',
    documentNameNotFound : 'Document name not found in request.',
    documentIdMissing : 'Missing value for parameter documentId in request.',
    documentNotInDb : 'Document not found in db.',
    documentAlreadyExists : 'Document with this name already exists.',
    documentAlreadyDeleted : 'Document already deleted',
    documentDeleted : 'Document successfully deleted.',
    nonExistingDocument : 'Document does not exists.',
    //Community Dashboard
    type : 'Type must be a parameter',
    typeCheck: 'Type parameter is not valid',
    typeQueryParamNotFound : 'Missing parameter {type}',
    typeQueryParamInvalid : 'Invalid value for parameter {type}',

    //aws messages upload/download
    urlSignatureCreationFailed : 'Failed to created signed resource. Please retry later.',

    //query params    
    missingQueryParams : 'Missing query parameter ',
    missingQueryParamsValue : 'Query parameter value not specified.',
    invalidQueryParamValue : 'Numbers as parameter values is not allowed.',

    //model commentry
    duplicateModelCommentary : 'Model commentary already exists.',
    modelCommentaryAdded : 'Model commentary successfully added.',
    emptyCommentary : 'Commentary content missing',
    emptyModelId : 'Missing or Invalid Model Id',
    modelCommentaryUpdated : 'Model commentary succesfully updated.',
    modelCommentaryDeleted : 'Model commentary successfully deleted',
    modelCommentaryAlreadyDeleted : 'Model commentary already deleted.',

    modelPerformanceDeleted : 'Model performance successfully deleted',
    modelPerformanceAlreadyDeleted : 'Model performance already deleted.',

    //model advertisement
    duplicateModelAdvertisement : 'Model advertisement already exists.',
    modelAdvertisementAdded : 'Model advertisement successfully added.',
    emptyAdvertisement : 'advertisement content missing',
    modelAdvertisementUpdated : 'Model advertisement succesfully updated.',
    modelAdvertisementDeleted : 'Model advertisement successfully deleted',
    modelAdvertisementAlreadyDeleted : 'Model advertisement already deleted.',
    nonExistingModelOrPerformance : 'Model or Performance for specified Model does not exists.',

    userListCannotBeEmpty: 'User Array cannot be empty.'
};

