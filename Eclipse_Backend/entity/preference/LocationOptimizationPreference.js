
"use strict";

var LocationOptimizationPreference = function() {
	this.level = null;
    this.recordId = null;
    this.id = null;
    this.preferenceId = null;
    this.categoryType = null;
    this.name = null;
    this.displayName = null;
    this.required =  null;
    this.displayOrder = null;
    this.minlength = null;
    this.maxlength = null;
    this.minValue = null;
    this.maxValue = null;
    this.pattern = null;
    this.valueType = null;
    this.value = null;
    this.isInherited = null;
    this.inheritedValue = null;
    this.inheritedFrom = null;
    this.inheritedFromName = null;
    this.inheritedFromId = null;
    this.inheritedFromValueId = null;
    this.subClasses = [];
    this.inheritedSubClasses = [];
    this.componentType = null;
    this.componentName = null;
    this.helpText = null;
    this.watermarkText = null;
    this.symbol = null;
}


module.exports = LocationOptimizationPreference;