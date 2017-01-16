"use strict";
var lodash = require("lodash");



module.exports = function () {
    this.importAnalysisSummary = {};
    this.importAnalysisSummary.lastImportedDate = null;
    this.importAnalysisSummary.warnings = null;
    this.importAnalysisSummary.errors = null;
    this.importAnalysisSummary.latestAvailableImport = null;
    this.importAnalysisSummary.isAutoImport = null;
    this.importAnalysisSummary.totalAUM = null;
    this.importAnalysisSummary.changeInAum = null;
    this.importAnalysisSummary.lastImportProcessTime = null;
    this.importAnalysisSummary.priceRange = {};
    this.importAnalysisSummary.priceRange.from = null;
    this.importAnalysisSummary.priceRange.to = null;
    this.warningsSummary = [];

    return lodash.assignIn(this);
}