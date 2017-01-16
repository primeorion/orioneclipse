
/** Business Objects for Trade tools - Spend and raise cash */
import { Injectable, Inject } from '@angular/core';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { TradeToolsService } from '../services/tradetools.service';
import { Observable } from 'rxjs/Rx';
import { ITradeToolCalculationMethods, ICalculationMethod } from '../models/tradetoolcalculation';
import { SpendCashService } from '../services/spendcash.service';

@Injectable()
export class TradeToolsBusinessObjects {
    constructor(private _tradeToolsService: TradeToolsService,
        private _spendCashService: SpendCashService) {

    }

    /** Get Trade tool calculation methods */
    getTradeToolCalculationMethods(toolType: number) {
        switch ("" + toolType) {
            case "" + TradeToolType.SpendCash:
                return this._tradeToolsService.getSpendCashCalculationMethods()
                    .map((response: Response) => <ITradeToolCalculationMethods>response.json());

            case "" + TradeToolType.RaiseCash:
                return this._tradeToolsService.getRaiseCashCalculationMethods()
                    .map((response: Response) => <ITradeToolCalculationMethods>response.json());

        }
    }

    /** To generate trade */
    spendCashGenerateTrade(trade: any) {
        return this._spendCashService.spendCashGenerateTrade(trade)
            .map((response: Response) => <ITradeToolCalculationMethods>response.json());
    }

    /** To get Spend full amount options */
    getSpendFullCashOptions() {
        return this._spendCashService.getSpendFullCashOptions();
    }


    /** Delete cell renderer */
    deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i id =' + params.node.data.id + ' title="Delete" class="fa fa-times red" aria-hidden="true"></i></span>';
        return result;
    }

    /**
     *  CELL RENDERERS BASED ON CELL TYPE
     **/

    /** To render amount cell */
    amountCellRenderer(params, self) {
        let result;
        if (params.data[params.colDef.field] == undefined) {
            result = document.createElement("label");
            return result;
        } else {
            var eInput = document.createElement("input");
            eInput.className = "form-control grid-input";
            eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
            eInput.addEventListener('blur', function (event) {
                params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
            });
            eInput.addEventListener('keypress', function (event) {
                if (event.which == 8 || event.which == 0)
                    return true;
                if (event.which == 46 && eInput.value.indexOf('.') != -1) {
                    event.preventDefault();
                    return false;
                }
                if (event.which <= 47 || event.which >= 59) {
                    if (event.which != 46) {
                        event.preventDefault();
                        return false;
                    }
                }
            });
            return eInput;
        }
    }

    /** To render emphasis cell */
    emphasisCellRenderer(params, self) {
        self.portfolioIdForEmphasis = params.data['id'];
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eSelect = document.createElement("select");

        var eOption = document.createElement("option");
        eOption.setAttribute("value", "0");
        eOption.innerHTML = 'Select';
        eSelect.appendChild(eOption);

        let list = self.modelNodes;
        if (list != undefined && list.length > 0) {
            list.forEach(function (item) {
                if (item.portfolioId == self.portfolioIdForEmphasis) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.subModelName);
                    eOption.innerHTML = 'Level ' + item.level + '( ' + item.subModelName + ' )';
                    eSelect.appendChild(eOption);
                }
            });
        }

        eSelect.value = params.data['subModelId'] == undefined ? "0" : params.data['subModelId'];
        eCell.appendChild(eSelect);
        eSelect.focus();

        eSelect.addEventListener('change', function () {
            var newValue = eSelect.value == undefined ? '' : eSelect.selectedOptions[0].textContent;
            if (newValue != '') self.isNodeNotSelected = false;
            params.data[params.colDef.field] = newValue;
            params.data['subModelId'] = eSelect.value;

            var updatedNodes = [];
            updatedNodes.push(params.node)
            self.spendcashGridOptions.api.refreshRows(updatedNodes);
        });
        return eCell;
    }

    /** To render emphasis cell */
    withEmphasisCellRenderer(params, self) {
        self.portfolioIdForEmphasis = params.data['id'];
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eSelect = document.createElement("select");

        var eOption = document.createElement("option");
        eOption.setAttribute("value", "0");
        eOption.innerHTML = 'Test PreSelected Emphasis';
        eSelect.appendChild(eOption);

        eSelect.value = params.data['subModelId'] == undefined ? "0" : params.data['subModelId'];
        eCell.appendChild(eSelect);
        eSelect.focus();
        return eCell;
    }

}