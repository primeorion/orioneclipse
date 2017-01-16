"use strict";

var CommunityStretegistPreference = function() {
    this.level = null;
    this.recordId = null;
    this.id = null;
    this.preferenceId = null;
    this.componentType = null;
    this.componentName = null;
    this.categoryType = null;
    this.name = null;
    this.displayName = null;
    this.required = null;
    this.strategists = {
        strategistIds: null,
        modelAccessLevel: null,
        communityModels: null
    };
    this.isInherited = null;
    this.inheritedValue = null;
    this.inheritedFrom = null;
    this.inheritedFromName = null;
    this.inheritedFromId = null;
    this.inheritedFromValueId = null;
    this.inheritedStrategists = {
        strategistIds: null,
        modelAccessLevel: null,
        communityModels: null
    };
    this.helpText = null;
    this.watermarkText = null;
    this.symbol = null;
}


module.exports = CommunityStretegistPreference;