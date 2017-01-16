"use strict";

var PreferenceDetail = function() {
	    this.id = null;
	    this.preferenceId = null;
	    this.categoryType = null;
	    this.name = null;
	    this.displayName = null;
	    this.required =  null;
	    this.displayOrder = null;
	    this.valueType = null;
	    this.value = null;
	    this.indicatorValue = null;
	    this.isInherited = null;
	    this.inheritedValue = null;
	    this.inheritedIndicatorValue = null;
	    this.inheritedFrom = null;
	    this.inheritedFromName = null;
	    this.inheritedFromId = null;
	    this.inheritedFromValueId = null;
	    this.options = [];
	    this.selectedOptions = [];
	    this.inheritedSelectedOptions = [];
	    this.indicatorOptions = [];
	    this.componentType = null;
        this.componentName = null;
        this.minlength = null;
	    this.maxlength = null;
	    this.minValue = null;
	    this.maxValue = null;
	    this.pattern = null;
	    this.watermarkText = null;
	    this.symbol = null;
	    this.helpText = null;
}

module.exports = PreferenceDetail;