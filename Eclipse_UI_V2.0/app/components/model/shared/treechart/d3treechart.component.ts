import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { ModelService } from '../../../../services/model.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { ISubModel, ISubModelSecurityAssetType, IcreateNewModel, ISecurityAsset, IModel, CreateTree, IModelDetailSave, IModelDetailChildernSave, subModelDetail, IModelStructureSaveUpdate, ICollectionSubModelTypes, IModelAdd } from '../../../../models/modeling/model';
import { IModelCreate, ISubModels } from '../../../../models/modeling/modelcreate';
import { ISecuritySet } from '../../../../models/securitySet';
import { SecuritySetService } from '../../../../services/securityset.service';
import { SessionHelper } from '../../../../core/session.helper';
import { convertEnumValuesToString } from '../../../../core/functions';
import { SubModelTypeEnum } from '../../../../libs/subModel.enums';
import * as Util from '../../../../core/functions';
import { TreeStructure } from '../../../../services/tree_data';
import * as d3 from 'd3';
declare var $: JQueryStatic;
import { GridOptions, ColDef } from 'ag-grid/main';
import { IModelDetails } from '../../../../models/modeling/modeldetails';
import { AgRendererComponent } from 'ag-grid-ng2/main';
import { AgEditorComponent } from 'ag-grid-ng2/main';
import { FormsModule } from "@angular/forms"
import { Observable } from 'rxjs/Rx';
import { SecurityService } from '../../../../services/security.service';
import { ICategory } from '../../../../models/category';
import { IClass } from '../../../../models/class';
import { ISubClass } from '../../../../models/subClass';
import { ICopyModel } from '../../../../models/modeling/copymodel';
@Component({
    selector: 'd3treechart',
    templateUrl: './app/components/model/shared/treechart/d3treechart.component.html',
    providers: [ModelService, SecuritySetService, SecurityService]
})

export class D3TreeChartComponent extends BaseComponent {
    @Output() saveTreeDataChange = new EventEmitter();
    @Output() modelData = new EventEmitter();
    @Output() isUpdateData = new EventEmitter();
    @Output() subModelCollectionEvent = new EventEmitter();
    @Output() postTreeChartData = new EventEmitter();
    @Input() ModelId: number;
    @Input() displayMode: string;
    @Input() copiedModelName: string;
    @Input() copiedSubModelName: string;
    @Input() modelStatus: string;
    modelInfo: any;
    btnDisableSubModel: boolean = true;
    displaySubModel: boolean = false;
    modelNodeslst: ISubModel[] = [];
    filterSubModel: string;
    submodellst: ISubModel[] = [];
    createNewModel: boolean;
    modelTypeListEnum: any;
    submodelList: ISubModels[] = [];
    strategistValidation: boolean;
    communityValidation: boolean;
    secuirtySubModelList: any[];
    selectedSubModel: string = "Select Sub-Model Type";
    selectedAsset: number = 0;
    subModelValidation: boolean;
    AssetValidation: boolean;
    subModelNameValidation: boolean;
    nameSpaceValidation: boolean;
    subModelName: string;
    modelNamespace: string;
    modelId: number;
    subbModelTypeidSelected: number;
    subModeltypeFavorites: boolean = false;
    private _submodeldata: IcreateNewModel;
    /** Creating  */
    TreeDefaultData: any;
    plotTree: any;
    displayReassign: boolean;
    displaySecurities: boolean;
    hoveringViewMode: boolean;
    substituted: boolean;
    InfoPopup: boolean;
    copyModel: boolean;
    @Input() droppedElement: any;
    viewmodelName: string;
    toleranceTypePer: number;
    //ag-grid variables
    private SubModelColumnDefs: ColDef[];
    private modelGridOptions: GridOptions;
    //   createTreeSubModel: IModel;
    @Input() CreateTreeEdit: CreateTree;
    submodelDetailslst: IModelDetails[] = [];
    toleranceTypeValue: number = 1;
    isDisabledToleranceTypePer: boolean = true;
    toleranceTotal: number;
    toleranceTypeModelNamespaceValid: boolean = true;
    subModelDetailObj: any;
    showSaveToDraftPopup: boolean = false;
    deleteNodeModel: boolean = false;
    deleteNodeSubModel: boolean = false;
    updateOnDoubleClick: boolean = false;
    @Input() saveTreeData: IModelDetailSave;
    @Input() getPortfolioId: number = 0;
    securitySetData: ISecuritySet;
    doubleClickedNode: string;
    disablingAttributesInPopUp: boolean = false;
    isUpdateStructure: boolean = false
    modelNodeName: string = "";
    submodelNameslst: any[] = [];
    gridNodemodel: IModelDetails;
    selectedgridNode: string = "";
    @Input() submodelcollection: ICollectionSubModelTypes[] = [];
    SubModelTypeEnumList: any[] = [];
    childNodeData: any[] = []
    hoveredParentName: string = '';
    canDeleteModel: any;
    canDeleteSubModel: any;
    timestampIncrement: number = 1;
    subModelId: any;
    selectedId: any;
    modelName: any;
    isvalid: boolean = false;
    portfolioIdFromView: number;
    nodeSelectedId: any = 0;
    substitudeIdFromView: any;
    contextMenuItems: any[] = []
    isparentNodeSubstituted: boolean = false;
    selectedDomNodeId: any;
    substitutedNode: any = {};
    subModelsList: any;
    substituteModelName: number = 0;
    isSubstituted: boolean = false;
    substitutedModelId: number;
    @Input() isDisableEdit: boolean = false;
    securitySetDetails: any = {};
    securitySetSecurities: any = {};
    securitySetHover: boolean = false;
    securitySetAssestid: any[] = [];
    linkedAssetClass: any = [];
    setParentId: any = [];
    nameSpace: any;
    isreadonlyName: boolean = true;
    isreadonlyNameSpace: boolean = true;
    parentNodeSelected: boolean = false;
    nodeType: string;
    user: any;
    submodelId: any;
    isSecuritySet: boolean = false;
    portfolioPending: boolean = false;
    isApprovedTab: boolean = true;
    deleteSubModelIdByModelTypeId: number = 1;
    IsDynamicDisplay: boolean = false;
    copySubModel: boolean = false;
    isSleeved: boolean = false;
    copySubModelData: any = {};
    errorMessage: string = "";
    securitySetNamesArr = [];
    SubModelChildernsValidation: boolean = false
    removedNodes:boolean = false;
    @Input() isChangeDetectionRef: boolean;
    constructor(private _modelService: ModelService, private activateRoute: ActivatedRoute,
        private _router: Router, private _securitySetService: SecuritySetService, public _securityService: SecurityService) {
        super();
        this.timestampIncrement = 1;
        this.CreateTreeEdit = <CreateTree>{
            name: null,
            id: null,
            parent: null,
            modelDetailId: null,
            modelType: "Parent Node",
            nodeName: null,
            targetPercent: null,
            lowerModelTolerancePercent: null,
            upperModelTolerancePercent: null,
            children: [],
            values: [],
            submodelDataLsit: [],
            submodelTypes: [],
            selectedsubmodelType: null,
            substitutedStyle: "row-panel",
            isSubstituted: null,
            substitutedOf: null
        }
        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        // this.activateRoute.params.subscribe(params => {
        //     if (params['nid'] != undefined) this.substitudeIdFromView = +params['nid'];
        // });
        this.substitudeIdFromView = (Util.getRouteParam<number>(activateRoute, 'nid'));
        this.substitutedModelId = (Util.getRouteParam<number>(activateRoute, 'nsubstituteid'));
        if (this.substitutedModelId) {
            this.modelId = this.substitutedModelId;
        }
        let sessionHelper = new SessionHelper();

        this.user = sessionHelper.getUser();
        if (this.user.teams.length != 0) {
            this.modelNamespace = this.user.teams[0].name;
            this.nameSpace = this.user.teams[0].name;
        }
        else {
            this.modelNamespace = null;
            this.nameSpace = null;
        }

        /*Tree Chart D3 */
        this.TreeDefaultData = new TreeStructure();
        this.modelTypeListEnum = SubModelTypeEnum;
    }
    ngOnInit() {
        this.modelGridOptions = <GridOptions>{};
        this.createSubmodelCollection(this.modelId);
        this.catchingMouseRightClickEvent(this.TreeDefaultData)
        this.CatchingTheSelectionActionOnContextMenu();

        if (this.displayMode != "viewMode" && this.displayMode != undefined) {

            this.contextMenuItems.push(
                { Id: 1, name: "Add" },
                { Id: 2, name: "Delete" },
                { Id: 3, name: "Remove" });
        }
        else {
            this.contextMenuItems = [];
            if (this.isApprovedTab) {
                this.contextMenuItems.push(
                    { Id: 3, name: "Copy" }
                );

            }
            else {
                this.contextMenuItems.push(
                    { Id: 3, name: "Copy" }
                );
            }
        }
    }
    preparingDataForSave(data, saveData, substitudeFlag) {
        let that = this, id, name, isSubstituted, substitutedOf;
        data.forEach((element, key) => {
            if (substitudeFlag) {
                id = (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.id : element.name;
                name = element.nodeName
            }
            else {
                id = (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.id : element.id;
                name = element.name
            }
            if (that.substitudeIdFromView == element.id) {
                isSubstituted = true;
                substitutedOf = that.substitutedNode.id;
            }
            else {
                isSubstituted = null;
                substitutedOf = null;
            }

            let saveTreeChildren = <IModelDetailChildernSave>{
                id: id,
                name: name,
                modelDetailId: element.modelDetailId,
                modelTypeId: element.modelTypeId,
                targetPercent: element.targetPercent,
                lowerModelTolerancePercent: element.lowerModelTolerancePercent,
                upperModelTolerancePercent: element.upperModelTolerancePercent,
                toleranceTypeValue: element.toleranceTypeValue,
                lowerModelToleranceAmount: element.lowerModelToleranceAmount,
                upperModelToleranceAmount: element.upperModelToleranceAmount,
                lowerTradeTolerancePercent: element.lowerTradeTolerancePercent,
                upperTradeTolerancePercent: element.upperTradeTolerancePercent,
                rank: element.rank,
                isEdited: null,
                isSubstituted: isSubstituted,
                substitutedOf: substitutedOf,
                children: []
            }
            saveData[key] = saveTreeChildren
            if (element.children != undefined) {
                that.preparingDataForSave(element.children, saveData[key].children, substitudeFlag);
            }
        })

    }

    AddingExtraIdAttributeInSaveFormat(data, saveData) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            if (saveData[key] != undefined) {
                if (saveData[key]["timestampId"] == undefined)
                    saveData[key]["timestampId"] = element.id;
            }
            if (element.children != undefined) {
                that.AddingExtraIdAttributeInSaveFormat(element.children, saveData[key].children);
            }
        });
    }

    parsingDataIntoRequiredFormat(modelInformation) {
        this.modelNodeName = (modelInformation.modelDetail != null) ? modelInformation.modelDetail.name : modelInformation.name
        let modelDetailId = (modelInformation.modelDetail != null) ? modelInformation.modelDetail.modelDetailId : null;
        this.CreateTreeEdit = <CreateTree>{
            name: modelInformation.id,
            id: this.timestampIncrement++,
            parent: null,
            modelDetailId: modelDetailId,
            modelType: "Parent Node",
            nodeName: (modelInformation.modelDetail != null) ? modelInformation.modelDetail.name : modelInformation.name,
            targetPercent: null,
            lowerModelTolerancePercent: null,
            upperModelTolerancePercent: null,
            children: [],
            values: [],
            submodelDataLsit: [],
            submodelTypes: [],
            selectedsubmodelType: null,
            substitutedStyle: "row-panel",
            isSubstituted: null,
            substitutedOf: null
        }
        if (modelInformation.modelDetail != null) {
            this.CreateTreeEdit.children = modelInformation.modelDetail.children;

        }
        this.SwappingNameAndIdInData(this.CreateTreeEdit);
        this.bindDataToGrid(this.CreateTreeEdit.children);
        this.AddingParentAttributeInData(this.CreateTreeEdit);
        this.ArrangingValuesToPlotPie(this.CreateTreeEdit);
    }
    SwappingNameAndIdInData(data) {
        let that = this;
        if (data.children != undefined) {
            data.children.forEach(element => {
                element.nodeName = element.name;
                element.name = (' ' + element.id).slice(1);
                element.id = that.timestampIncrement++;
                if (element.children != undefined) {
                    that.SwappingNameAndIdInData(element);
                }
            })
        }
    }


    AddingParentAttributeInData(data) {
        let that = this;
        let parent = data.name;
        let nodeName = data.nodeName;
        data.children.forEach(elementModelDetails => {
            elementModelDetails.parent = parent;
            if (elementModelDetails.children != undefined) {
                that.AddingParentAttributeInData(elementModelDetails)
            }
        });
    }


    ArrangingValuesToPlotPie(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.children != undefined) {
                let values = [];
                if (element.children.length == 0) {
                    if (element.targetPercent != null)
                        values.push({ "value": element.targetPercent });
                    else
                        values.push({ "value": 100 });
                }
                else {
                    element.children.forEach(childValues => {
                        if (childValues.targetPercent == null) {
                            if (element.targetPercent == null || element.targetPercent == undefined) {
                                childValues.targetPercent = 100;
                            }
                            else
                                childValues.targetPercent = element.targetPercent;
                        }
                        values.push({ "label": childValues.nodeName, "value": childValues.targetPercent });
                    })
                }

                element.values = values;
                that.ArrangingValuesToPlotPie(element.children);
            }
        })
    }


    addingSubstitutedFlagInData(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (+element.id == +that.substitudeIdFromView) {
                element["isSubstituted"] = true;
                element['substituteOf'] = that.substitudeIdFromView;
                if (element.children != undefined) {
                    that.addingSubstituteFlagInChildren(element.children);
                }
            }
            if (element.children != undefined) {
                that.addingSubstitutedFlagInData(element.children);
            }

        })
    }

    addingSubstituteFlagInChildren(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach(element => {
            element['isSubstituted'] = true;
            if (element.children != undefined) {
                that.addingSubstituteFlagInChildren(element.children);
            }
        })
    }
    /*
    * Function used to catch the drag events On html elements and calls the respective functions
    * in order to attach the respective html element as a node of the tree
    */

    dragAndDropForHtml(dataStructure) {
        let that = this, draggedElement;
        $('body').on('dragstart', '.drag_list', <any>function (evt) {
            draggedElement = this;
            // if ($(draggedElement).hasClass("active")) {
            //     $(draggedElement).removeClass("active");
            //     $(draggedElement).addClass("drag-elm");
            // }
            evt.originalEvent.dataTransfer.setData('text', this.id);
            if (that.substitudeIdFromView) {
                that.hidingTheCirclesOnSubstitute();
            }
            else {
                d3.selectAll(".ghostCircle").style("display", "block");
            }
            dataStructure.dragElementType = $(this).attr("type");
            dataStructure.elemId = $(this).attr("name");
            dataStructure.dragElement = $(this).text();
            that.ChangingColorsForCirclesBasedOnDraggedElement(dataStructure.dragElementType);
        })

        $('body').on("dragend", function () {
            that.HidingCirclesAfterDrag();
            // if ($(draggedElement).hasClass("drag-elm")) {
            //     $(draggedElement).removeClass("drag-elm");
            //     $(draggedElement).addClass("active");
            // }

        })

        $('.node_tree').bind('dragover', function (evt) {
            evt.preventDefault();
        })
            .bind('dragenter', function (evt) {
                evt.preventDefault();
            })
            .bind('drop', <any>function (evt) {
                that.disablingAttributesInPopUp = false;
                if (dataStructure.dragElement != '') {
                    if (evt.toElement.nodeName == "circle") {
                        dataStructure.DroppedDataId = $(evt.toElement.parentNode).attr("id")
                        dataStructure.dropElement = evt.toElement.parentNode.textContent;
                    }
                    else if (evt.toElement.nodeName == "text") {
                        dataStructure.DroppedDataId = $(evt.toElement.parentNode).attr("id")
                        dataStructure.dropElement = evt.toElement.textContent;
                    }
                    else if (evt.toElement.nodeName == "path") {
                        dataStructure.DroppedDataId = $(evt.toElement.parentElement.parentNode).attr("id");
                        $(evt.toElement.parentElement.parentNode.childNodes).each(function () {
                            if ($(this).prop('tagName') == "text") {
                                dataStructure.dropElement = $(this).text();
                                that.TreeDefaultData.droppedElementType = $(this).attr("type");
                            }
                        })
                    }
                    else {
                        dataStructure.dropElement = null;
                    }
                    if (dataStructure.dropElement != null) {
                        that.TreeDefaultData.popupData = [];
                        let childNames = [], duplicateChilds: boolean = false;
                        that.nodeType = that.TreeDefaultData.droppedElementType;
                        that.TreeDefaultData.timestampId = dataStructure.DroppedDataId;
                        that.checkingTheNodesAreCollapsedOrExpanded(dataStructure.root);
                        that.gettingDroppedElementData(dataStructure.root, dataStructure.DroppedDataId);
                        that.findingAvailableChildrenToShowInPopup(dataStructure.dropElement, dataStructure.root);
                        that.subModelId = that.TreeDefaultData.DroppedData.name;
                        that.TreeDefaultData.popupData.forEach(element => {
                            childNames.push(element.nodeName.replace(/\s+/g, ''));
                        });
                        childNames.push(that.TreeDefaultData.dropElement.replace(/\s+/g, ''));
                        if (childNames.indexOf(that.TreeDefaultData.dragElement.replace(/\s+/g, '')) != -1) {
                            duplicateChilds = true;
                        }
                        if (evt.toElement.nodeName != "path") {
                            that.TreeDefaultData.droppedElementType = evt.target.attributes["type"].value;
                        }
                        let AttachNode = that.CheckingNodeToBeAddesForValidation(that.TreeDefaultData.droppedElementType, that.TreeDefaultData.dragElementType);
                        if (!duplicateChilds && AttachNode) {
                            if (that.TreeDefaultData.dragElementType == "SECURITY_SET" || that.TreeDefaultData.dragElementType == "Security Set") {
                                let availableSecurities = [], attachSecuritySet: boolean = true;
                                that.linkedAssetClass = [];
                                that.checkingValidationForAssetClassLinkage(that.TreeDefaultData.root, dataStructure.DroppedDataId);
                                if (that.linkedAssetClass.length != 0) {
                                    let params = {
                                        assetCategoryId: null,
                                        assetClassId: null,
                                        assetSubClassId: null
                                    };
                                    that.linkedAssetClass.forEach(elementAssestId => {
                                        switch (elementAssestId.type) {
                                            case 1:
                                                params.assetCategoryId = elementAssestId.id;
                                                break;
                                            case 2:
                                                params.assetClassId = elementAssestId.id;
                                                break;
                                            case 3:
                                                params.assetSubClassId = elementAssestId.id;
                                                break;
                                        }
                                    });
                                    let urlQuery = that.buildUrl(params);
                                    that._securitySetService.getSecuritySetByAssestId(urlQuery)
                                        .map((response: Response) => <any[]>response.json())
                                        .subscribe(securitySetData => {
                                            if (securitySetData.length > 0) {
                                                let isSecuritySet = securitySetData.filter(x => x.id == dataStructure.elemId).length;
                                                if (isSecuritySet > 0) {
                                                    that.gettingSecuritiesInSecuritySet(dataStructure);
                                                }
                                                else {
                                                    attachSecuritySet = false;
                                                }
                                            }
                                            else {
                                                attachSecuritySet = false;
                                            }


                                            if (!attachSecuritySet) {
                                                $(".info_popup").html("Restricted Usage. The Asset Class definition for the securities in the SecuritySet should match the Sub-model linking definition")
                                                that.InfoPopup = true;
                                            }
                                        });
                                }
                                else {
                                    that.gettingSecuritiesInSecuritySet(dataStructure)
                                }

                            }
                            else {
                                that.droppedElement = dataStructure.dropElement;
                                that.GettingDataForTheDroppedElement(dataStructure, "editMode");
                                that.displayReassign = true;
                            }

                        }
                        else {
                            if (duplicateChilds) {
                                $(".info_popup").html("Same parent will not have duplicate childs!!Please select another sub model!!!");
                            }
                            else if (!AttachNode) {
                                $(".info_popup").html(that.TreeDefaultData.dragElementType + " should not be added to a " + that.TreeDefaultData.droppedElementType);
                            }
                            that.InfoPopup = true;
                        }
                    }
                    else {
                        if (that.substitudeIdFromView) {
                            $(".info_popup").html("Please drag the element on center of substituted nodes only")
                        }
                        else
                            $(".info_popup").html("please drag the element on center of tree node to append the element as child to the node!!!");
                        that.InfoPopup = true;
                    }
                }
            });
    }

    gettingSecuritiesInSecuritySet(dataStructure) {

        let that = this;
        that.responseToObject<ISecuritySet>(that._securitySetService.getSecuritySetDetail(that.TreeDefaultData.elemId))
            .subscribe(securitysetDetails => {
                let name = securitysetDetails.name;
                that.securitySetDetails[name] = securitysetDetails;
                that.securitySetSecurities[name] = securitysetDetails.securities;
                that.droppedElement = dataStructure.dropElement;
                that.GettingDataForTheDroppedElement(dataStructure, "editMode");
                that.displayReassign = true;
            },
            error => {
                // console.log(error);
            });
    }
    checkingValidationForAssetClassLinkage(data, id) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId != 4) {
                if (element.id == id) {
                    that.gettingLinkedAssetClassForTheNode(element);
                }
            }
            if (element.children != undefined) {
                that.checkingValidationForAssetClassLinkage(element.children, id);
            }
        })
    }
    gettingLinkedAssetClassForTheNode(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.assetClass != undefined) {
                that.linkedAssetClass.push({ "type": element.modelTypeId, "id": element.assetClass });
            }
            if (element.parent != null) {
                that.gettingLinkedAssetClassForTheNode(element.parent);
            }
        });
    }

    ValidatingTheSecuritySetForDragAndDrop(assetClass, securities) {
        let count = 0, attachSSet: boolean = false;
        assetClass.forEach(element => {
            securities.forEach(elem => {
                if (element == elem) {
                    count++;
                }
            })
        });
        if (count == assetClass.length) {
            attachSSet = true;
        }
        return attachSSet;
    }
    /*Method used to hide the circles */

    HidingCirclesAfterDrag() {
        d3.selectAll(".ghostCircle").style("fill", "green");
        d3.selectAll(".ghostCircle").style("display", "none");
    }

    /* Method used to hide the ghost circles for non-editable nodes */
    hidingTheCirclesOnSubstitute() {
        let that = this;
        d3.selectAll("g.node").each(function () {
            let innerThis = this;
            let id = $(this).attr("id");
            let parentId = $(this).find("text").attr("data-parent-id");
            if (id == that.substitudeIdFromView || parentId == that.substitudeIdFromView) {
                $(this).find(".ghostCircle").css("display", "block")
            }
        });
    }



    /* Method used to show the pop up for available children on particular node by double clicking on it */

    showingPopUpInViewModeOnDoubleClick(dataStructure) {
        let that = this;
        $('body').on("dblclick", ".node", function () {
            if (that.displayMode != "viewMode") {
                that.TreeDefaultData.timestampId = d3.select(this).attr("id");
                that.doubleClickedNode = $(this).find("text").attr("type");
                that.nodeType = $(this).find("text").attr("type");
                that.droppedElement = $(this).find("text").attr("content");
                that.subModelId = $(this).find("text").attr("data-id");
                that.submodelDetailslst = [];
                that.TreeDefaultData.popupData = [];
                if (that.doubleClickedNode == "Security Set" || that.doubleClickedNode == "SECURITY_SET") {
                    that.isreadonlyNameSpace = true;
                    that.isreadonlyName = true;
                    that.disablingAttributesInPopUp = true;
                    let name = $(this).find("text").attr("content");
                    that.isSecuritySet = true;
                    that.preparingSecuritiesDataForThePopup(that.securitySetSecurities[name]);
                    that.displayReassign = true;
                    that.displaySecurities = true;

                }
                else {
                    that.displaySecurities = false;
                    // that.isreadonlyNameNameSpace = false;
                    let id = $(this).attr("id");
                    that.TreeDefaultData.elemId = $(this).find("text").attr("data-id");
                    dataStructure.dropElement = that.droppedElement;
                    that.gettingDroppedElementData(dataStructure.root, id);
                    that.findingAvailableChildrenToShowInPopup(that.droppedElement, dataStructure.root);
                    that.GettingDataForTheDroppedElement(dataStructure, "viewMode");
                    that.displayReassign = true;
                }
                that.updateOnDoubleClick = true;

            }
        })
    }


    preparingSecuritiesDataForThePopup(data) {
        let that = this;
        if (data != undefined) {
            if (data.length == undefined) {
                data = [data];
            }
            let list = [];
            data.forEach((element, key) => {
                list.push(
                    <IModelDetails>{
                        id: element.id,
                        name: element.name,
                        modelType: element.securityType,
                        modelTypeId: element.securityTypeId,
                        modelDetailId: element.modelDetailId,
                        rank: (element.rank != null) ? element.rank : 0,
                        level: null,
                        targetPercent: element.targetPercent,
                        toleranceTypeValue: null,
                        lowerModelTolerancePercent: element.lowerModelTolerancePercent,
                        upperModelTolerancePercent: element.upperModelTolerancePercent,
                        lowerModelToleranceAmount: element.lowerModelToleranceAmount,
                        upperModelToleranceAmount: element.upperModelToleranceAmount,
                        lowerTradeTolerancePercent: null,
                        upperTradeTolerancePercent: null,
                        leftValue: null,
                        rightValue: null,
                    }
                );
                list[key].nodeName = element.name
            });
            that.submodelDetailslst = list;
        }
    }

    /*Method used to get the data from the api based on the dragged html element
    and plot the node to the tree based on the values we get from the api */

    GettingDataForTheDroppedElement(dataStructure, mode) {
        let that = this;
        let addlst = [];

        if (that.TreeDefaultData.popupData != undefined) {
            that.TreeDefaultData.popupData.forEach((value, key) => {
                let entrylst = {};
                entrylst = <IModelDetails>{
                    id: value.id,
                    name: value.name,
                    modelType: null,
                    modelTypeId: null,
                    modelDetailId: value.modelDetailId,
                    rank: +value.rank,
                    level: null,
                    targetPercent: +value.targetPercent,
                    toleranceTypeValue: +value.toleranceTypeValue,
                    lowerModelTolerancePercent: +value.lowerModelTolerancePercent,
                    upperModelTolerancePercent: +value.upperModelTolerancePercent,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null
                };
                entrylst["nodeName"] = value.nodeName;
                addlst.push(entrylst);

            });
            this.submodelDetailslst = addlst;
        }
        if (mode == "editMode") {
            this.submodelDetailslst.push(
                <IModelDetails>{
                    id: that.timestampIncrement++,
                    name: dataStructure.elemId,
                    modelType: dataStructure.dragElementType,
                    modelTypeId: null,
                    modelDetailId: null,
                    rank: 0,
                    level: null,
                    targetPercent: null,
                    toleranceTypeValue: null,
                    lowerModelTolerancePercent: null,
                    upperModelTolerancePercent: null,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null,
                }
            );
            this.submodelDetailslst[this.submodelDetailslst.length - 1]["nodeName"] = dataStructure.dragElement;
            this.submodelDetailslst[this.submodelDetailslst.length - 1]["parent"] = dataStructure.dropElement;
        }

    }
    clickOnCloseChildren(dataStructure) {
        let that = this;
        $('body').on("click", ".closeChild", function () {
            let deletedLabel = $(this).next().context.nextSibling.nodeValue;
            $(this).parent().parent().parent().remove();
            that.findingIdForTheDeletedNode(deletedLabel, that.submodelDetailslst);
        })

    }

    findingIdForTheDeletedNode(deletedLabel, data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            if (element.nodeName.replace(/\s+/g, '') == deletedLabel.replace(/\s+/g, '')) {
                let droppedData = { "id": element.id, "name": element.nodeName };
                that.TreeDefaultData.deletedNodeOnPopUp.push(droppedData);
                data.splice(key, 1)
                return false;
            }
        })
    }
    findingAvailableChildrenToShowInPopup(ParentElement, data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach((value, key) => {
            if (value.children != undefined) {
                if (value.id == that.TreeDefaultData.DroppedData.id) {
                    that.TreeDefaultData.popupData = value.children;
                    return false;
                }
                that.findingAvailableChildrenToShowInPopup(ParentElement, value.children);
            }
        });
    }

    /*Method used to catch the mouse right click event and is responsible for disabling the 
    pre defined context menu and it will show our custom context menu */

    catchingMouseRightClickEvent(datastructure) {
        let that = this;
        $('.node_tree').off().on('contextmenu', 'g.node', function (e) {
            datastructure.selectedDomNode = this;
            that.droppedElement = $(this).find("text").attr("data-parent");
            that.TreeDefaultData.dropElement = $(this).find("text").attr("data-parent");
            that.nodeSelectedId = $(this).attr("id");
            if (+that.nodeSelectedId == that.substitudeIdFromView || that.CreateTreeEdit.nodeName == $(this).find("text").attr("content")) {
                $('#remove_cm').hide();
                that.parentNodeSelected = true;
            }
            else {
                $('#remove_cm').show();
                that.parentNodeSelected = false;
            }
            if (+that.nodeSelectedId == that.substitudeIdFromView) {
                $("#delete_cm").hide();
            }
            else {
                $("#delete_cm").show();
            }
            e.preventDefault();
            if ($("#context-dd-menu").css("display") == "block" || that.parentNodeSelected && that.displayMode == "editMode") {
                $("#context-dd-menu").css({
                    display: 'none',
                    top: e.offsetY,
                    left: e.offsetX
                });

            } else {
                let top = (that.displayMode == "editMode") ? (e.offsetY + 50) : e.offsetY;
                $("#context-dd-menu").css({
                    display: 'inline-block',
                    top: top,
                    left: e.offsetX + 20
                });
            }
        });
        //Event to be fired in order to close the custom context menu
        $('.node_tree').click(function (e) {
            $("#context-dd-menu").fadeOut(200);
        });
    }


    CatchingTheSelectionActionOnContextMenu() {

        let selectedItem: string = '', that = this;

        $('body').on('click', '.menu_item', function () {
            selectedItem = $(this).html();
            that.selectedId = $(that.TreeDefaultData.selectedDomNode).attr("id")
            that.selectedDomNodeId = $(that.TreeDefaultData.selectedDomNode).find("text").attr("data-parent-id");
            that.subModelId = $(that.TreeDefaultData.selectedDomNode).find("text").attr("data-id");
            that.modelName = $(that.TreeDefaultData.selectedDomNode).find("text").attr("content");

            switch (selectedItem) {
                case "Delete":
                    if (that.CreateTreeEdit.nodeName == $(that.TreeDefaultData.selectedDomNode).find("text").attr("content")) {
                        // that.responseToObject<any>(that._modelService.canDeleteModel(that.modelId))
                        //     .subscribe(response => {
                        //         that.canDeleteModel = true;
                        //     }
                        //     , error => {
                        //         // console.log(error);
                        //         $(".info_popup").html(error.message);
                        //         that.InfoPopup = true;
                        //     });
                    }
                    else {
                        //sub model deletion 
                        that.responseToObject<any>(that._modelService.canDeleteSubModel(that.subModelId, that.modelId))
                            .subscribe(response => {
                                that.canDeleteSubModel = true;
                            },
                            error => {
                                $(".info_popup").html("The sub-model cannot be deleted as it is being currently used by other Models/ Sub-model");
                                that.InfoPopup = true;
                            })
                    }
                    break;

                case "Remove":
                    that.unasscociationGroup(that.selectedId);
                    that.gettingDroppedElementData(that.TreeDefaultData.root, that.selectedDomNodeId);
                    that.findingAvailableChildrenToShowInPopup(that.droppedElement, that.TreeDefaultData.root);
                    if (that.TreeDefaultData.popupData.length != 0) {
                        that.GettingDataForTheDroppedElement(that.TreeDefaultData, "viewMode");
                        that.removedNodes = true;
                        that.updateOnDoubleClick = true;
                        that.displayReassign = true;
                    }
                    else {
                        that.saveTreeDataChange.emit(that.saveTreeData);
                        that.postTreeChartData.emit(that.CreateTreeEdit);
                        that.update(that.TreeDefaultData.root);
                    }
                    break;

                case "Copy":
                    if (that.parentNodeSelected) {
                        that.copyModel = true;
                    }
                    else {
                        that.copySubModel = true;
                    }
                    break;

                case "Substitute":
                    that.reDirectToEdit();
                    break;

                case "Rebalance":
                    that.handleRebalance(that.modelId);
                    break;
                default: break;
            }
            $("#context-dd-menu").css({ display: 'none' });
        });
    }

    copyModelInfo() {
        let that = this;
        if (that.copiedModelName != undefined) {
            if (that.modelName.toLowerCase() != that.copiedModelName.toLowerCase()) {
                that.ResponseToObjects<any[]>(that._modelService.validateModelNamespace(that.modelName, that.modelInfo.nameSpace))
                    .subscribe(model => {
                        let namespace = (that.modelInfo.nameSpace) ? that.modelInfo.nameSpace : that.modelInfo.modelDetail.nameSpace;
                        let modelCopy = <ICopyModel>{
                            name: that.copiedModelName,
                            nameSpace: namespace
                        }
                        that._modelService.copyModel(that.modelId, modelCopy)
                            .map((response: Response) => <any>response.json())
                            .subscribe(model => {
                                that.copiedModelName = "";
                                that.copyModel = false;
                            },
                            error => {
                                console.log(error);
                                that.copiedModelName = "";
                                that.copyModel = false;
                                console.log(error.message);
                                $(".info_popup").html(error.message);
                                that.InfoPopup = true;
                            })
                    },
                    error => {
                        // console.log("error");
                        that.copiedModelName = "";
                        that.copyModel = false;
                        $(".info_popup").html("NameSpace + Name should be unique across the Namespace");
                        that.InfoPopup = true;
                    })

            }
            else {
                that.copiedModelName = "";
                that.copyModel = false;
                $(".info_popup").html("Name should not be same for both copied and original Model");
                that.InfoPopup = true;
            }
        }
    }

    copySubModelInfo() {
        let that = this;
        that.gettingCopiedSubModelData(that.TreeDefaultData.root, that.nodeSelectedId);
        //sub Model Copy
        let subModelData = <ICopyModel>{
            name: that.copiedSubModelName,
            nameSpace: that.copySubModelData.nameSpace
        }
        let subModelId = that.copySubModelData.name;
        if (that.copiedSubModelName != undefined) {
            if (that.modelName.toLowerCase() != that.copiedSubModelName.toLowerCase()) {
                that.ResponseToObjects<any[]>(that._modelService.validateSubModelNamespace(that.copiedSubModelName, that.copySubModelData.nameSpace))
                    .subscribe(model => {
                        that.ResponseToObjects<any[]>(that._modelService.copySubModel(subModelId, subModelData))
                            .subscribe(response => {
                                that.copiedSubModelName = "";
                                that.copySubModel = false;
                            },
                            error => {
                                that.copiedSubModelName = "";
                                that.copySubModel = false;
                                console.log(error.message);
                                $(".info_popup").html("Sub Model is not copied.Please try again!");
                                that.InfoPopup = true;
                            })

                    },
                    error => {
                        that.copiedSubModelName = "";
                        that.copySubModel = false;
                        $(".info_popup").html("NameSpace + Name should be unique across the Namespace");
                        that.InfoPopup = true;
                    }
                    );
            }
            else {
                that.copiedSubModelName = "";
                that.copySubModel = false;
                $(".info_popup").html("Name should not be same for both copied and original Sub Model");
                that.InfoPopup = true;
            }
        }
    }


    gettingCopiedSubModelData(data, id) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (id == element.id) {
                that.copySubModelData = element;
                return false;
            }
            if (element.children != undefined) {
                that.gettingCopiedSubModelData(element.children, id);
            }
        })
    }
    unasscociationGroup(selectedDomNodeId) {
        let that = this
        //RemovingFromTheOriginalData
        that.unassociationOfItsChildrenFromTheTree(selectedDomNodeId, that.TreeDefaultData.root, "data");
        //RemovingFromTheSaveData
        that.unassociationOfItsChildrenFromTheTree(selectedDomNodeId, that.saveTreeData, "save");
    }

    unassociationOfItsChildrenFromTheTree(id, data, mode) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            let uniqueId = (mode == "save") ? element.timestampId : element.id
            if (uniqueId == id) {
                data.splice(key, 1);
                return false;
            }
            if (element.children != undefined) {
                that.unassociationOfItsChildrenFromTheTree(id, element.children, mode);
            }
        })
    }


    deletingModel() {
        let that = this;
        that.canDeleteModel = false;
        that.responseToObject<any>(that._modelService.deleteModel(that.modelId))
            .subscribe(response => {
                $('.info_popup').html(response.message);
                that.InfoPopup = true;
            });
    }

    deletingSubModel() {

        let that = this;
        that.canDeleteSubModel = false;
        that.responseToObject<any>(that._modelService.deleteSubModel(that.subModelId, that.modelId))
            .subscribe(response => {
                that.unasscociationGroup(that.selectedId);
                that.saveTreeDataChange.emit(that.saveTreeData);
                that.postTreeChartData.emit(that.CreateTreeEdit);
                that.update(that.TreeDefaultData.root);
                that.gettingDroppedElementData(that.TreeDefaultData.root, that.selectedDomNodeId);
                that.findingAvailableChildrenToShowInPopup(that.droppedElement, that.TreeDefaultData.root);
                if (that.TreeDefaultData.popupData.length != 0) {
                    that.GettingDataForTheDroppedElement(that.TreeDefaultData, "viewMode");
                    that.updateOnDoubleClick = true;
                    that.displayReassign = true;
                }
                let submdlLst = this.submodelcollection.filter(x => x.id == this.deleteSubModelIdByModelTypeId)[0].submodelsCollection;
                submdlLst.splice(submdlLst.findIndex(x => x.id == this.subModelId), 1);
                this.isChangeDetectionRef = true;
                this.isUpdateData.emit("isChangeDetectionRef");
            });
    }

    /* Method used to fire when user clicked on save button in pop up and responsible
    for handling the validations that the dragged node should be added to the tree or not
    and assign the value to the node based on the target value given by the user in the pop up*/

    updateNodes() {
        this.isChangeDetectionRef = true;
        this.isUpdateData.emit("isChangeDetectionRef");
        this.SubModelChildernsValidation = false;
        let that = this;
        that.AddingExtraIdAttributeInSaveFormat(that.TreeDefaultData.root.children, that.saveTreeData.children);
        if (that.updateOnDoubleClick) {
            that.DeletingElementFromBothDataAndSave();
            that.updateNamespaceAndModelName();
        }
        else if (that.TreeDefaultData.deletedNodeOnPopUp.length != 0 && that.TreeDefaultData.deletedNodeOnPopUp[0].name == that.TreeDefaultData.dragElement) {
            that.TreeDefaultData.deletedNodeOnPopUp = [];
            that.displayReassign = false;
            that.displaySecurities = false;
        }
        else {
            if (that.TreeDefaultData.dragElementType != 'SECURITY_SET') {
                that._modelService.getSubModelDetailById(that.TreeDefaultData.elemId)
                    .map((response: Response) => <subModelDetail>response.json())
                    .subscribe(submodelDetails => {
                        that.filingDataArrayBasedOnApiCall(submodelDetails);
                        that.DeletingElementFromBothDataAndSave();
                        that.updateNamespaceAndModelName();
                        that.addingAssetClassAttributeInData(that.TreeDefaultData.root);
                        that.bindDataToGrid(that.CreateTreeEdit.children);
                        that.TreeDefaultData.deletedNodeOnPopUp = [];
                        that.saveTreeDataChange.emit(that.saveTreeData);
                        that.postTreeChartData.emit(that.CreateTreeEdit);
                    });
            }
            else {
                let submodelDetails = {
                    name: that.TreeDefaultData.dragElement,
                    id: that.TreeDefaultData.elemId,
                    nameSpace: null,
                    modelType: 'SECURITY_SET',
                    modelTypeId: 4,
                    modelDetailId: null,
                    leftValue: null,
                    rightvalue: null,
                    securityAsset: null,
                    children: []
                }
                that.filingDataArrayBasedOnApiCall(submodelDetails);
                that.DeletingElementFromBothDataAndSave();
                that.reUpdatingTheTreeAfterDragAndDrop();
                this.bindDataToGrid(this.CreateTreeEdit.children);
                that.saveTreeDataChange.emit(that.saveTreeData);
                that.postTreeChartData.emit(that.CreateTreeEdit);
                that.TreeDefaultData.deletedNodeOnPopUp = [];

            }
        }
        return false;
    }

    addingAssetClassAttributeInData(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId && element.modelTypeId != 4) {
                if (element.assetClass == undefined) {
                    let selectedSubModelList = that.submodelcollection.filter(x => x.id == element.modelTypeId)
                    if (element.nodeName != undefined) {
                        let assetClassObj = selectedSubModelList[0].submodelsCollection.filter(x => x.name == element.nodeName);
                        element.assetClass = (assetClassObj[0].securityAsset) ? assetClassObj[0].securityAsset.id : null;
                    }
                }
            }
            if (element.children != undefined) {
                that.addingAssetClassAttributeInData(element.children);
            }
        })
    }



    filingDataArrayBasedOnApiCall(submodelDetails) {
        let that = this;
        that.subModelDetailObj = <subModelDetail>{
            name: submodelDetails.name,
            id: submodelDetails.id,
            nameSpace: submodelDetails.nameSpace,
            modelType: submodelDetails.modelType,
            modelTypeId: submodelDetails.modelTypeId,
            modelDetailId: submodelDetails.modelDetailId,
            leftValue: submodelDetails.leftValue,
            rightvalue: submodelDetails.rightvalue,
            securityAsset: submodelDetails.securityAsset,
            children: submodelDetails.children
        }
        if (that.subModelDetailObj.children.length != 0) {
            that.changingIdAttributeInSecuritySet(that.subModelDetailObj);
            that.SwappingNameAndIdInData(that.subModelDetailObj);
            that.AddingParentAttributeInData(that.subModelDetailObj);
            that.submodelDetailslst[that.submodelDetailslst.length - 1]["modelTypeId"] = that.subModelDetailObj.modelTypeId;
            that.submodelDetailslst[that.submodelDetailslst.length - 1]["nameSpace"] = that.subModelDetailObj.nameSpace;
            that.submodelDetailslst[that.submodelDetailslst.length - 1]['children'] = that.subModelDetailObj.children;
        }
        else {
            that.submodelDetailslst[that.submodelDetailslst.length - 1]["modelTypeId"] = that.subModelDetailObj.modelTypeId;
            that.submodelDetailslst[that.submodelDetailslst.length - 1]["nameSpace"] = that.subModelDetailObj.nameSpace;
        }
    }

    changingIdAttributeInSecuritySet(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId == 4) {
                element.id = (element.securityAsset) ? element.securityAsset.id : element.id;
            }
            if (element.children != undefined) {
                that.changingIdAttributeInSecuritySet(element.children);
            }
        })
    }
    DeletingElementFromBothDataAndSave() {
        let that = this;
        // checking if the user clicked on "x" button in pop up 
        if (Object.keys(that.TreeDefaultData.deletedNodeOnPopUp).length != 0) {
            that.TreeDefaultData.deletedNodeOnPopUp.forEach(element => {
                that.deleteNode(element.id, that.TreeDefaultData.root);
                that.deleteSaveStructure(element.id, that.saveTreeData);
            });
        }
    }


    reUpdatingTheTreeAfterDragAndDrop() {
        let that = this;
        if (!that.updateOnDoubleClick) {
            that.preparingDataForSaveAfterDrag(that.submodelDetailslst[that.submodelDetailslst.length - 1], that.TreeDefaultData.parsedSaveData);
            that.AddingExtraIdAttributeInSaveFormat(that.submodelDetailslst[that.submodelDetailslst.length - 1], that.TreeDefaultData.parsedSaveData);
            that.AttachingTheDraggedNodeAtCorrectPositionForSave(that.saveTreeData, that.TreeDefaultData.parsedSaveData);
            if (that.substitudeIdFromView) {
                that.addingSubstitutedFlagInData(that.saveTreeData);
            }
        }
        that.updatingTargetPercentForSave(that.saveTreeData, that.submodelDetailslst);
        that.findingTheParentElementInData(that.TreeDefaultData.root, that.submodelDetailslst, that.TreeDefaultData.dropElement)
        that.ArrangingValuesToPlotPie(that.TreeDefaultData.root);
        if (that.substitudeIdFromView) {
            that.addingSubstitutedFlagInData(that.TreeDefaultData.root);
        }
        let childNames = [];
        that.TreeDefaultData.popupData.forEach(element => {
            childNames.push(element.nodeName.replace(/\s+/g, ''));
        });
        d3.selectAll('g.node').each(function () {
            let textContent = $(this).find("text").attr("content");
            if (textContent.replace(/\s+/g, '') == that.TreeDefaultData.dropElement.replace(/\s+/g, '') || childNames.indexOf(textContent.replace(/\s+/g, '')) != -1) {
                d3.select(this).remove();
            }
        });
        that.TreeDefaultData.deletedNodeOnPopUp = [];
        that.update(that.TreeDefaultData.root);
        that.displayReassign = false;
    }


    updatingTargetPercentForSave(saveData, childrenData) {
        let that = this;
        if (saveData.length == undefined) {
            saveData = [saveData];
        }
        saveData.forEach(element => {
            if (element.children != undefined) {
                if (element.timestampId == that.TreeDefaultData.DroppedData.id) {
                    childrenData.forEach((data, key) => {
                        if (data != undefined) {
                            if (element.children.length > 0) {
                                element.children[key]['targetPercent'] = data.targetPercent;
                                element.children[key]['lowerModelTolerancePercent'] = data.lowerModelTolerancePercent;
                                element.children[key]['upperModelTolerancePercent'] = data.upperModelTolerancePercent;
                                element.children[key]['toleranceTypeValue'] = data.toleranceTypeValue;
                                element.children[key]['rank'] = data.rank;
                            }
                        }
                    })
                }
                that.updatingTargetPercentForSave(element.children, childrenData);
            }

        })
    }


    deleteSaveStructure(id, data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            if (element.timestampId == id) {
                data.splice(key, 1);
            }
            if (element.children != undefined) {
                that.deleteSaveStructure(id, element.children);
            }
        })
    }
    AttachingTheDraggedNodeAtCorrectPositionForSaveGrid(data, childData, parentNodeDetailsId) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach(element => {
            if (element.timestampId == parentNodeDetailsId) {
                element.children.push(childData[0]);
            }
            if (element.children != undefined) {
                that.AttachingTheDraggedNodeAtCorrectPositionForSaveGrid(element.children, childData, parentNodeDetailsId);
            }

        })
    }
    AttachingTheDraggedNodeAtCorrectPositionForSave(data, childData) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach(element => {
            if (element.timestampId == that.TreeDefaultData.DroppedData.id) {
                element.children.push(childData[0]);
            }
            if (element.children != undefined) {
                that.AttachingTheDraggedNodeAtCorrectPositionForSave(element.children, childData);
            }

        })
    }

    preparingDataForSaveAfterDrag(draggedData, parsedSaveData) {
        let that = this, saveDraggedData;
        if (draggedData.length == undefined) {
            draggedData = [draggedData]
        }
        draggedData.forEach((element, key) => {
            saveDraggedData = <IModelDetailChildernSave>{
                id: +(element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.name : element.name,
                name: element.nodeName,
                modelTypeId: element.modelTypeId,
                modelDetailId: (element.modelDetailId) ? element.modelDetailId : null,
                targetPercent: element.targetPercent,
                lowerModelTolerancePercent: element.lowerModelTolerancePercent,
                upperModelTolerancePercent: element.upperModelTolerancePercent,
                toleranceTypeValue: (element.toleranceTypeValue != undefined) ? element.toleranceTypeValue : null,
                lowerModelToleranceAmount: element.lowerModelToleranceAmount,
                upperModelToleranceAmount: element.upperModelToleranceAmount,
                lowerTradeTolerancePercent: element.lowerTradeTolerancePercent,
                upperTradeTolerancePercent: element.lowerTradeTolerancePercent,
                rank: (element.rank != undefined) ? element.rank : null,
                isEdited: null,
                isSubstituted: null,
                substitutedOf: null,
                children: []
            }
            parsedSaveData[key] = saveDraggedData;
            if (element.children != undefined) {
                that.preparingDataForSaveAfterDrag(element.children, parsedSaveData[key].children);
            }
        })
    }

    gettingDroppedElementData(data, dropElement) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach(element => {
            if (element.id == dropElement) {
                that.TreeDefaultData.DroppedData = element;
                if (element.nodeName != that.CreateTreeEdit.nodeName) {
                    that.modelNamespace = element.nameSpace;
                    that.nameSpace = element.nameSpace;
                }
                else {
                    if (that.user.teams.length != 0) {
                        that.modelNamespace = that.user.teams[0].name;
                        that.nameSpace = that.user.teams[0].name;
                    }
                    else {
                        that.modelNamespace = null;
                        that.nameSpace = null;
                    }

                }
                return false;
            }
            if (element.children != undefined) {
                that.gettingDroppedElementData(element.children, dropElement);
            }
        });
    }

    findingTheParentElementInData(data, childrenData, dropElement) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            element.modelDetailId = (element.modelDetailId) ? element.modelDetailId : null;
            if (element.id == that.TreeDefaultData.DroppedData.id) {
                if (element.children != undefined) {
                    childrenData.forEach((value, key) => {
                        if (element.children[key] != undefined) {
                            element.children[key]['targetPercent'] = value.targetPercent;
                            element.children[key]['lowerModelTolerancePercent'] = value.lowerModelTolerancePercent;
                            element.children[key]['upperModelTolerancePercent'] = value.upperModelTolerancePercent;
                            element.children[key]['toleranceTypeValue'] = value.toleranceTypeValue;
                            element.children[key]['rank'] = value.rank;
                        }
                        else {
                            that.AddingDraggedElementTotalData(value);
                            element.children.push(value);
                        }
                    });
                }
                else {
                    element.children = [];
                    childrenData.forEach(elem => {
                        elem.values = [{ "value": elem.targetPercent }];
                        element.children.push(elem);
                    });
                }
            }
            if (element.children != undefined) {
                that.findingTheParentElementInData(element.children, childrenData, dropElement);
            }
        });
    }

    AddingDraggedElementTotalData(data) {
        var that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(elem => {
            if (elem.children != undefined) {
                elem["values"] = [];
                elem.children.forEach(childNode => {
                    elem["values"].push({ "value": childNode.targetPercent });
                    elem['htmlDraggedNode'] = true;
                });
                that.AddingDraggedElementTotalData(elem.children);
            }
            else {
                elem["values"] = [{ "value": elem.targetPercent }];
                elem['htmlDraggedNode'] = true;
            }
        })
    }

    updateNamespaceAndModelName() {
        let that = this;
        that.errorMessage = null;
        if ((that.droppedElement != that.TreeDefaultData.dropElement || that.modelNamespace != that.nameSpace) && that.nodeType != "SECURITY_SET" && that.nodeType != "Security Set") {
            if (that.CreateTreeEdit.nodeName == that.TreeDefaultData.dropElement) {
                if (that.modelNamespace == undefined) {
                    that.modelNamespace = null;
                }
                that._modelService.patchModelNameNameSpace(that.modelId, that.droppedElement, that.modelNamespace)
                    .map((response: Response) => <any>response.json())
                    .subscribe((data: any) => {
                        this.errorMessage = null;
                        that.updatingDataAfterEdit();
                    },
                    error => {
                        this.SubModelChildernsValidation = true;
                        that.displayReassign = true;
                        this.errorMessage = "Sub-Model Name + Namespace must be unique, Please try again.";
                    });
            }
            else {
                that._modelService.updateSubmodel(that.subModelId, that.droppedElement, that.modelNamespace)
                    .map((response: Response) => <any>response.json())
                    .subscribe((data: any) => {
                        this.errorMessage = null;
                        let subLst = this.submodelcollection.filter(x => x.id == that.TreeDefaultData.DroppedData.modelTypeId)[0].submodelsCollection.filter(y => y.id == that.subModelId)[0]
                        subLst.name = that.droppedElement;
                        subLst.nameSpace = that.modelNamespace;
                        // this.displaySubModelsByTypes(+this.subbModelTypeidSelected);
                        this.subModelCollectionEvent.emit(this.submodelcollection);
                        that.updatingDataAfterEdit();

                    },
                    error => {
                        this.SubModelChildernsValidation = true;
                        that.displayReassign = true;
                        this.errorMessage = "Sub-Model Name + Namespace must be unique, Please try again.";
                    });
            }
        }
        else {
            if (that.nodeType == "SECURITY_SET" || that.nodeType == "Security Set") {
                that.securitySetDetails[that.droppedElement].securities.forEach((element, key) => {
                    element.targetPercent = that.submodelDetailslst[key].targetPercent;
                    element.lowerModelTolerancePercent = that.submodelDetailslst[key].lowerModelTolerancePercent;
                    element.upperModelTolerancePercent = that.submodelDetailslst[key].upperModelTolerancePercent;
                    element.rank = that.submodelDetailslst[key].rank;
                    element.taxDeferredSecurity = "";
                    element.taxExemptSecurity = "";
                    element.taxableSecurity = "";
                    element.modelDetailId = that.submodelDetailslst[key].modelDetailId;
                });
                that._securitySetService.updateSecuritySet(that.securitySetDetails[that.droppedElement])
                    .map((response: Response) => <any>response.json())
                    .subscribe((data: any) => {
                        that.displayReassign = false;
                        that.displaySecurities = false;
                        this.errorMessage = null;
                    },
                    error => {
                        this.SubModelChildernsValidation = true;
                        this.errorMessage = "Sub-Model Name + Namespace must be unique, Please try again.";
                    }
                    )
            }
            else {
                that.reUpdatingTheTreeAfterDragAndDrop();
                this.saveTreeDataChange.emit(this.saveTreeData);
                that.postTreeChartData.emit(that.CreateTreeEdit);
                that.updateOnDoubleClick = false;
            }
        }
    }

    updatingDataAfterEdit() {
        let that = this;
        d3.selectAll('g.node').each(function () {
            let textContent = $(this).find("text").attr("content");
            if (textContent.replace(/\s+/g, '') == that.TreeDefaultData.dropElement.replace(/\s+/g, '')) {
                d3.select(this).remove();
            }
        });
        that.editingTheModelNameAndNameSpace(that.saveTreeData, "save");
        that.editingTheModelNameAndNameSpace(that.TreeDefaultData.root, "data");;
        that.reUpdatingTheTreeAfterDragAndDrop();
        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
        that.updateOnDoubleClick = false;
    }

    editingTheModelNameAndNameSpace(data, type) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            let id = (type == "save") ? element.timestampId : element.id;
            let compareId = (type == "save") ? that.TreeDefaultData.DroppedDataId : that.TreeDefaultData.timestampId;
            if (id == compareId) {
                if (type == "save"){
                    element.name = that.droppedElement;
                    element.nameSpace = that.modelNamespace;
                }
                else{
                    element.nodeName = that.droppedElement;
                    element.nameSpace = that.modelNamespace
                }
                return false;
            }
            if (element.children != undefined) {
                that.editingTheModelNameAndNameSpace(element.children, type)
            }
        });
    }

    /*Method used to close the pop up when user clicked on cancel button  */

    closePopUp() {
        let index = this.TreeDefaultData.draggingElementsArray.indexOf(this.TreeDefaultData.dragElement);
        this.TreeDefaultData.draggingElementsArray.splice(index, 1);
        this.displayReassign = false;
        this.isChangeDetectionRef = true;
        this.isUpdateData.emit("isChangeDetectionRef");
    }

    /*Method used to close the info pop up when user clicked on cancel button */

    closeInfoPopUp() {
        this.InfoPopup = false;
        this.showSaveToDraftPopup = false;
        this.deleteNodeModel = false;
        this.deleteNodeSubModel = false;
        this.canDeleteModel = false;
        this.canDeleteSubModel = false;
        this.copySubModel = false;
        this.copyModel = false;
        this.substituted = false;
        this.selectedId = null;
        this.subModelId = null;
        this.selectedDomNodeId = null;
        this.isChangeDetectionRef = true;
        this.isUpdateData.emit("isChangeDetectionRef");
    }

    /*Method used to fire when focus entered or exit in input boxes in model dialog header */

    modelDialogHeaderInputFocus() {
        $('body').on("focus", "#dialog-model-header", function () {
            $(this).css("border", "1px solid #fff");
        });

        $("body").on("focusout", "#dialog-model-header", function () {
            $(this).css("border", "none");
        })
    }

    /*----------------------------------------D3 Code------------------------------------------------------------
                                    Tree service D3 Code added here
`    -----------------------------------------------------------------------------------------------------------*/


    /*Method is responsible for plotting the svg and assigning the data to the respective variables */



    public createSvg(DomElement, treeData, mode) {
        var that = this;
        that.TreeDefaultData.domElement = DomElement;
        that.TreeDefaultData.mode = mode;
        that.TreeDefaultData.tree = d3.layout.tree()
            .nodeSize([40, 0])
            .separation(function separation(a, b) {
                return a.parent == b.parent ? 3.2 : 2.2;
            });

        that.TreeDefaultData.diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.x, d.y]; });

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents

        that.TreeDefaultData.zoomListener = d3.behavior.zoom().scaleExtent([0.5, 1.2]).on("zoom", function () {
            return that.zoom(that.TreeDefaultData)
        });

        that.TreeDefaultData.svg = d3.select(that.TreeDefaultData.domElement).append("svg")
            .attr("class", "tree_chart")
            .style("position", "absolute")
            .style("left", "0px")
            .style("top", "70px")
            .attr("width", that.TreeDefaultData.width + that.TreeDefaultData.margin.right + that.TreeDefaultData.margin.left)
            .attr("height", that.TreeDefaultData.height + that.TreeDefaultData.margin.top + that.TreeDefaultData.margin.bottom);


        var filter = that.TreeDefaultData.svg.append("defs")
            .append("filter")
            .attr("id", "blur")
            .append("feGaussianBlur")
            .attr("stdDeviation", 1);

        if (that.TreeDefaultData.mode == "editMode") {
            that.TreeDefaultData.svg.call(that.TreeDefaultData.zoomListener);
        }
        var transformLeft = (that.TreeDefaultData.width / 2) - 60;
        that.TreeDefaultData.svgGroup = that.TreeDefaultData.svg.append("g")
            .attr("class", "container")
            .attr("transform", "translate(" + transformLeft + "," + (that.TreeDefaultData.margin.top + 15) + ")");

        this.renderTreeChart(treeData, that.TreeDefaultData);
    }

    /* Method used to render the tree chart with the functionality  */

    public renderTreeChart(treeData, datastructure) {
        datastructure.root = treeData[0];
        datastructure.root.x0 = datastructure.height / 2;
        datastructure.root.y0 = 0;
        this.update(datastructure.root);
    }


    /*Method used to call when mouse scrolled as it is the default behavior of zoom */

    public zoom(dataStructure) {
        if (d3.event['sourceEvent'] != null && d3.event['sourceEvent'] != "null") {
            if (d3.event['sourceEvent']['type'] == "wheel") {
                var difference = this.TreeDefaultData.width / 2 - d3.event["translate"][0];
                var x = d3.event["translate"][0] + difference;
            }
            else {
                var x = this.TreeDefaultData.width / 2 + d3.event["translate"][0];
            }
            var y = d3.event["translate"][1];
            dataStructure.svgGroup.attr("transform", "translate(" + x + "," + y + ")scale(" + d3.event['scale'] + ")");
        }
    }

    /*Method used for plotting the nodes and pie around the nodes and updates the tree chart according to the data */

    public update(source) {
        var that = this.TreeDefaultData;
        var storageInstance = this;
        // Compute the new tree layout.
        var nodes = that.tree.nodes(that.root).reverse(),
            links = that.tree.links(nodes);
        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 90; });

        // Update the nodes…
        var node = that.svgGroup.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++that.counterFlag); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) {
                return d.id;
            })
            .attr("transform", function (d) { return "translate(" + source.x0 + "," + source.y0 + ")"; });
        if (that.displayMode == "editMode") {
            nodeEnter.on("click", function (d) {
                return storageInstance.click(d, storageInstance, that);
            });
        }

        //conditional checking for substitute to make the non-substituted sub-models getting blurred
        if (storageInstance.substitudeIdFromView) {
            nodeEnter.attr("filter", function (d) {
                if (d.isSubstituted == null) {
                    return "url(#blur)";
                }
            })
                .attr("pointer-events", function (d) {
                    if (d.isSubstituted == null) {
                        return "none"
                    }
                });
        }



        nodeEnter.append("circle")
            .attr("r", 25)
            .attr("class", "mainCircle")
            .attr("type", function (d) {
                if (d.modelType == undefined)
                    return storageInstance.AddingAttributeForDraggingNode(d);
                else
                    return d.modelType;
            })
            .style("fill", function (d, i, j) {

                if (d['depth'] == 0) {
                    d['color'] = '#cccccc';
                    d['colorCount'] = 0;
                    let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                    if (colorcode) {
                        return colorcode
                    }
                    return "red";
                }

                else if (d['depth'] == 1) {
                    var colorObject1 = storageInstance.colorCode(d, that.colorArrayForDepth1, that.colorCount1, that.firstLevelColor);
                    that.colorCount1 = colorObject1['colorCount'];
                    let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                    if (colorcode) {
                        return colorcode
                    }
                    return colorObject1['color'];

                }

                else if (d['depth'] == 2) {
                    var colorObject2 = storageInstance.colorCode(d, that.colorArrayForDepth2, that.colorCount2, that.secondLevelColor);
                    that.colorCount2 = colorObject2['colorCount'];
                    let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                    if (colorcode) {
                        return colorcode
                    }
                    return colorObject2['color'];

                }

                else if (d['depth'] == 3) {
                    var colorObject3 = storageInstance.colorCode(d, that.colorArrayForDepth3, that.colorCount3, that.color);
                    that.colorCount3 = colorObject3['colorCount'];
                    let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                    if (colorcode) {
                        return colorcode
                    }
                    return colorObject3['color'];
                }

                else {
                    if (d.color != undefined) {
                        let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                        if (colorcode) {
                            return colorcode
                        }
                        return d.color;
                    }

                    else {
                        that.colorCountgeneric++;
                        d['color'] = that.lastNodeColor(that.colorCountgeneric - 1)
                        let colorcode = storageInstance.AddingColorForSubstitutedNode(d);
                        if (colorcode) {
                            return colorcode
                        }
                        return that.lastNodeColor(that.colorCountgeneric - 1);
                    }
                }
            })


        //Adding color array to the data which is to be used in filling the colors for arcs in pie  
        if (that.clickFlag == false) {
            this.AddingCorrespondingColorNumber(that.root);
        }
        else {
            that.clickFlag = false;
        }
        //plotting pie chart
        this.plotPie(nodeEnter, that.root, nodes);

        nodeEnter.append("text")
            .attr("x", 0)
            .attr("dy", ".35em")
            .attr("class", "nodeText")
            .attr("data-parent", function (d) {
                if (d.parent != undefined)
                    return d.parent['nodeName'];
                else
                    return "null";
            })
            .attr("data-parent-id", function (d) {
                if (d.parent != undefined) {
                    return d.parent["id"];
                } else
                    return "null";
            })
            .attr("type", function (d) {

                if (d.modelType == undefined)
                    return storageInstance.AddingAttributeForDraggingNode(d);
                else
                    return d.modelType;
            })
            .attr("data-id", function (d) {
                return d.name;
            })
            .attr("text-anchor", function (d) { return "middle" })
            .style("font-weight", "bold")
            .style("font-size", "11px")
            .style("fill", "#000")
            .attr("content", function (d) {
                return d.nodeName;
            })
            .call(this.wrap, 30);

        //Appending a circle at the top of the circle in order to show the tooltip and this cirlce will not appearing
        //as we are making the opacity too low

        nodeEnter.append("circle")
            .style("opacity", "0.1")
            .attr("r", 25)
            .on("mouseover", function (d) {
                storageInstance.childNodeData = [];
                storageInstance.hoveredParentName = d.nodeName;
                let totalTarget = 0;
                if (d.modelTypeId == 4) {
                    storageInstance.securitySetHover = true;
                    let data = storageInstance.securitySetSecurities[storageInstance.hoveredParentName];
                    if (data != null && data != undefined) {
                        data.forEach((elem, key) => {
                            let lowerTolerance = (elem.lowerModelTolerancePercent == null || elem.lowerModelTolerancePercent == undefined) ? '' : elem.lowerModelTolerancePercent;
                            var upperTolerance = (elem.upperModelTolerancePercent == null || elem.upperModelTolerancePercent == undefined) ? '' : elem.upperModelTolerancePercent;
                            let toleranceType = (elem.toleranceTypeValue == null || elem.toleranceTypeValue == undefined) ? '' : elem.toleranceTypeValue;
                            let rank = (elem.rank == null || elem.rank == undefined) ? '' : elem.rank;
                            totalTarget += +(elem.targetPercent);
                            storageInstance.childNodeData.push({
                                "label": elem.name,
                                "targetPercent": elem.targetPercent,
                                "lowerTolerance": lowerTolerance,
                                "upperTolerance": upperTolerance,
                                "rank": rank,
                                "count": key
                            });
                            if ((data.length - 1) == key) {
                                storageInstance.childNodeData[data.length - 1]['totalTarget'] = totalTarget;
                            }
                        });
                    }
                }
                else {
                    storageInstance.securitySetHover = false;
                    [d].forEach(element => {
                        if (element.children != undefined) {
                            element.children.forEach((elem, key) => {
                                let lowerTolerance = (elem.lowerModelTolerancePercent == null || elem.lowerModelTolerancePercent == undefined) ? '' : elem.lowerModelTolerancePercent;
                                var upperTolerance = (elem.upperModelTolerancePercent == null || elem.upperModelTolerancePercent == undefined) ? '' : elem.upperModelTolerancePercent;
                                let toleranceType = (elem.toleranceTypeValue == null || elem.toleranceTypeValue == undefined) ? '' : elem.toleranceTypeValue;
                                let rank = (elem.rank == null || elem.rank == undefined) ? '' : elem.rank;
                                totalTarget += +(elem.targetPercent);
                                storageInstance.childNodeData.push({
                                    "label": elem.nodeName,
                                    "targetPercent": elem.targetPercent,
                                    "lowerTolerance": lowerTolerance,
                                    "upperTolerance": upperTolerance,
                                    "toleranceTypeValue": toleranceType,
                                    "rank": rank,
                                    "count": key
                                });
                                if ((element.children.length - 1) == key) {
                                    storageInstance.childNodeData[[d][0]['children'].length - 1]['totalTarget'] = totalTarget;
                                }
                            });
                        }
                    });
                }

                let translateVal = $(this).parent().attr("transform").split("(")[1];
                let containerVal = $('.container').attr("transform").split("(")[1];
                let left = parseFloat(containerVal.split(",")[0]) + (parseFloat(translateVal.split(",")[0])) + 60;
                var color = $(this).siblings(".mainCircle").css("fill");
                var hover = d3.select(".circleHover")
                    .style('display', 'inline-block')
                    .style("left", left + 'px')
                    .style("top", (d3.event['offsetY'] + 24) + "px")

            })
            .on("mouseout", function () {
                d3.select(".circleHover").style("display", "none");
            });

        // phantom node to give us mouseover in a radius around it

        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("type", function (d) {
                if (d.modelType == undefined)
                    return storageInstance.AddingAttributeForDraggingNode(d);
                else
                    return d.modelType;
            })
            .attr("r", 60)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "green")
            .style("display", "none")
            .attr('pointer-events', 'mouseover');


        // Transition nodes to their new position.

        var nodeUpdate = node
            .transition()
            .duration(that.duration)
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.

        var nodeExit = node.exit()
            .transition()
            .duration(that.duration)
            .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 25);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…

        var link = that.svgGroup.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.

        link.enter().insert("path", "g")
            .attr("class", function (d) {
                if (d.target.isSubstituted) {
                    return "link link_dashed"
                }
                else {
                    return "link";
                }
            })
            .attr("d", function (d) {
                var o = { x: source.x0, y: source.y0 };
                return that.diagonal({ source: o, target: o });
            })
            .style("stroke-width", function (d) {
                return "4px";
            });

        // Transition links to their new position.

        link
            .transition()
            .duration(that.duration)
            .attr("d", that.diagonal)
            .style("stroke-width", function (d) {
                return "4px";
            });
        // Transition exiting nodes to the parent's new position.

        link.exit()
            .transition()
            .duration(that.duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return that.diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.

        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    /*Method used to call when click event fired on the nodes */

    public click(d, storageInstance, that) {
        that.clickFlag = true;
        if (d.children != null && d.children.length != 0) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        storageInstance.update(d);
    }


    AddingColorForSubstitutedNode(d) {
        let that = this;
        //Showing some different unique color for substituted node
        if (that.substitudeIdFromView != undefined) {
            if (d.parent != null) {
                if (d.id == that.substitudeIdFromView || d.parent.id == that.substitudeIdFromView) {
                    return "#FF1D8E";
                }
            }
        }
    }

    /*
    * Method used to plot the pie chart
    */

    public plotPie(nodeEnter, root, nodes) {
        var that = this;
        var data = [];
        var radius = 55;
        var arc = d3.svg.arc()
            .outerRadius(radius - 15)
            .innerRadius(radius - 30);

        var pie = <any>d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d['value'];
            });

        var g = nodeEnter.selectAll(".arc")
            .data(function (d) {
                data.push(d);
                return pie(d['values'])
            })
            .enter().append("g")
            .attr("class", "arc");


        g.append("path")
            .attr("d", <any>arc)
            .style("fill", function (d, i, j) {
                return data[j]['colorArray'][i]
            });
    }


    /*
    * Method used to dynamically set up the color for the circle element inside the node based on the 
    * level of depth and the attributes
    */

    public colorCode(d, colorArray, colorCount, colorScale) {
        var object = {};
        if (d['color'] != undefined) {
            object['colorCount'] = colorCount;
            object['color'] = d['color'];
            return object;
        }
        if (d['colorCount'] != undefined) {
            if (d['htmlDraggedNode'] == true) {
                d['color'] = colorScale(d['colorCount']);
                object['colorCount'] = colorCount;
                object['color'] = colorScale(d['colorCount']);
                return object;
            }
            else {
                d['color'] = colorArray[d['colorCount']];
                object['colorCount'] = colorCount;
                object['color'] = colorArray[d['colorCount']];
                return object;
            }

        }
        else if (d['htmlDraggedNode'] == true) {
            var comparedCount;
            if (d['depth'] == 1) {
                comparedCount = 10;
            }
            else if (d['depth'] == 2) {
                comparedCount = 7;
            }
            else {
                comparedCount = 10;
            }
            if (colorCount == comparedCount) {
                colorCount = 0;
            }
            colorCount++;
            d['colorCount'] = colorCount - 1;
            d['color'] = colorScale(colorCount - 1);
            object['colorCount'] = colorCount;
            object['color'] = colorScale(colorCount - 1);
            return object;
        }
        else if (d['colorCount'] == undefined) {
            colorCount++;
            if (colorArray[colorCount - 1] != undefined) {
                d['color'] = colorArray[colorCount - 1];
            }
            else {
                d['color'] = colorScale(colorCount - 1);
            }
            d['colorCount'] = colorCount - 1;
            object['colorCount'] = colorCount;
            if (colorArray[colorCount - 1] != undefined)
                object['color'] = colorArray[colorCount - 1];
            else
                object['color'] = colorScale(colorCount - 1);
            return object;

        }
    }

    /*
    * Method used to place the corresponding color number in the correct level which will be helpful in drawing the 
    * pie arcs and adds a new attribute to the dataset "colorArray"
    */

    public AddingCorrespondingColorNumber(root) {
        var that = this;
        if (root.length == undefined) {
            root = [root];
        }
        root.forEach((value, key) => {
            var values = [];
            if (value.children != undefined) {
                value.children.forEach((v, k) => {
                    values.push(v['color']);
                })
                value.colorArray = values;
                that.AddingCorrespondingColorNumber(value.children);
            }
            else {
                value.colorArray = [value['color']];
            }
        });
    }

    /*Method used to find the type of node based on the depth of the data*/

    public AddingAttributeForDraggingNode(d) {
        if (d.depth == 0) {
            return "Parent Node";
        }
        else if (d.depth == 1) {
            return "Category";
        }
        else if (d.depth == 2) {
            return "Class";
        }
        else if (d.depth == 3) {
            return "Sub Class";
        }
        else if (d.depth == 4) {
            return "SecuritySet"
        }
    }

    /*Method used to validate the Attached Node under some validation cases */
    public CheckingNodeToBeAddesForValidation(treeElementType, draggedNodeType) {
        var AttachNode = true;
        switch (treeElementType) {
            case "Parent Node": {
                if (draggedNodeType == "Sub Class") {
                    AttachNode = false;
                }
                break;
            }
            case "Category": {
                if (draggedNodeType == "Sub Class" || draggedNodeType == "Category" || draggedNodeType == "Multiple Category") {
                    AttachNode = false;
                }
                break;
            }
            case "Class": {
                if (draggedNodeType == "Category" || draggedNodeType == "Class" || draggedNodeType == "Multiple Category") {
                    AttachNode = false;
                }
                break;
            }
            case "Sub Class": {
                if (draggedNodeType == "Category" || draggedNodeType == "Sub Class" || draggedNodeType == "Class" || draggedNodeType == "Multiple Category") {
                    AttachNode = false;
                }
                break;
            }
            case "SecuritySet": {
                AttachNode = false;
                break;
            }
            default: {
                AttachNode = false;
                break;
            }
        }
        return AttachNode;
    }

    /* Method used to delete the particular node and its respective children based on the clicked node by the 
    user*/

    public deleteNode(id, root) {
        var that = this;
        root.children.forEach((value, key) => {
            if (value.id == id) {
                root.children.splice(key, 1);
                root.values.splice(key, 1);
                return false;
            }
            if (value.children != undefined) {
                that.deleteNode(id, value);
            }
        })
    }




    /* Method used to check whether the tree is in collapsed mode when user drops some node into the work area */

    public checkingTheNodesAreCollapsedOrExpanded(data) {
        var that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((value, key) => {
            if (Object.keys(value).indexOf("_children") != -1) {
                if (value._children != null) {
                    value.children = value._children;
                    delete value._children;
                }
            }
            if (value.children != undefined) {
                that.checkingTheNodesAreCollapsedOrExpanded(value.children);
            }
        })
    }


    /* Method used to change the colors for the ghost circles that are appearing on the back of each node
       based on the validation rules.it shows two colors green and red.Green is for accepting  the 
       respective dragged element to be appended as a child to the particular node and the red implies 
       the opposite */

    public ChangingColorsForCirclesBasedOnDraggedElement(type) {
        var CircleTypesToBeShown = [];
        switch (type) {
            case "Category": {
                CircleTypesToBeShown = ["Parent Node"];
                break;
            }
            case "Class": {
                CircleTypesToBeShown = ["Parent Node", "Category"];
                break;
            }
            case "Sub Class": {
                CircleTypesToBeShown = ["Class"];
                break;
            }
            case "SECURITY_SET": {
                CircleTypesToBeShown = ["Parent Node", "Category", "Class", "Sub Class"];
                break;
            }
            case "Multiple Category": {
                CircleTypesToBeShown = ["Parent Node"];
                break;
            }
            default: {
                break;
            }

        }
        d3.selectAll('g.node').each(function () {
            if (CircleTypesToBeShown.indexOf($(this).find("text").attr("type")) == -1) {
                $(this).find(".ghostCircle").css("fill", "red");
            }
            else {
                $(this).find(".ghostCircle").css("fill", "green");
            }
        });
    }

    //function to wrap text of nodes in tree chart
    public wrap(text, width) {
        text.each(function (evt) {
            var text = d3.select(this),
                separator = [' ', '\\\+', '-', '\\\(', '\\\)', '\\*', '/', ':', '\\\?', ' -', '  ', '- ', '--', ' - '],
                showtext = evt.nodeName;
            var textLength = showtext.length;
            if (textLength) {
                if (textLength > 15) {
                    var remainingletter = showtext.slice(15);
                    var lastlength = remainingletter.length
                    showtext = showtext.slice(0, -(lastlength)) + '...';
                }
                var words = showtext.split(new RegExp(separator.join('|'), 'g')).reverse();
                words.forEach((element, key) => {
                    if (element == "" || element == " ") {
                        words.splice(key, 1);
                    }
                })
                if (words.length == 1 && textLength > 5) {
                    let text = [];
                    text.push(words[0].substring(0, 6));
                    if (textLength <= 11) {
                        text.push(words[0].substring(6, textLength));

                    }
                    else {
                        text.push(words[0].substring(6, 12));
                    }
                    if (textLength > 11) {
                        text.push(words[0].substring(11, textLength));
                    }
                    words = text.reverse();
                }
                if (words.length)
                    var i = words.length;
                var y: number;
                var lineHeight; // ems
                var displayname;
                switch (i) {
                    case 1:
                        {
                            y = 0;
                            lineHeight = 0.35;
                            break;
                        }
                    case 2:
                        {
                            y = -21;
                            lineHeight = 1.2;
                            break;
                        }
                    case 3:
                        {
                            y = -21;
                            lineHeight = 1.0;
                            break;
                        }
                    case 4:
                        {
                            y = -35;
                            lineHeight = 1.3;
                            break;
                        }
                    default:
                        {
                            y = -35;
                            lineHeight = 1.2;
                        }
                }
                var word;
                var line = [];
                var lineNumber = 0;
                var dy = parseFloat(text.attr("dy"));
                var tspan = <any>text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

                if (words.length > 1) {
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        } else {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                } else {
                    tspan = <any>text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em").text(words)
                }
            }
        });
    }

    calculateTolerance(tolranceband, CreateTreeEditChild) {
        let that = this;
        if (CreateTreeEditChild.length == undefined) {
            CreateTreeEditChild = [CreateTreeEditChild];
        }
        CreateTreeEditChild.forEach(element => {

            if (element.children != undefined) {

                element.toleranceTypeValue = tolranceband;
                let fixedBandRange = (tolranceband / 100) * element.targetPercent;
                element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);

                that.calculateTolerance(tolranceband, element.children);
            }
        });


    }

    setValidTolarance(event) {
        let parsetxt = parseInt(event.target.value + event.key);
        this.calculateTolerance(parsetxt, this.saveTreeData);
    }

    private setValidTolaranceBand(event, targetPercentValue, subModelId) {
        if (this.validateEventField(event)) {
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            // Calculate the Amount       
            if (this.submodelDetailslst.length > 0) {
                this.submodelDetailslst.forEach(element => {
                    if (targetPercentValue != null && element.id == subModelId) {
                        let fixedBandRange = (parseInt(event.target.value + event.key) / 100) * element.targetPercent;
                        element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                        element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                    }
                });
            }
            return true;
        }
        else {
            return false
        }
    }
    getToleranceTotal() {
        this.toleranceTotal = 0;
        if (this.submodelDetailslst.length > 0) {
            this.submodelDetailslst.forEach(element => {
                if (element.targetPercent != null) {
                    this.toleranceTotal = (this.toleranceTotal) + (element.targetPercent);

                }
            })
        };
        return this.toleranceTotal;
    }

    calculateFixedBand() {
        let cnt = 0;
        if (this.submodelDetailslst.length > 0) {
            this.submodelDetailslst.forEach(element => {
                if (element.targetPercent != null) {
                    if (this.toleranceTypeValue == 2) {
                        if (this.toleranceTypePer != null && element.targetPercent != null) {
                            let fixedBandRange = (this.toleranceTypePer / 100) * element.targetPercent;
                            element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                            element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                        }
                        else {
                            element.upperModelTolerancePercent = null;
                            element.lowerModelTolerancePercent = null;
                        }
                    }
                }
                else {
                    cnt++;
                }
            });
        }
        return (cnt > 0) ? false : true;
    }
    IsValidForm() {
        if (this.submodelDetailslst.length > 0) {
            let showSaveBtn = this.calculateFixedBand();
            if (this.toleranceTotal == 100 && showSaveBtn) {
                if (this.droppedElement == "" || this.modelNamespace == "") {
                    return false;
                }
                else {
                    if (this.toleranceTypePer != null) {
                        this.submodelDetailslst.forEach(element => {
                            if (element.targetPercent != null && element.targetPercent != 0) {
                                element.toleranceTypeValue = this.toleranceTypePer;
                                if (this.toleranceTypePer != null) {
                                    let fixedBandRange = (this.toleranceTypePer / 100) * element.targetPercent;
                                    element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                                    element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                                }
                            }
                            else {
                                // element.upperModelTolerancePercent = null;
                                // element.lowerModelTolerancePercent = null;
                            }
                        })
                    }
                    return true;
                }
            }
            else if (this.TreeDefaultData.deletedNodeOnPopUp.length > 0 && this.toleranceTotal == 0) {
                return true;
            }
            else if (this.TreeDefaultData.deletedNodeOnPopUp.length > 0 && this.toleranceTotal != 0) {
                return false;
            }
            else if (this.TreeDefaultData.deletedNodeOnPopUp.length == 0 && this.toleranceTotal == 0) {
                return false;
            }
            return false;
        }
        else {

            if (this.TreeDefaultData.dragElement == null) {
                if (this.droppedElement == "" || this.modelNamespace == "") {
                    return false;
                }
                return true;
            }
            else {
                return this.calculateFixedBand();;
            }
        }
    }

    isValidCopy() {
        if (!this.copiedModelName || this.copiedModelName.length == 0) {
            return true;
        }

        return false;
    }

    isValidSubModelCopy() {
        if (!this.copiedSubModelName || this.copiedSubModelName.length == 0) {
            return true;
        }
        return false;
    }

    cancelPopUp() {
        this.displayReassign = false;
        // this.hoveringViewMode = false;
        this.displaySecurities = false;

        this.TreeDefaultData.dragElement = null;
        this.TreeDefaultData.deletedNodeOnPopUp = [];
        this.SubModelChildernsValidation = false;

    }


    // Grid Related Code
    AddSubModelForGridEmpty() {
        if (this.substitudeIdFromView == this.CreateTreeEdit.id) {
            this.substitudeIdFromView = 0;
        }

        let that = this;
        if (that.CreateTreeEdit.children == undefined) {
            that.CreateTreeEdit.children = [];
        }
        if (this.isValidateGridSubModelDetailsRecords(that.CreateTreeEdit)) {
            that.CreateTreeEdit.children.push(
                <IModelDetails>{
                    id: null,
                    name: null,
                    modelType: null,
                    modelTypeId: 0,
                    modelDetailId: null,
                    rank: 0,
                    level: null,
                    targetPercent: null,
                    toleranceTypeValue: null,
                    lowerModelTolerancePercent: null,
                    upperModelTolerancePercent: null,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null,
                    submodelList: [],
                    children: [],
                    values: [],
                    substitutedStyle: "row-panel"
                });
        }
        else {
            $(".info_popup").html("Please enter valid data!!..");
            this.InfoPopup = true
        }

        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
    }

    AttachingGrdiData(data, childData, gridNodemodelId) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId != 0 && element.modelTypeId != null) {
                let submdlLst = this.submodelcollection.filter(x => x.id == element.modelTypeId)
                element.submodelDataLsit = submdlLst[0].submodelsCollection;
                //  element.submodelTypes = this.gettingRequiredListFromId(element.modelTypeId);
                element.submodelTypes = (element.submodelTypes == undefined) ? this.gettingRequiredListFromId(element.modelTypeId) : (element.submodelTypes.length > 0) ? element.submodelTypes : this.gettingRequiredListFromId(element.modelTypeId);

                element.selectedsubmodelType = +element.name
            }
            else {
                element.submodelDataLsit = [];
                // element.submodelTypes = this.gettingRequiredListFromId(element.modelTypeId);
                element.submodelTypes = (element.submodelTypes == undefined) ? this.gettingRequiredListFromId(element.modelTypeId) : (element.submodelTypes.length > 0) ? element.submodelTypes : this.gettingRequiredListFromId(element.modelTypeId);

                element.selectedsubmodelType = null
            }
            element.modelTypeId = (element.id == null) ? 0 : element.modelTypeId;
            if (element.id == gridNodemodelId) {
                if (element.children == undefined) {
                    element.children = [];
                }
                element.children.push(childData[0]);
            }
            if (element.children != undefined) {
                if (element.children.length > 0) {
                    that.AttachingGrdiData(element.children, childData, gridNodemodelId);
                }
            }
        })
    }
    gettingRequiredListFromId(id) {
        let submodelTypes = [
            { id: 1, name: "Category" },
            { id: 2, name: "Class" },
            { id: 3, name: "Sub-Class" },
            { id: 4, name: "SecuritySet" }
        ]
        let submodelLst;
        switch (+id) {
            case 1:
                submodelLst = submodelTypes.filter(x => x.id != 1 && x.id != 3);
                break;
            case 2:
                submodelLst = submodelTypes.filter(x => x.id != 1 && x.id != 3);
                break;
            case 3:
                submodelLst = submodelTypes.filter(x => x.id != 1 && x.id != 2);
                break;
            case 4:
                submodelLst = submodelTypes.filter(x => x.id != 1 && x.id != 2 && x.id != 3);
                break;
            case 5:
                submodelLst = submodelTypes.filter(x => x.id == 4);
                break;
            default:
                submodelLst = submodelTypes.filter(x => x.id != 3);
                break;

        }
        return submodelLst;
    }
    gridValidateModelDetails(gridmodelDetails: IModelDetails) {
        if (gridmodelDetails.modelTypeId != 0 && gridmodelDetails.id != null && gridmodelDetails.targetPercent != null && gridmodelDetails.modelTypeId != 4) {
            return "grid-context-link";
        }
        return "linkdisabled";
    }


    assignSubModel(data) {
        data.children.forEach(element => {
            this.submodelDetailslst.push(<IModelDetails>{
                id: parseInt(element.id),
                modelDetailId: element.modelDetailId,
                name: element.name,
                modelType: element.modelType,
                modelTypeId: +element.modelTypeId,
                rank: element.rank,
                level: null,
                targetPercent: element.targetPercent,
                toleranceTypeValue: element.toleranceTypeValue,
                lowerModelTolerancePercent: element.lowerModelTolerancePercent,
                upperModelTolerancePercent: element.upperModelTolerancePercent,
                lowerModelToleranceAmount: null,
                upperModelToleranceAmount: null,
                lowerTradeTolerancePercent: element.lowerTradeTolerancePercent,
                upperTradeTolerancePercent: element.upperTradeTolerancePercent,
                leftValue: null,
                rightValue: null,
                submodelList: [],
                children: [],
                values: [],
                nodeName: element.nodeName,
                substitutedStyle: "row-panel"
            });

            if (element.children != undefined) {
                this.assignSubModel(element);
            }
        });
    }
    setGridData(dataTree, submodelData, childId) {
        let submdlLst;
        //  let parentModelId = 0;
        dataTree.forEach(elementChild => {
            if (elementChild.id == childId || elementChild.id == null) {
                elementChild.id = childId,
                    elementChild.name = (elementChild.modelTypeId == 4) ? elementChild.name : submodelData.name,
                    elementChild.modelType = submodelData.modelType,
                    elementChild.modelTypeId = submodelData.modelTypeId,
                    elementChild.modelDetailId = submodelData.modelDetailId,
                    elementChild.rank = submodelData.rank,
                    elementChild.level = null,
                    elementChild.targetPercent = submodelData.targetPercent,
                    elementChild.toleranceTypeValue = submodelData.toleranceTypeValue,
                    elementChild.lowerModelTolerancePercent = submodelData.lowerModelTolerancePercent,
                    elementChild.upperModelTolerancePercent = submodelData.upperModelTolerancePercent,
                    elementChild.lowerModelToleranceAmount = null,
                    elementChild.upperModelToleranceAmount = null,
                    elementChild.lowerTradeTolerancePercent = null,
                    elementChild.upperTradeTolerancePercent = null,
                    elementChild.leftValue = null,
                    elementChild.rightValue = null,
                    elementChild.nodeName = submodelData.nodeName,
                    elementChild.values = [],
                    elementChild.children = submodelData.children

                //parentModelId = elementChild.modelTypeId
            }
            else if (elementChild.modelTypeId == 4) {
                elementChild.name = (elementChild.securityAsset) ? elementChild.securityAsset.id : elementChild.name;
            }
            else if (elementChild.modelType == null) {
                elementChild.modelType = (elementChild.modelTypeId != 4) ? this.modelTypeListEnum[elementChild.modelTypeId] : "Security Set";
            }

            if (elementChild.modelTypeId != null) {
                submdlLst = this.submodelcollection.filter(x => x.id == elementChild.modelTypeId)
                //elementChild.submodelDataLsit = (submodelData.submodelList.length > 0) ? submodelData.submodelList : submdlLst[0].submodelsCollection;
                elementChild.submodelDataLsit = (submdlLst.length > 0) ? submdlLst[0].submodelsCollection : [];
                elementChild.submodelTypes = (elementChild.submodelTypes == undefined) ? [] : (elementChild.submodelTypes.length > 0) ? elementChild.submodelTypes : this.gettingRequiredListFromId(elementChild.modelTypeId);
                elementChild.selectedsubmodelType = +elementChild.name
            }
            else {
                elementChild.submodelDataLsit = [];
                elementChild.submodelTypes = (elementChild.submodelTypes == undefined) ? [] : (elementChild.submodelTypes.length > 0) ? elementChild.submodelTypes : this.gettingRequiredListFromId(elementChild.modelTypeId);
                elementChild.selectedsubmodelType = null
            }

            // recursive
            if (elementChild.children != undefined) {
                this.setGridData(elementChild.children, submodelData, childId);
            }
        });
    }


    AttachingTheDraggedNodeAtCorrectPositionForsavingGrid(data, childData, parentNodeDetailsId) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }

        data.forEach(element => {
            if (element.timestampId == parentNodeDetailsId) {
                element.children.push(childData[0]);
            }
            if (element.children != undefined) {
                that.AttachingTheDraggedNodeAtCorrectPositionForSaveGrid(element.children, childData, parentNodeDetailsId);
            }

        })
    }

    createSubmodelCollection(modelId) {
        this.submodelcollection = [];
        this.modelNodeslst = [];
        this.submodellst = [];

        Observable.forkJoin(

            this._modelService.geSubModelsByType(1)
                .map((response: Response) => <ISubModel[]>response.json()),
            this._modelService.geSubModelsByType(2)
                .map((response: Response) => <ISubModel[]>response.json()),
            this._modelService.geSubModelsByType(3)
                .map((response: Response) => <ISubModel[]>response.json()),
            this._securitySetService.getSecuritySetData()
                .map((response: Response) => <any[]>response.json()),
            (this.modelStatus.toLowerCase() == "pending") ?
                this._modelService.getPendingModelDetail(modelId)
                    .map((response: Response) => <IModel>response.json())
                :
                this._modelService.getModelDetail(modelId)
                    .map((response: Response) => <IModel>response.json()),

        )
            .subscribe(dataSubModel => {
                for (let i = 0; i <= dataSubModel.length; i++) {
                    switch (i) {
                        case 0:
                            this.submodelcollection.push(
                                <ICollectionSubModelTypes>{
                                    id: +this.modelTypeListEnum[this.modelTypeListEnum["1"]],
                                    typeName: this.modelTypeListEnum["1"],
                                    submodelsCollection: dataSubModel[0].sort((a, b) => b.id - a.id)
                                })

                            break
                        case 1:
                            this.submodelcollection.push(
                                <ICollectionSubModelTypes>{
                                    id: +this.modelTypeListEnum[this.modelTypeListEnum["2"]],
                                    typeName: this.modelTypeListEnum["2"],
                                    submodelsCollection: dataSubModel[1].sort((a, b) => b.id - a.id)
                                })

                            break
                        case 2:
                            this.submodelcollection.push(
                                <ICollectionSubModelTypes>{
                                    id: +this.modelTypeListEnum[this.modelTypeListEnum["3"]],
                                    typeName: this.modelTypeListEnum["3"],
                                    submodelsCollection: dataSubModel[2].sort((a, b) => b.id - a.id)
                                })

                            break
                        case 3:
                            dataSubModel[3].sort((a, b) => b.id - a.id).forEach(item => {
                                this.modelNodeslst.push({
                                    id: item.id,
                                    name: item.name,
                                    modelType: "SECURITY_SET",
                                    modelTypeId: 4,
                                    namespace: null,
                                    isFavorite: item.isFavorite,
                                    securityAsset: <ISubModelSecurityAssetType>{},
                                    level: "4",
                                    leftValue: null,
                                    rightValue: null,
                                    isSubstituted: null,
                                    substituteOf: null,
                                    children: [],
                                    isDynamic: item.isDynamic
                                })
                            });
                            this.submodelcollection.push(
                                <ICollectionSubModelTypes>{
                                    id: 4,
                                    typeName: "SecuritySet",
                                    submodelsCollection: this.modelNodeslst
                                })
                            break

                        case 4:
                            this.isUpdateStructure = (dataSubModel[4].modelDetail != null) ? true : false;
                            let data = $.extend({}, dataSubModel[4]);
                            let name = (data.name) ? data.name : data.modelDetail.name;
                            let setmodelDetailId = (data.modelDetail != null) ? data.modelDetail.modelDetailId : null;
                            this.saveTreeData = <IModelDetailSave>{
                                name: name,
                                modelDetailId: setmodelDetailId,
                                targetPercent: null,
                                lowerModelTolerancePercent: null,
                                upperModelTolerancePercent: null,
                                toleranceTypeValue: null,
                                rank: null,
                                lowerModelToleranceAmount: null,
                                upperModelToleranceAmount: null,
                                lowerTradeTolerancePercent: null,
                                upperTradeTolerancePercent: null,
                                isEdited: null,
                                isSubstituted: null,
                                substitutedOf: null,
                                children: []
                            }
                            if (data.modelDetail != null && !this.substitudeIdFromView) {
                                this.preparingDataForSave(data.modelDetail.children, this.saveTreeData.children, false);
                            }
                            //Handled to make the save work correctly for POST and PUT Methods in substituted case also
                            if (this.substitutedModelId) {
                                this.isUpdateStructure = true;
                            }
                            if (this.substitudeIdFromView) {
                                this.isUpdateStructure = false;
                            }
                            if (dataSubModel[4].modelDetail != null) {
                                this.gettingUniqueSecuritySetNamesInData(dataSubModel[4].modelDetail.children);
                                if (this.securitySetNamesArr.length != 0) {
                                    let count = 0;
                                    this.securitySetNamesArr.forEach(element => {
                                        this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(element))
                                            .subscribe(securitysetDetails => {
                                                count++;
                                                let name = securitysetDetails.name;
                                                this.securitySetDetails[name] = securitysetDetails;
                                                this.securitySetSecurities[name] = securitysetDetails.securities;
                                                if (count == this.securitySetNamesArr.length) {
                                                    this.renderChart(dataSubModel[4])
                                                }
                                            },
                                            error => {
                                                count++;
                                                if (count == this.securitySetNamesArr.length) {
                                                    this.renderChart(dataSubModel[4]);
                                                }
                                            });
                                    })
                                }
                                else {
                                    this.renderChart(dataSubModel[4]);
                                }
                            }
                            else {
                                this.renderChart(dataSubModel[4]);
                            }
                            break;
                    }
                }
            });
    }

    renderChart(data) {
        this.bulidTreeInEditMode(data);
        this.IsDynamicDisplay = data.isDynamic;
        this.modelData.emit(data);
        this.isUpdateData.emit(this.isUpdateStructure);
        this.saveTreeDataChange.emit(this.saveTreeData);
        this.subModelCollectionEvent.emit(this.submodelcollection);
    }

    bulidTreeInEditMode(modelInformation) {
        let that = this;
        that.modelInfo = modelInformation;
        that.modelNamespace = (that.modelInfo.nameSpace) ? that.modelInfo.nameSpace : (that.modelInfo.modelDetail) ? that.modelInfo.modelDetail.nameSpace : null;
        that.parsingDataIntoRequiredFormat(modelInformation);
        that.TreeDefaultData.root = that.CreateTreeEdit;
        that.postTreeChartData.emit(that.CreateTreeEdit);
        that.saveTreeData["timestampId"] = that.TreeDefaultData.root.id;
        if (that.saveTreeData.children.length != 0)
            that.AddingExtraIdAttributeInSaveFormat(that.TreeDefaultData.root.children, that.saveTreeData.children);
        that.TreeDefaultData.domElement = '.node_tree';
        d3.select('.tree_chart').remove();
        this.gettingSubstitutedNodeFromData(that.TreeDefaultData.root);
        that.addingAssetClassAttributeInData(that.TreeDefaultData.root);
        if (that.substitudeIdFromView && that.displayMode != "viewMode") {
            that.addingSubstitutedFlagInData(that.TreeDefaultData.root);
            that.findingSubstitutedNodeNameBasedOnId(that.substitudeIdFromView, that.TreeDefaultData.root);
            if (that.substitutedNode.modelTypeId) {
                let submdlLst = that.submodelcollection.filter(x => x.id == that.substitutedNode.modelTypeId);
                that.submodelList = submdlLst[0].submodelsCollection;
                if (modelInformation.isDynamic == 1 && that.substitutedNode.modelTypeId == 4) {
                    that.submodelList = submdlLst[0].submodelsCollection.filter(x => x.isDynamic == 1);
                }
                that.substituted = true;
            }
            else {
                that.renderModelTreeView();
            }
        }
        else {
            that.renderModelTreeView();
        }
    }

    findingSubstitutedNodeNameBasedOnId(id, data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.id == id) {
                that.substitutedNode.name = element.nodeName;
                that.substitutedNode.id = (element.modelTypeId == 4) ? element.securityAsset.id : element.name;
                that.substitutedNode.modelTypeId = element.modelTypeId;
                that.substituteModelName = +element.name;
                return false;
            }
            if (element.children != undefined) {
                that.findingSubstitutedNodeNameBasedOnId(id, element.children);
            }
        })
    }

    substituteReplace() {
        let that = this;
        that.substituted = false;
        let selectedDropDownName = $("#submodelTypeNamePopUp option:selected").text();
        let selectedDropDownId = $('#submodelTypeNamePopUp').val();
        if (selectedDropDownId == that.substitutedNode.id) {
            that.preparingDataForSave(that.TreeDefaultData.root.children, that.saveTreeData.children, true);
            that.AddingExtraIdAttributeInSaveFormat(that.TreeDefaultData.root.children, that.saveTreeData.children);
            that.renderModelTreeView();
        }
        else {
            if (this.substitutedNode.modelTypeId != 4) {
                this._modelService.getSubModelDetailById(+selectedDropDownId)
                    .map((response: Response) => <subModelDetail>response.json())
                    .subscribe(submodelDetails => {
                        if (submodelDetails.children.length != 0) {
                            that.addingSubstitutedValueToChildren(submodelDetails.children);
                        }
                        that.replacingSubstitutedWithNodeInData(submodelDetails, that.TreeDefaultData.root);
                        that.ArrangingValuesToPlotPie(that.TreeDefaultData.root);
                        that.preparingDataForSave(that.TreeDefaultData.root.children, that.saveTreeData.children, true);
                        that.AddingExtraIdAttributeInSaveFormat(that.TreeDefaultData.root.children, that.saveTreeData.children);
                        that.renderModelTreeView();
                    });
            }
            else {
                let submodelDetails = {
                    name: selectedDropDownName,
                    id: selectedDropDownId,
                    nameSpace: null,
                    modelType: 'SECURITY_SET',
                    modelTypeId: 4,
                    leftValue: null,
                    rightvalue: null,
                    securityAsset: { "id": +selectedDropDownId },
                    children: []
                }
                that.replacingSubstitutedWithNodeInData(submodelDetails, that.TreeDefaultData.root);
                that.ArrangingValuesToPlotPie(that.TreeDefaultData.root);
                that.preparingDataForSave(that.TreeDefaultData.root.children, that.saveTreeData.children, true);
                that.AddingExtraIdAttributeInSaveFormat(that.TreeDefaultData.root.children, that.saveTreeData.children);
                that.renderModelTreeView();
            }

        }
    }

    addingSubstitutedValueToChildren(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            element['isSubstituted'] = true;
            element['substituteOf'] = null;
            if (element.children != undefined) {
                that.addingSubstitutedValueToChildren(element.children);
            }
        });
    }

    replacingSubstitutedWithNodeInData(submodel, data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            if (element.id == that.substitudeIdFromView) {
                submodel['nodeName'] = (' ' + submodel.name).slice(1);
                submodel['name'] = (' ' + submodel.id).slice(1);
                submodel['id'] = element.id;
                submodel['targetPercent'] = element.targetPercent;
                submodel['isSubstituted'] = element.isSubstituted;
                submodel['substituteOf'] = element.substituteOf;
                submodel['lowerModelToleranceAmount'] = element.lowerModelToleranceAmount;
                submodel['lowerModelTolerancePercent'] = element.lowerModelTolerancePercent;
                submodel['lowerTradeTolerancePercent'] = element.lowerTradeTolerancePercent;
                submodel['toleranceType'] = element.toleranceType;
                submodel['toleranceTypeValue'] = element.toleranceTypeValue;
                submodel['upperModelToleranceAmount'] = element.upperModelToleranceAmount;
                submodel['upperModelTolerancePercent'] = element.upperModelTolerancePercent;
                submodel['upperTradeTolerancePercent'] = element.upperTradeTolerancePercent;
                submodel['parent'] = element.parent;
                submodel['modelDetailId'] = element.modelDetailId;
                submodel['rank'] = element.rank;
                data.splice(key, 1);
                data.splice(key, 0, submodel);
                if (submodel.children.length != 0) {
                    that.SwappingNameAndIdInData(submodel);
                    that.AddingParentAttributeInData(submodel);
                }

            }
            if (element.children != undefined) {
                that.replacingSubstitutedWithNodeInData(submodel, element.children);
            }
        })
    }

    renderModelTreeView() {
        let that = this;
        that.createSvg(that.TreeDefaultData.domElement, [that.CreateTreeEdit], "editMode");
        that.dragAndDropForHtml(that.TreeDefaultData);
        that.showingPopUpInViewModeOnDoubleClick(that.TreeDefaultData);
        that.modelDialogHeaderInputFocus();
        that.clickOnCloseChildren(that.TreeDefaultData);
    }


    // Validating the Grid SubModel , already or same name exist
    isValidateGridSubModelDetailsRecords(data) {
        let isvalid: boolean = true;
        if (this.CreateTreeEdit.children == undefined) {
            this.CreateTreeEdit.children = [];
        }
        let setChildId = [];
        let targetPercentCount = 0;

        data.children.forEach(element => {
            if (element.modelTypeId != 0 && element.id != null && element.targetPercent != null) {
                if (setChildId.length > 0) {
                    isvalid = ((setChildId.filter(x => x == element.id)).length == 0)
                }
            }
            else {
                isvalid = false;
            }
            if (isvalid) {
                targetPercentCount = (targetPercentCount == null) ? 0 : +targetPercentCount + element.targetPercent;
                isvalid = (targetPercentCount != 100) ? false : true;
            }
            setChildId.push(element.id);
            if (element.children != undefined && isvalid) {
                this.isValidateGridSubModelDetailsRecords(element);
            }
        });

        return isvalid;
    }
    isValidateGridSubModelTolerance(data) {

        let isvalid: boolean = true;
        if (this.CreateTreeEdit.children == undefined) {
            this.CreateTreeEdit.children = [];
        }
        let setChildId = [];
        let targetPercentCount = 0;

        data.children.forEach(element => {

            if (setChildId.length > 0) {
                isvalid = ((setChildId.filter(x => x == element.name)).length == 0)

            }
            setChildId.push(element.name);

            if (!isvalid) {
                element.submodelList = [];
                element.name = "0";
                element.modelTypeId = 0;
            }
            if (element.children != undefined && isvalid) {
                this.isValidateGridSubModelDetailsRecords(element);
            }
        });

        return isvalid;
    }

    private setValidtargetRank(event, gridNode, parentNodeDetails) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {
                let gridRank = gridNode.rank;
                gridNode.rank = parsetxt;
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id)
                gridNode.rank = gridRank;
                return true;
            }
            return false;
        }
        else {
            return false;

        }
    }
    private onChangeRank(event, gridNode, parentNodeDetails) {
        let parsetxt = parseInt(event.target.value + event.key);
        let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
        let minValue = event.target.min == "null" ? 0 : event.target.min;

        if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {
            let gridRank = gridNode.rank;
            gridNode.rank = parsetxt;
            this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id)
            gridNode.rank = gridRank;
            return true;
        }
        return false;

    }
    private setValidtargetLower(event, gridNode, parentNodeDetails) {
        if (this.validateEventField(event)) {
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {
                let gridlowerModelTolerancePercent = gridNode.lowerModelTolerancePercent;
                gridNode.lowerModelTolerancePercent = parsetxt;
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                gridNode.lowerModelTolerancePercent = gridlowerModelTolerancePercent;
                return true;
            }
            return false;
        }
        else {
            return false;

        }
    }

    private setValidtargetUpper(event, gridNode, parentNodeDetails) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {
                let gridupperModelTolerancePercent = gridNode.upperModelTolerancePercent;
                gridNode.upperModelTolerancePercent = parsetxt;
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                gridNode.upperModelTolerancePercent = gridupperModelTolerancePercent;
                return true;
            }
            return false;
        }
        else {
            return false;

        }
    }
    private setValidTolaranceBandGrid(event, gridNode, parentNodeDetails) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                // Calculate Amount                
                let fixedBandRange = (+(event.target.value + event.key) / 100) * gridNode.targetPercent;
                gridNode.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                gridNode.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    onChangeBandToleranceGrid(event, gridNode, parentNodeDetails) {
        let parsetxt = +(event.target.value + event.key);
        let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
        let minValue = event.target.min == "null" ? 0 : event.target.min;

        if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
            // Calculate Amount                
            let fixedBandRange = (+(event.target.value + event.key) / 100) * gridNode.targetPercent;
            gridNode.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
            gridNode.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
            this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
            return true;
        }
        else {
            return false;
        }
    }
    private setValidTargetPercent(event, gridNode, parentNodeDetails) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            // Calculate the Amount
            if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {

                gridNode.toleranceTypeValue = null;
                gridNode.upperModelTolerancePercent = null;
                gridNode.lowerModelTolerancePercent = null;
                let targetPercent = gridNode.targetPercent;
                gridNode.targetPercent = parsetxt;
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                gridNode.targetPercent = targetPercent;

                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    setGridNodeByModelType(event, gridNode, parentNodeDetails) {
        let selectedModelName = event.target.options[event.target["selectedIndex"]].text
        this.deleteDuplicateNode(this.saveTreeData.children, gridNode);
        this.UpdateDuplicateNode(this.CreateTreeEdit.children, gridNode.id, selectedModelName, "name");
        this.onChangeSubModelBindData(event, gridNode, parentNodeDetails);
        if (this.substitudeIdFromView != null && this.substitudeIdFromView != undefined) {
            if (this.substitudeIdFromView == null || this.substitudeIdFromView == 0) {
                this.substitudeIdFromView = gridNode.id;
            }
        }
    }
    addGridNodes(childNodeId, gridNode, parentNodeId) {
        let subdetails = [];
        let childId = this.timestampIncrement++;
        subdetails.push(<IModelDetails>{
            id: childId,
            name: (+gridNode.modelTypeId == 4) ? gridNode.name : (gridNode.name != null && gridNode.name != "null" && gridNode.name != "") ? childNodeId : null,
            modelDetailId: gridNode.modelDetailId,
            modelType: gridNode.modelType,
            modelTypeId: +gridNode.modelTypeId,
            rank: +gridNode.rank,
            level: null,
            targetPercent: +gridNode.targetPercent,
            toleranceTypeValue: (gridNode.toleranceTypeValue != null) ? +gridNode.toleranceTypeValue : null,
            lowerModelTolerancePercent: (gridNode.lowerModelTolerancePercent != null) ? +gridNode.lowerModelTolerancePercent : null,
            upperModelTolerancePercent: (gridNode.upperModelTolerancePercent != null) ? +gridNode.upperModelTolerancePercent : null,
            lowerModelToleranceAmount: null,
            upperModelToleranceAmount: null,
            lowerTradeTolerancePercent: (gridNode.lowerTradeTolerancePercent != null) ? +gridNode.lowerTradeTolerancePercent : null,
            upperTradeTolerancePercent: (gridNode.upperTradeTolerancePercent != null) ? +gridNode.upperTradeTolerancePercent : null,
            leftValue: null,
            rightValue: null,
            submodelList: [],
            children: [],
            values: [],
            nodeName: (gridNode.modelTypeId == 4) ? gridNode.name : (gridNode.name != null && gridNode.name != "null" && gridNode.name != "") ? childNodeId : null,
            substitutedStyle: "row-panel"

        });
        this.setGridData(this.CreateTreeEdit.children, subdetails[0], childId);
        this.bindDataToGrid(this.CreateTreeEdit.children);
        if (!this.isValidateGridSubModelTolerance(this.CreateTreeEdit)) {
            $(".info_popup").html("Please enter valid data!!..");
            this.InfoPopup = true
        }
        else {
            //this.TreeDefaultData.DroppedData.id = parentNodeId;
            this.submodelDetailslst = [];
            this.assignSubModel(this.CreateTreeEdit);
            this.saveTreeData.children = [];
            this.createSaveStructure(this.CreateTreeEdit.children, this.saveTreeData.children);
            this.submodelDetailslst = [];
            this.saveTreeDataChange.emit(this.saveTreeData);
            this.postTreeChartData.emit(this.CreateTreeEdit);
        }
    }
    deleteDuplicateNode(data, gridNode) {
        // duplicate node Delete
        data.forEach((element, key) => {
            if (element.id == gridNode.id) {
                //delete element.name
                data.splice(key, 1)
                return false;
            }

            if (element.children != undefined)
                this.deleteDuplicateNode(element.children, gridNode)

        });
    }
    UpdateAllNodeEmpty(data, nodeId) {

        data.forEach(element => {
            if (element.id == nodeId) {
                element.id = null
                element.name = null;
                element.targetPercent = null;
                element.toleranceTypeValue = null;
                element.upperModelTolerancePercent = null;
                element.lowerModelTolerancePercent = null;
                element.rank = null;
                element.nodeName = null;
                element.modelType = null;
                element.modelTypeId = 0
                element.modelDetailId = null;
                element.children = [];
                element.submodelList = [];
            }
            if (element.children != undefined) {
                this.UpdateAllNodeEmpty(element.children, nodeId);
            }

        });
    }
    UpdateDuplicateNode(data, nodeId, updateParamValue, paramName) {

        data.forEach(element => {
            if (element.id == nodeId) {
                switch (paramName) {
                    case "name":
                        // this.TreeDefaultData.uniqueId = new Date().getTime();
                        // element.id = parseInt(updateParamValue) + this.TreeDefaultData.uniqueId
                        element.id = this.timestampIncrement++;
                        element.name = element.id;
                        element.nodeName = updateParamValue;
                        break;

                    case "targetPercent":
                        element.targetPercent = updateParamValue;
                        break;

                    case "toleranceTypeValue":
                        element.toleranceTypeValue = updateParamValue;
                        break;

                    case "upperModelTolerancePercent":
                        element.upperModelTolerancePercent = updateParamValue;
                        break;

                    case "lowerModelTolerancePercent":
                        element.lowerModelTolerancePercent = updateParamValue;
                        break;

                    case "rank":
                        element.rank = updateParamValue;
                        break;
                }
            }

            if (element.children != undefined) {
                this.UpdateDuplicateNode(element.children, nodeId, updateParamValue, paramName);
            }

        });
    }

    addSubModelForGridChild(gridNodemodel: IModelDetails, parenetGridNode) {
        if (this.isValidateGridSubModelDetailsRecords(this.CreateTreeEdit)) {
            // this.TreeDefaultData.DroppedData.id = gridNodemodel.id;
            let submodelDetailsData = [];
            let getmodelId = +gridNodemodel.modelTypeId + 1;
            submodelDetailsData.push(<IModelDetails>{
                id: null,
                name: null,
                modelDetailId: null,
                modelType: this.modelTypeListEnum[getmodelId],
                modelTypeId: getmodelId,
                rank: 0,
                level: null,
                targetPercent: null,
                toleranceTypeValue: null,
                lowerModelTolerancePercent: null,
                upperModelTolerancePercent: null,
                lowerModelToleranceAmount: null,
                upperModelToleranceAmount: null,
                lowerTradeTolerancePercent: null,
                upperTradeTolerancePercent: null,
                leftValue: null,
                rightValue: null,
                submodelList: [],
                children: [],
                values: [],
                submodelDataLsit: [],
                submodelTypes: [],
                nodeName: null,
                substitutedStyle: "row-panel"
            });
            this.AttachingGrdiData(this.CreateTreeEdit.children, submodelDetailsData, gridNodemodel.id);
        }
        else {
            $(".info_popup").html("Information added in not correct!..");
            this.InfoPopup = true
        }
    }
    isValidStructure() {
        this.isSubsitituteTree(this.CreateTreeEdit);
        this.isValidateData(this.CreateTreeEdit);
        // if (this.isvalid) {
        if (this.toleranceTypePer) {
            this.bindTolerancebandToAll(this.toleranceTypePer);
        }
        return this.isvalid;
    }
    isValidateData(data) {

        if (this.CreateTreeEdit.children == undefined) {
            this.CreateTreeEdit.children = [];
        }
        let setChildId = [];
        let targetPercentCount = 0;

        data.children.forEach(element => {
            if (element.modelTypeId != 0 && element.id != null && element.targetPercent != null && element.name != null && element.name != "null") {
                if (setChildId.length > 0) {
                    this.isvalid = ((setChildId.filter(x => x == element.id)).length == 0)
                }
                this.isvalid = true;
            }
            else {
                this.isvalid = false;
                return false;
            }
            if (this.isvalid) {
                targetPercentCount = (targetPercentCount == null) ? 0 : +targetPercentCount + element.targetPercent;
                this.isvalid = (targetPercentCount != 100) ? false : true;
            }
            setChildId.push(element.id);
            if (element.children != undefined && this.isvalid && element.children.length > 0) {
                this.isValidateData(element);
            }
        });
    }
    isDisableAddSubModelInGrid(contextName, gridNode) {
        if (this.displayMode != "viewMode") {
            return (this.isvalid && gridNode.modelTypeId != 4) ? this.displaycsstoGrid(gridNode, contextName) :
                (gridNode.modelTypeId == 4 && contextName != "Add" && gridNode.name != "" && gridNode.name != null && gridNode.name != "null") ? this.displaycsstoGrid(gridNode, contextName) : (contextName != "Remove") ? "linkdisabled" : "grid-context-link";
        }
        else {
            return "grid-context-link";
        }
    }
    displaycsstoGrid(gridNode, contextName) {
        if (this.substitudeIdFromView != null && this.substitudeIdFromView != undefined) {
            if (this.substitudeIdFromView == gridNode.id) {
                return (contextName != "Delete") ? "grid-context-link" : (contextName != "Remove") ? "linkdisabled" : "grid-context-link";
            }
            else {
                return "grid-context-link";
            }
        }
        else {
            return "grid-context-link";
        }
    }
    createSaveStructure(data, saveData) {
        let that = this;
        data.forEach((element, key) => {
            let modelDetailId = (element.modelDetailId) ? element.modelDetailId : null;
            let saveTreeChildren = <IModelDetailChildernSave>{
                id: +element.name,
                name: element.nodeName,
                modelDetailId: modelDetailId,
                modelTypeId: element.modelTypeId,
                targetPercent: element.targetPercent,
                lowerModelTolerancePercent: element.lowerModelTolerancePercent,
                upperModelTolerancePercent: element.upperModelTolerancePercent,
                toleranceTypeValue: element.toleranceTypeValue,
                lowerModelToleranceAmount: element.lowerModelToleranceAmount,
                upperModelToleranceAmount: element.upperModelToleranceAmount,
                lowerTradeTolerancePercent: element.lowerTradeTolerancePercent,
                upperTradeTolerancePercent: element.upperTradeTolerancePercent,
                rank: element.rank,
                isEdited: null,
                isSubstituted: element.isSubstituted,
                substitutedOf: element.substitutedOf,
                children: []
            }
            saveData[key] = saveTreeChildren
            if (element.children != undefined) {
                that.createSaveStructure(element.children, saveData[key].children);
            }
        })

    }

    private validTargetPercent(event, gridNode) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            //   return (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max);

            // Calculate the Amount
            if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                gridNode.toleranceTypeValue = null;
                gridNode.upperModelTolerancePercent = null;
                gridNode.lowerModelTolerancePercent = null;
                return true;
            }
            else {
                return false;
            }

        }
        else {
            return false;
        }
    }
    onChangeBandTolerance(event, gridNodemodel) {
        let parsetxt = +(event.target.value);
        let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
        let minValue = event.target.min == "null" ? 0 : event.target.min;

        if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
            // Calculate Amount                
            let fixedBandRange = ((event.target.value) / 100) * gridNodemodel.targetPercent;
            gridNodemodel.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
            gridNodemodel.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
            return true;
        }
        else {
            return false;
        }
    }

    private validTolaranceBand(event, gridNodemodel) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                // Calculate Amount                
                let fixedBandRange = ((event.target.value + event.key) / 100) * gridNodemodel.targetPercent;
                gridNodemodel.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                gridNodemodel.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    }

    private validtarUpperPercent(event, subModelDetail) {
        if (this.validateEventField(event)) {
            let parsetxt = +(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            return (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max);
        }
        else {
            return false;
        }
    }
    validatePercentKeyDown(event, subModelDetails, tolerancepercentType) {
        let parsetxt = event.target.value;
        if (tolerancepercentType == "upperModelTolerancePercent") {
            if (subModelDetails.upperModelTolerancePercent != parsetxt) {
                subModelDetails.toleranceTypeValue = null;
            }
        }
        else if (tolerancepercentType == "lowerModelTolerancePercent") {
            if (subModelDetails.lowerModelTolerancePercent != parsetxt) {
                subModelDetails.toleranceTypeValue = null;
            }
        }
    }
    griddisplaySubModel(event, submodelLst, parentNodeDetails, selectedid) {
        submodelLst.id = null;
        submodelLst.submodelList = [];
        let selectedSubModelTypetarget = +event.target.value;
        if (selectedSubModelTypetarget) {
            submodelLst.modelTypeId = selectedSubModelTypetarget;
            if (selectedSubModelTypetarget == 4) {
                if (submodelLst.name != null) {
                    let that = this;
                    that.linkedAssetClass = [];
                    that.addingAssetClassAttributeInData(that.TreeDefaultData.root);
                    that.getAssestIdByParentNodes(that.CreateTreeEdit.children, parentNodeDetails.id)
                    if (that.linkedAssetClass.length > 0) {
                        let params = {
                            assetCategoryId: null,
                            assetClassId: null,
                            assetSubClassId: null
                        };
                        that.linkedAssetClass.forEach(elementAssestId => {
                            switch (elementAssestId.type) {
                                case 1:
                                    params.assetCategoryId = elementAssestId.id;
                                    break;
                                case 2:
                                    params.assetClassId = elementAssestId.id;
                                    break;
                                case 3:
                                    params.assetSubClassId = elementAssestId.id;
                                    break;
                            }
                        });
                        let urlQuery = that.buildUrl(params);
                        that._securitySetService.getSecuritySetByAssestId(urlQuery)
                            .map((response: Response) => <any[]>response.json())
                            .subscribe(securitySetData => {
                                if (securitySetData.length > 0) {
                                    submodelLst.submodelList = securitySetData;
                                    if (this.IsDynamicDisplay) {
                                        submodelLst.submodelList = submodelLst.submodelList.filter(x => x.isDynamic);
                                    }
                                    submodelLst.name = null;
                                    that.selectedgridNode = "";
                                }
                                else {
                                    $(".info_popup").html("Restricted Usage. The Asset Class definition for the securities in the SecuritySet should match the Sub-model linking definition")
                                    that.InfoPopup = true;
                                    this.trackByContextmenu("Remove", submodelLst, parentNodeDetails)
                                }
                            });
                    }
                    else {
                        submodelLst.submodelList = that.submodelcollection.filter(x => x.id == selectedSubModelTypetarget)[0].submodelsCollection.sort((a, b) => b.id - a.id);
                        if (this.IsDynamicDisplay) {
                            submodelLst.submodelList = submodelLst.submodelList.filter(x => x.isDynamic);
                        }
                        submodelLst.name = null;
                        that.selectedgridNode = "";
                    }
                }
                else {
                    submodelLst.submodelList = this.submodelcollection.filter(x => x.id == selectedSubModelTypetarget)[0].submodelsCollection.sort((a, b) => b.id - a.id);
                    if (this.IsDynamicDisplay) {
                        submodelLst.submodelList = submodelLst.submodelList.filter(x => x.isDynamic);
                    }
                    submodelLst.name = null;
                    this.selectedgridNode = "";
                }
            }
            else {
                submodelLst.submodelList = this.submodelcollection.filter(x => x.id == selectedSubModelTypetarget)[0].submodelsCollection.sort((a, b) => b.id - a.id);
                submodelLst.name = null;
                this.selectedgridNode = "";
            }
        }
        else {
            submodelLst.id = selectedid;
            this.deleteDuplicateNode(this.saveTreeData.children, submodelLst);
            this.UpdateAllNodeEmpty(this.CreateTreeEdit.children, submodelLst.id)

            if (this.CreateTreeEdit.children == undefined || this.CreateTreeEdit.children.length == 0) {
                this.CreateTreeEdit.children.push(
                    <IModelDetails>{
                        id: null,
                        name: null,
                        modelDetailId: null,
                        modelType: null,
                        modelTypeId: 0,
                        rank: 0,
                        level: null,
                        targetPercent: null,
                        toleranceTypeValue: null,
                        lowerModelTolerancePercent: null,
                        upperModelTolerancePercent: null,
                        lowerModelToleranceAmount: null,
                        upperModelToleranceAmount: null,
                        lowerTradeTolerancePercent: null,
                        upperTradeTolerancePercent: null,
                        leftValue: null,
                        rightValue: null,
                        submodelList: [],
                        children: [],
                        values: [],
                        nodeName: null,
                        substitutedStyle: "row-panel"

                    });
            }
            else {
                let subdetails = [];
                let childId = this.timestampIncrement++;
                subdetails.push(<IModelDetails>{
                    id: null,
                    name: null,
                    modelDetailId: null,
                    modelType: null,
                    modelTypeId: 0,
                    rank: 0,
                    level: null,
                    targetPercent: null,
                    toleranceTypeValue: null,
                    lowerModelTolerancePercent: null,
                    upperModelTolerancePercent: null,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null,
                    submodelList: [],
                    children: [],
                    values: [],
                    nodeName: null,
                    substitutedStyle: "row-panel"

                });

                this.setGridData(this.CreateTreeEdit.children, subdetails[0], submodelLst.id);

                //this.TreeDefaultData.DroppedData.id = parentNodeDetails.id;
                this.submodelDetailslst = [];
                this.assignSubModel(this.CreateTreeEdit);
                this.preparingDataForSaveAfterDrag(this.submodelDetailslst[this.submodelDetailslst.length - 1], this.TreeDefaultData.parsedSaveData);
                this.AddingExtraIdAttributeInSaveFormat(this.submodelDetailslst[this.submodelDetailslst.length - 1], this.TreeDefaultData.parsedSaveData);
                this.AttachingTheDraggedNodeAtCorrectPositionForsavingGrid(this.saveTreeData, this.TreeDefaultData.parsedSaveData, parentNodeDetails.id);
                this.submodelDetailslst = [];
                this.saveTreeDataChange.emit(this.saveTreeData);
                this.postTreeChartData.emit(this.CreateTreeEdit);
            }

        }
    }
    bindDataToGrid(data) {
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId != 0 && element.modelTypeId != null) {
                //element.id = (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.id : element.id;
                let submdlLst = this.submodelcollection.filter(x => x.id == element.modelTypeId)
                if (element.modelTypeId == 4) {
                    if (element.submodelList != undefined) {
                        element.submodelList = (element.submodelList.length > 0) ? element.submodelList : submdlLst[0].submodelsCollection;
                    }
                    else {
                        element.submodelList = submdlLst[0].submodelsCollection;
                    }
                }
                else {
                    element.submodelList = submdlLst[0].submodelsCollection;
                }
                // element.submodelTypes = this.gettingRequiredListFromId(element.modelTypeId);
                element.submodelTypes = (element.submodelTypes == undefined) ? this.gettingRequiredListFromId(element.modelTypeId) : (element.submodelTypes.length > 0) ? element.submodelTypes : this.gettingRequiredListFromId(element.modelTypeId);
                element.name = (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.name : element.name;
            }
            else {
                element.submodelList = [];
                // element.submodelTypes = this.gettingRequiredListFromId(element.modelTypeId);
                element.submodelTypes = (element.submodelTypes == undefined) ? this.gettingRequiredListFromId(element.modelTypeId) : (element.submodelTypes.length > 0) ? element.submodelTypes : this.gettingRequiredListFromId(element.modelTypeId);
                element.name = null
            }
            if (element.rank == null) {
                element.rank = 0;
            }
            if (element.children != undefined) {
                this.bindDataToGrid(element.children);
            }
        })
    }
    updateUpperAndLowerToleranceByFixedBand(event) {
        if (this.validateEventField(event)) {
            let parsetxt = (event.target.value + event.key);
            if (!isNaN(parsetxt)) {
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                if ((parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                    this.bindTolerancebandInGrid(parsetxt);
                    return true;
                }
                return false;
            }
            else {
                this.bindTolerancebandInGrid(null);
                return true;
            }
        }
        else {
            return false;
        }
    }
    bindTolerancebandInGrid(toleranceTypePer) {
        this.updateByFixedBand(this.CreateTreeEdit.children, toleranceTypePer);
        this.saveTreeData.children = [];
        this.createSaveStructure(this.CreateTreeEdit.children, this.saveTreeData.children);
        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
    }
    bindTolerancebandToAll(toleranceTypePer) {
        this.updateByFixedBandALL(this.CreateTreeEdit.children, toleranceTypePer);
        this.saveTreeData.children = [];
        this.createSaveStructure(this.CreateTreeEdit.children, this.saveTreeData.children);
        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
    }
    updateByFixedBandALL(data, settolranceband) {
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.targetPercent != null && element.targetPercent != 0) {
                element.toleranceTypeValue = settolranceband;
                if (settolranceband != null) {
                    let fixedBandRange = (settolranceband / 100) * element.targetPercent;
                    element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                    element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                }
            }
            else {
                element.upperModelTolerancePercent = null;
                element.lowerModelTolerancePercent = null;
            }

            if (element.children != undefined) {
                this.updateByFixedBand(element.children, settolranceband);
            }
        })
    }

    updateByFixedBand(data, settolranceband) {
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.targetPercent != null && element.targetPercent != 0) {
                element.toleranceTypeValue = settolranceband;
                if (settolranceband != null) {
                    let fixedBandRange = (settolranceband / 100) * element.targetPercent;
                    element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                    element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                }
            }

            if (element.children != undefined) {
                this.updateByFixedBand(element.children, settolranceband);
            }
        })
    }
    updateFixedBandByKeyUp(event) {
        this.toleranceTypePer = (!isNaN(parseInt(event.target.value)) ? (event.target.value) : null);
        this.bindTolerancebandInGrid(this.toleranceTypePer);
    }
    setPortfolioId(_portfolioId) {
        this.portfolioIdFromView = _portfolioId;
        this.contextMenuItems = [];
        if (this.displayMode == "viewMode" && this.portfolioIdFromView && !this.substitutedModelId && !this.portfolioPending) {
            this.contextMenuItems.push(
                { Id: 1, name: "Copy" },
                { Id: 2, name: "Substitute" },
                { Id: 3, name: "Rebalnce" });
        }
        else {
            this.contextMenuItems.push(
                { Id: 1, name: "Copy" },
                { Id: 2, name: "Rebalnce" });
        }
    }

    onChangeSubModelBindData(event, gridNode, parentNodeDetails) {
        if (gridNode.modelTypeId != 4) {
            if (event.target.value != "null") {
                this._modelService.getSubModelDetailById(+event.target.value)
                    .map((response: Response) => <subModelDetail>response.json())
                    .subscribe(submodelDetails => {
                        let subdetails = [];
                        subdetails.push(<IModelDetails>{
                            id: gridNode.id,
                            name: gridNode.name,
                            modelDetailId: gridNode.modelDetailId,
                            modelType: submodelDetails.modelType,
                            modelTypeId: submodelDetails.modelTypeId,
                            rank: (gridNode.rank != null) ? gridNode.rank : 0,
                            level: null,
                            targetPercent: gridNode.targetPercent,
                            toleranceTypeValue: gridNode.toleranceTypeValue,
                            lowerModelTolerancePercent: gridNode.lowerModelTolerancePercent,
                            upperModelTolerancePercent: gridNode.upperModelTolerancePercent,
                            lowerModelToleranceAmount: null,
                            upperModelToleranceAmount: null,
                            lowerTradeTolerancePercent: gridNode.lowerTradeTolerancePercent,
                            upperTradeTolerancePercent: gridNode.upperTradeTolerancePercent,
                            leftValue: null,
                            rightValue: null,
                            submodelList: [],
                            children: submodelDetails.children,
                            values: [],
                            nodeName: gridNode.nodeName,
                            substitutedStyle: "row-panel"
                        });
                        this.assignDataSaveTree(subdetails, gridNode, parentNodeDetails);
                    });
            }
            else {
                let subdetails = [];
                subdetails.push(<IModelDetails>{
                    id: null,
                    name: null,
                    modelDetailId: gridNode.modelDetailId,
                    modelType: gridNode.modelType,
                    modelTypeId: gridNode.modelTypeId,
                    rank: gridNode.rank,
                    level: null,
                    targetPercent: null,
                    toleranceTypeValue: null,
                    lowerModelTolerancePercent: null,
                    upperModelTolerancePercent: null,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null,
                    submodelList: [],
                    children: [],
                    values: [],
                    nodeName: null,
                    substitutedStyle: "row-panel"
                });
                this.assignDataSaveTree(subdetails, gridNode, parentNodeDetails);
            }
        }
        else {
            let subdetails = [];
            subdetails.push(<IModelDetails>{
                id: gridNode.id,
                name: event.target.value,
                modelDetailId: gridNode.modelDetailId,
                modelType: "Security Set",
                modelTypeId: 4,
                rank: gridNode.rank,
                level: null,
                targetPercent: gridNode.targetPercent,
                toleranceTypeValue: gridNode.toleranceTypeValue,
                lowerModelTolerancePercent: gridNode.lowerModelTolerancePercent,
                upperModelTolerancePercent: gridNode.upperModelTolerancePercent,
                lowerModelToleranceAmount: null,
                upperModelToleranceAmount: null,
                lowerTradeTolerancePercent: gridNode.lowerTradeTolerancePercent,
                upperTradeTolerancePercent: gridNode.upperTradeTolerancePercent,
                leftValue: null,
                rightValue: null,
                submodelList: [],
                children: [],
                values: [],
                nodeName: gridNode.nodeName,
                substitutedStyle: "row-panel"
            });
            this.assignDataSaveTree(subdetails, gridNode, parentNodeDetails);
        }

    }

    assignDataSaveTree(subdetails, gridNode, parentNodeDetails) {
        this.SwappingNameAndIdInData(subdetails[0]);
        this.setGridData(this.CreateTreeEdit.children, subdetails[0], gridNode.id);
        if (!this.isValidateGridSubModelTolerance(this.CreateTreeEdit)) {
            this.UpdateAllNodeEmpty(this.CreateTreeEdit.children, gridNode.id)
            $(".info_popup").html("Information provided is not valid.");
            this.InfoPopup = true
        }
        else {
            // this.TreeDefaultData.DroppedData.id = parentNodeDetails.id;
            this.submodelDetailslst = [];
            this.assignSubModel(this.CreateTreeEdit);
            //prepare
            this.saveTreeData.children = [];
            this.createSaveStructure(this.CreateTreeEdit.children, this.saveTreeData.children);

            this.bindDataToGrid(this.CreateTreeEdit.children);

        }
    }

    // on clcick of context Menu from Grid Node Level
    trackByContextmenu(selectedcontextItem, gridNodemodel, parenetGridNode) {
        switch (selectedcontextItem) {
            case "Add":
                this.addSubModelForGridChild(gridNodemodel, parenetGridNode);
                break;

            case "Delete":
                this.deleteSubModelIdByModelTypeId = +gridNodemodel.modelTypeId;
                this.subModelCollectionEvent.emit(this.submodelcollection);
                this.selectedId = +gridNodemodel.id;
                this.subModelId = +gridNodemodel.name;
                this.selectedDomNodeId = +gridNodemodel.id;
                this.deleteSubModelNodeFromGrid(+gridNodemodel.name);
                break;

            case "Remove":
                this.removeSubModelNodeFromGrid(gridNodemodel, parenetGridNode);
                break;

            case "Copy":
                this.modelName = gridNodemodel.nodeName;
                this.copyModel = true;
                break;

            case "Substitute":
                this._router.navigate(['/eclipse/model/viewstructure/', + this.modelId, this.modelStatus, gridNodemodel.id]);
                break;

            case "Rebalance":
                this.handleRebalance(this.modelId);
                break;

            default:
                break;
        }

        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
    }
    // on clcick of context Menu from Grid Node Level
    trackByContextmenuModel(selectedcontextItem) {
        let that = this;
        that.isChangeDetectionRef = true;
        that.isUpdateData.emit("isChangeDetectionRef");
        $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
        switch (selectedcontextItem) {

            case "Add":
                that.AddSubModelForGridEmpty();
                break;

            case "Delete":
                that.deleteSubModelNodeFromGrid(+that.CreateTreeEdit.name);
                break;

            case "Copy":
                that.modelName = that.CreateTreeEdit.nodeName;
                that.copyModel = true;
                break;

            case "Substitute":
                that._router.navigate(['/eclipse/model/viewstructure/', + that.modelId, that.modelStatus, that.CreateTreeEdit.id]);
                break;

            case "Rebalance":
                that.handleRebalance(that.modelId);
                break;
            default:
                break;
        }

        that.saveTreeDataChange.emit(that.saveTreeData);
        that.postTreeChartData.emit(that.CreateTreeEdit);
    }
    removeSubModelNodeFromGrid(gridNodemodel, parenetGridNode) {
        this.unassociationOfItsChildrenFromTheTree(gridNodemodel.id, this.CreateTreeEdit.children, "data");
        this.unassociationOfItsChildrenFromTheTree(gridNodemodel.id, this.saveTreeData, "data");
        this.bindDataToGrid(this.CreateTreeEdit.children);
    }
    deleteSubModelNodeFromGrid(subModelid) {
        //sub model deletion 
        this.responseToObject<any>(this._modelService.canDeleteSubModel(subModelid, this.modelId))
            .subscribe(response => {
                this.canDeleteSubModel = true;
                this.bindDataToGrid(this.CreateTreeEdit.children);
            },
            error => {
                $(".info_popup").html("The sub-model cannot be deleted as it is being currently used by other Models/ Sub-model");
                this.InfoPopup = true;
                this.bindDataToGrid(this.CreateTreeEdit.children);
            })
    }
    displayChartByModelStaus(_modelstatus, modelId) {
        this.isApprovedTab = (_modelstatus.toLowerCase() == "pending") ? false : true;
        this.substitutedModelId = (modelId != +this.modelId) ? modelId : undefined;
        this.substitudeIdFromView = null;
        this.timestampIncrement = 1;
        Observable.forkJoin(
            (_modelstatus.toLowerCase() == "pending") ?
                this._modelService.getPendingModelDetail(modelId)
                    .map((response: Response) => <IModel>response.json())
                :
                this._modelService.getModelDetail(modelId)
                    .map((response: Response) => <IModel>response.json()),

        )
            .subscribe(dataSubModel => {
                $(".node_tree").empty();
                let setmodelDetailId = (dataSubModel[0].modelDetail != null) ? dataSubModel[0].modelDetail.modelDetailId : null;
                this.CreateTreeEdit = <CreateTree>{
                    name: null,
                    id: null,
                    parent: null,
                    modelType: "Parent Node",
                    modelDetailId: setmodelDetailId,
                    nodeName: null,
                    targetPercent: null,
                    lowerModelTolerancePercent: null,
                    upperModelTolerancePercent: null,
                    children: [],
                    values: [],
                    submodelDataLsit: [],
                    submodelTypes: [],
                    selectedsubmodelType: null,
                    substitutedStyle: "row-panel",
                    isSubstituted: null,
                    substitutedOf: null
                }
                this.isUpdateStructure = (dataSubModel[0].modelDetail != null) ? true : false;
                let data = $.extend({}, dataSubModel[0]);
                if (_modelstatus.toLowerCase() == "pending" && data.modelDetail == null) {
                    this.isDisableEdit = true;
                    this.saveTreeDataChange.emit(this.isDisableEdit);
                    this.postTreeChartData.emit(this.CreateTreeEdit);
                    d3.select(".node_tree")
                        .append("div")
                        .attr("class", "no_pending")
                        .html("No Pending edits to show");
                }
                else {
                    this.saveTreeData = <IModelDetailSave>{
                        name: (data.modelDetail != null) ? data.modelDetail.name : data.name,
                        modelDetailId: null,
                        targetPercent: null,
                        lowerModelTolerancePercent: null,
                        upperModelTolerancePercent: null,
                        toleranceTypeValue: null,
                        rank: null,
                        lowerModelToleranceAmount: null,
                        upperModelToleranceAmount: null,
                        lowerTradeTolerancePercent: null,
                        upperTradeTolerancePercent: null,
                        children: []
                    }
                    if (data.modelDetail != null) {
                        this.preparingDataForSave(data.modelDetail.children, this.saveTreeData.children, false);
                    }
                    this.gettingSubstitutedNodeFromData(dataSubModel[0]);
                    if (dataSubModel[0].modelDetail != null) {
                        this.gettingUniqueSecuritySetNamesInData(dataSubModel[0].modelDetail.children);
                        if (this.securitySetNamesArr.length != 0) {
                            let count = 0;
                            this.securitySetNamesArr.forEach(element => {
                                this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(element))
                                    .subscribe(securitysetDetails => {
                                        count++;
                                        let name = securitysetDetails.name;
                                        this.securitySetDetails[name] = securitysetDetails;
                                        this.securitySetSecurities[name] = securitysetDetails.securities;
                                        if (count == this.securitySetNamesArr.length) {
                                            this.reRenderingChart(dataSubModel[0])
                                        }
                                    },
                                    error => {
                                        count++;
                                        if (count == this.securitySetNamesArr.length) {
                                            this.reRenderingChart(dataSubModel[0]);
                                        }
                                    });
                            })
                        }
                        else {
                            this.reRenderingChart(dataSubModel[0]);
                        }
                    }
                    else {
                        this.reRenderingChart(dataSubModel[0]);
                    }
                }
            },
            error => {
                this.CreateTreeEdit.children = [];
                this.saveTreeData.children = [];
                this.saveTreeDataChange.emit(this.saveTreeData);
                this.postTreeChartData.emit(this.CreateTreeEdit);
            })
    }

    reRenderingChart(data) {
        this.bulidTreeInEditMode(data);
        //Handled to make the save work correctly for POST and PUT Methods in substituted case also
        if (this.substitutedModelId) {
            this.isUpdateStructure = true;
        }
        if (this.substitudeIdFromView) {
            this.isUpdateStructure = false;
        }
        this.isUpdateData.emit(this.isUpdateStructure);
        this.saveTreeDataChange.emit(this.saveTreeData);
        this.postTreeChartData.emit(this.CreateTreeEdit);
        this.saveTreeData.children = [];
        //this.createSaveStructure(this.CreateTreeEdit.children, this.saveTreeData.children);
        this.isDisableEdit = false;
        this.saveTreeDataChange.emit(this.isDisableEdit);
    }

    gettingSubstitutedNodeFromData(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.isSubstituted == 1) {
                element.substitutedStyle = "row-panel";
                that.substitudeIdFromView = element.id;
                if (element.children != undefined) {
                    that.addingSubstituteFlagInChildren(element.children);
                }
                return false;
            }
            else {
                element.substitutedStyle = (!this.substitutedModelId) ? "row-panel" : "row-panel tabledisabled";
            }
            if (element.children != undefined) {
                that.gettingSubstitutedNodeFromData(element.children);
            }
        });
    }

    isblurNode(gridNodeId) {
        if (this.substitudeIdFromView != null && this.substitudeIdFromView != undefined) {
            return (this.substitudeIdFromView != gridNodeId) ? "row-panel tabledisabled" : "row-panel";
        }
        else {
            return (this.substitutedModelId) ? "row-panel tabledisabled" : "row-panel";
        }
    }

    isSubsitituteTree(data) {

        if (this.CreateTreeEdit.children == undefined) {
            this.CreateTreeEdit.children = [];
        }

        data.children.forEach(element => {
            if (this.substitudeIdFromView != null && this.substitudeIdFromView != undefined) {
                if (+element.id == this.substitudeIdFromView) {
                    this.isparentNodeSubstituted = true;
                    element.substitutedStyle = "row-panel";
                    element.isSubstituted = true;
                    element.substitutedOf = +element.name;
                }
                else if (element.isSubstituted) {
                    this.isparentNodeSubstituted = true;
                    element.substitutedStyle = "row-panel";
                    element.isSubstituted = true;
                    element.substitutedOf = +element.name;
                }
                else {
                    element.substitutedStyle = (this.isparentNodeSubstituted) ? "row-panel" : "row-panel tabledisabled";
                }
                if (element.children != undefined) {
                    this.isSubsitituteTree(element);
                }
            }
            else {

                element.substitutedStyle = "row-panel";
            }
        });
        this.isparentNodeSubstituted = false;
    }


    setSubstitutedModelId(id) {
        this.substitutedModelId = id;
    }
    setReadonly() {
        return "table treeview"
    }

    private setTargetPercentKeyup(event, gridNode, parentNodeDetails) {
        if (event.key == "Backspace") {
            if (this.validateEventField(event)) {
                let parsetxt = (event.target.value + event.key);
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                // Calculate the Amount
                //if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                gridNode.toleranceTypeValue = null;
                gridNode.upperModelTolerancePercent = null;
                gridNode.lowerModelTolerancePercent = null;
                let targetPercent = gridNode.targetPercent;
                gridNode.targetPercent = parsetxt;
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                gridNode.targetPercent = targetPercent;
                return true;
                // }
                // else {
                //      return false;
                //  }
            }
            else {
                return false
            }
        }


    }
    private setTolaranceBandKeyUp(event, gridNode, parentNodeDetails) {
        if (event.key == "Backspace") {
            if (this.validateEventField(event)) {
                let parsetxt = (gridNode.toleranceTypeValue);
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                // if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                // Calculate Amount   
                if (gridNode.toleranceTypeValue != "" && gridNode.toleranceTypeValue != null) {
                    let fixedBandRange = ((gridNode.toleranceTypeValue) / 100) * gridNode.targetPercent;
                    gridNode.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
                    gridNode.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
                }
                else {
                    gridNode.toleranceTypeValue = null
                }

                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                return true;
                // }
                // else {
                //     return false;
                // }
            }
            else {
                return false;
            }
        }

    }
    private setTargetUpperKeyUp(event, gridNode, parentNodeDetails) {
        if (event.key == "Backspace") {
            if (this.validateEventField(event)) {
                let parsetxt = (gridNode.upperModelTolerancePercent);
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                //if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {               
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                return true;
                // }
                // return false;
            }
            else {
                return false;

            }
        }
    }
    private setTargetLowerKeyUp(event, gridNode, parentNodeDetails) {
        if (event.key == "Backspace") {
            if (this.validateEventField(event)) {
                let parsetxt = (gridNode.lowerModelTolerancePercent);
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                // if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {               
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                return true;
                //}
                // return false;
            }
            else {
                return false;

            }
        }
    }
    private setTargetRankKeyUp(event, gridNode, parentNodeDetails) {
        if (event.key == "Backspace") {
            if (this.validateEventField(event)) {
                let parsetxt = +(gridNode.rank);
                let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
                let minValue = event.target.min == "null" ? 0 : event.target.min;

                // if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {             
                this.addGridNodes(parsetxt, gridNode, parentNodeDetails.id);
                return true;
                // }
                // return false;
            }
            else {
                return false;

            }
        }
    }

    validateEventField(event) {
        if (event.key != undefined) {
            if (event.target.max > 10) {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*" || event.key == "=") {
                    return false;
                }

                if (event.target.value.includes(".")) {
                    if (event.key == ".") {
                        return false
                    }
                }
                // if (event.key != ".") {
                //     let regexvalidate = /^[0-9]+(\.[0-9]{1,2})?$/;
                //     let valueTarget = event.target.value + event.key;
                //     let result = regexvalidate.test(valueTarget);
                //     return result;
                // }
                return true;
            }
            else {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*" || event.key == "." || event.key == "=") {
                    return false;
                }
                // if (event.key != ".") {
                //     let regexvalidate = /^[0-9]+(\.[0-9]{1,2})?$/;
                //     let result = regexvalidate.test(event.target.value + event.key);
                //     return result;
                // }
                return true;
            }
        }
        return false;

    }
    buildUrl(parameters) {
        let Querystring = "";
        let qs = "";
        for (let key in parameters) {
            let value = parameters[key];
            if (value != null)
                qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
        }
        if (qs.length > 0) {
            qs = qs.substring(0, qs.length - 1);
            Querystring = Querystring + "?" + qs;
        }
        return Querystring;
    }
    getAssestIdByParentNodes(gridNode, parentid) {
        //  securitySetAssestid     
        gridNode.forEach(element => {
            if (element.id != null) {
                this.setParentId.push({ "id": element.id, "typeId": element.modelTypeId, "assestid": element.assetClass });
                if (element.id == parentid) {
                    this.assignAssestClass();
                }
            }
            if (element.children.length > 0) {
                if (element.children[0].id != null) {
                    this.getAssestIdByParentNodes(element.children, parentid);
                }
            }
        });
        this.setParentId = [];
    }

    assignAssestClass() {
        let that = this;
        that.setParentId.forEach(element => {
            that.linkedAssetClass.push({ "type": element.typeId, "id": element.assestid });
        });

    }

    eventEmitDoubleClickName(event) {
        if (this.nodeType != "Security Set") {
            this.isreadonlyName = false;
        }
    }
    eventEmitDoubleClickNameSpace(event) {
        if (this.nodeType != "Security Set") {
            this.isreadonlyNameSpace = false;
        }
    }
    @HostListener('focusout', ['$event.target'])
    onFocusout(target) {
        this.isreadonlyNameSpace = true;
        this.isreadonlyName = true;
        // $("#context-dd-menu").css({ display: 'none' });

    }

    @HostListener('click', ['$event.target'])
    onClick(target) {
        if ($(target).html() == "CANCEL" || $(target).attr("class") == "fa fa-fw fa-close") {
            this.copiedModelName = "";
            this.copiedSubModelName = "";
        }
        $("#context-dd-menu").css({ display: 'none' });
    }
    onToggleChange() {
        this.ArrangingValuesToPlotPie(this.CreateTreeEdit);
        d3.select('.tree_chart').remove();
        this.createSvg(this.TreeDefaultData.domElement, [this.CreateTreeEdit], "editMode");
    }

    /** Handles Rebalance based on selected Model */
    handleRebalance(modelId) {
        Util.responseToObject<any>(this._modelService.canRebalanceModel(+modelId))
            .subscribe(response => {
                // Model id can be rebalnced
                this._modelService.rebalanceModel(+modelId)
                    .map((res: Response) => <any>res.json())
                    .subscribe(possibleRebalancedModels => {
                        /** this.showProgress(); */
                    },
                    error => {
                        throw error;
                    });
            },
            error => {
                throw error;
            });
    }


    reDirectToEdit() {
        if (!this.isSleeved)
            return this._router.navigate(['/eclipse/model/viewstructure', this.modelId, this.modelStatus, this.nodeSelectedId, this.portfolioIdFromView]);
        else
            return this._router.navigate(['/eclipse/model/viewstructure', this.modelId, this.modelStatus, this.nodeSelectedId, this.portfolioIdFromView, 1])
    }

    gettingIsSleevedFlagFromView(sleeved) {
        this.isSleeved = sleeved;
    }

    gettingUniqueSecuritySetNamesInData(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach(element => {
            if (element.modelTypeId == 4) {
                if (that.securitySetNamesArr.length == 0 || that.securitySetNamesArr.indexOf(element.name) == -1) {
                    that.securitySetNamesArr.push(element.securityAsset.id);
                }
            }
            if (element.children != undefined) {
                that.gettingUniqueSecuritySetNamesInData(element.children);
            }
        })
    }
    
}
