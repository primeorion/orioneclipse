import { Component, Input, HostListener, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ModelInformationTabNavComponent } from '../shared/modelInformation.tabnav.component';
import { ModelService } from '../../../services/model.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
//import { ISubModel, ISubModelSecurityAssetType, IcreateNewModel, ISecurityAsset, IModel, CreateTree } from '../../../models/modeling/model';
import { ISubModel, ISubModelSecurityAssetType, IcreateNewModel, ISecurityAsset, IModel, CreateTree, IModelDetailSave, IModelDetailChildernSave, subModelDetail, IModelStructureSaveUpdate, ICollectionSubModelTypes } from '../../../models/modeling/model';
import { IModelCreate, ISubModels } from '../../../models/modeling/modelcreate';
import { IAssignPortfolioToModel } from '../../../models/modeling/assignportfoliotomodel';
import { ISecuritySet } from '../../../models/securitySet';
import { SecuritySetService } from '../../../services/securityset.service';
import { SessionHelper } from '../../../core/session.helper';
// import {PreferenceEnums} from  '../libs/preference.enums';
import { convertEnumValuesToString } from '../../../core/functions';
import { SubModelTypeEnum } from '../../../libs/subModel.enums';
import * as Util from '../../../core/functions';
// import { TreeCharts } from '../../../services/treechart.service';
import { TreeStructure } from '../../../services/tree_data';
import * as d3 from 'd3';
declare var $: JQueryStatic;
import { GridOptions, ColDef } from 'ag-grid/main';
import { IModelDetails } from '../../../models/modeling/modeldetails';
import { AgRendererComponent } from 'ag-grid-ng2/main';
import { AgEditorComponent } from 'ag-grid-ng2/main';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { Observable, Observer } from 'rxjs/Rx';
import { SecurityService } from '../../../services/security.service';
import { ICategory } from '../../../models/category';
import { IClass } from '../../../models/class';
import { ISubClass } from '../../../models/subClass';
import { D3TreeChartComponent } from '../shared/treechart/d3treechart.component';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
@Component({
    selector: 'eclipse-dashboard-overview',
    templateUrl: './app/components/model/information/viewstructure.component.html',
    providers: [ModelService, SecuritySetService, SecurityService]
})
export class ModelViewStructureComponenet extends BaseComponent {
    @Input() modelId: number;
    @Input() displayviewMode: string = "editMode";
    @Input() modelStatus: string;
    @Input() portfolioId: number = null;
    isSubstituted: any;
    substitutedId: number;
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
    selectedSubModel: string = null;
    selectedAsset: number = 0;
    subModelValidation: boolean;
    AssetValidation: boolean;
    subModelNameValidation: boolean;
    nameSpaceValidation: boolean;
    subModelName: string;
    modelNamespace: string;
    // modelId: number;
    subbModelTypeidSelected: number;
    subModeltypeFavorites: boolean = false;
    private _submodeldata: IcreateNewModel;
    /** Creating  */
    TreeDefaultData: any;
    plotTree: any;
    displayReassign: boolean;
    hoveringViewMode: boolean;
    InfoPopup: boolean = false;
    @Input() droppedElement: any;
    viewmodelName: string;
    toleranceTypePer: number;
    //ag-grid variables
    private SubModelColumnDefs: ColDef[];
    private modelGridOptions: GridOptions;
    //  createTreeSubModel: IModel;
    CreateTreeEdit: CreateTree;
    submodelDetailslst: IModelDetails[] = [];
    isDisabledUpperLowerBand: boolean = false;
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
    securitySetData: ISecuritySet;
    doubleClickedNode: string;
    disablingAttributesInPopUp: boolean = false;
    isUpdateStructure: boolean = true;
    modelNodeName: string = "";
    gridNodemodel: IModelDetails;
    lowestLevelFlag: boolean = false;
    submodelcollection: ICollectionSubModelTypes[] = [];
    @Input() submodelsData: ICollectionSubModelTypes[] = [];
    substitutedModelId: number = null;
    @ViewChild(D3TreeChartComponent) d3treeChartComponent: D3TreeChartComponent;
    isDynamicModel: boolean = false;
    isWindowOpen: boolean = false;
    isSubModelChilderns: boolean = false;
    subModelNamespaceValue: string;
    subModelNameValue: string;
    copysubModelNamespaceValue: string;
    copysubModelNameValue: string;
    selectedSubModelId: number;
    isValidData: boolean = false;
    isChangedtext: boolean = false;
    substituteForModelSave: boolean = false;
    subModelnameSpaceValidation: boolean = false;
    SubModelChildernsValidation: boolean = false
    isSleeved: any = 0;
    toggleIdShow: number = 1;
    isSubModelChildernSecurity: boolean = false;
    isreadonlyNameSpace: boolean = true;
    isreadonlyName: boolean = true;
    errorMessage: string = "";
    editSubstitute:any;
    sleevedId:any;
    @Input() isChangeDetection: boolean = false;
    private savedView: ISavedView = <ISavedView>{};
    constructor(private _modelService: ModelService, private activateRoute: ActivatedRoute,
        private _router: Router, private _securitySetService: SecuritySetService, public _securityService: SecurityService) {
        super();
        this.modelGridOptions = <GridOptions>{};
        this.CreateTreeEdit = <CreateTree>{
            name: null,
            id: null,
            parent: null,
            modelType: "Parent Node",
            nodeName: null,
            modelDetailId: null,
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
        this.subbModelTypeidSelected = 1;
        this.modelTypeListEnum = SubModelTypeEnum;
        const objValues = Object.keys(SubModelTypeEnum).map(k => SubModelTypeEnum[k]);
        this.secuirtySubModelList = objValues.filter(v => typeof v === "string") as any[];

        let sub = (Util.getRouteParam<string>(activateRoute, 'nsubstituteid'));


        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        //get the selected nodeId for substituteOf
        let iid = Util.getRouteParam<number>(activateRoute, 'nid');
        this.modelStatus = (Util.getRouteParam<string>(activateRoute, 'nstatus') != null) ? Util.getRouteParam<string>(activateRoute, 'nstatus') : "APPROVED";
        this.isSubstituted = (Util.getRouteParam<string>(activateRoute, 'nid')) ? (Util.getRouteParam<string>(activateRoute, 'nid')) : (Util.getRouteParam<string>(activateRoute, 'nsubstituteid')) ? (Util.getRouteParam<string>(activateRoute, 'nsubstituteid')) : null;
        //nsubstituteid
        this.portfolioId = +(Util.getRouteParam<string>(activateRoute, 'nportfolioid'));
        this.portfolioId = (isNaN(this.portfolioId)) ? null : this.portfolioId;
        this.editSubstitute = (Util.getRouteParam<string>(activateRoute, 'nEditSubstitute'));
        this.editSubstitute = (this.editSubstitute)?this.editSubstitute:false;
        this.sleevedId = Util.getRouteParam<string>(activateRoute, 'nSleevedId');
        this.portfolioId = (this.sleevedId!=undefined&&this.sleevedId!=0)?this.sleevedId:this.portfolioId;
        this.substitutedModelId = +(Util.getRouteParam<string>(activateRoute, 'nsubstituteid'));
        this.substitutedModelId = isNaN(this.substitutedModelId) ? null : this.substitutedModelId;
        this.isSleeved = +(Util.getRouteParam<string>(activateRoute, 'nIsSleeved'));
        this.isSleeved = (isNaN(this.isSleeved)) ? 0 : this.isSleeved;
        let sessionHelper = new SessionHelper();
        let user = sessionHelper.getUser();
        if (user.teams.length != 0) {
            this.modelNamespace = user.teams[0].name;
        }
        else {
            this.modelNamespace = null;
        }
        //this.createSubmodelCollection(this.modelId);
        this.toleranceTotal = 0;
        this.gridNodemodel = <IModelDetails>{
            id: null,
            name: null,
            modelType: "",
            modelTypeId: 0,
            rank: null,
            targetPercent: null,
            toleranceTypeValue: null,
            lowerTradeTolerancePercent: null,
            upperTradeTolerancePercent: null,
            submodelList: []
        }

        this.savedView = <ISavedView>{
            //parentColumnDefs: this.portfolioColumnDefs,
            //parentGridOptions: this.portfolioGridOptions,
            exitWarning: <IExitWarning>{}
        };
    }
    ngOnInit() {
        this.modelGridOptions = <GridOptions>{};
    }



    setSubModelPopup() {
        this.displaySubModel = true;
    }


    displaySubModelsByTypes(modeltypeid: number) {
        if (this.subbModelTypeidSelected != modeltypeid) {
            this.subModeltypeFavorites = false;
        }
        this.isWindowOpen = false;
        this.subbModelTypeidSelected = modeltypeid;
        this.modelNodeslst = this.submodelsData.filter(x => x.id == modeltypeid)[0].submodelsCollection.sort((a, b) => b.id - a.id);
        if (this.isDynamicModel) {
            this.modelNodeslst = this.modelNodeslst.filter(x => x.isDynamic)
            this.submodellst = this.modelNodeslst;
        }
        else if (this.subModeltypeFavorites) {
            this.modelNodeslst = this.modelNodeslst.filter(x => x.isFavorite);
            this.submodellst = this.modelNodeslst;
        }
        else {
            this.submodellst = this.modelNodeslst;
        }

    }

    filterModelNodes(event) {
        let filterText;
        if (!this.filterSubModel) {
            filterText = event.key;
        }
        else {
            filterText = this.filterSubModel + event.key;
        }
        this.modelNodeslst = this.modelNodeslst.filter(x => x.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
    }

    onFilterkeyUp(event) {

        if (event.key == "Backspace") {
            if (this.filterSubModel) {
                if (!this.modelNodeslst.length) {
                    this.displaySubModelsByTypes(this.subbModelTypeidSelected);
                }
                this.modelNodeslst = this.modelNodeslst.filter(x => x.name.toLowerCase().indexOf(this.filterSubModel.toLowerCase()) >= 0)
            }
            else {
                this.displaySubModelsByTypes(this.subbModelTypeidSelected)
                this.modelNodeslst = this.submodellst;
                if (this.subModeltypeFavorites) {
                    this.modelNodeslst = this.modelNodeslst.filter(x => x.isFavorite);
                }
            }
        }
    }

    /** To clear validation Message for onKeyUp */
    hideError() {
        this.subModelNameValidation = (this.subModelName == "");
        this.nameSpaceValidation = (this.modelNamespace == "");
        this.subModelValidation = (this.selectedSubModel == "0");
        this.subModelnameSpaceValidation = false;
    }

    /**Create new Model popUp */
    createModel() {
        if (this.subbModelTypeidSelected == 4) {
            if (!this.isWindowOpen) {
                this.isWindowOpen = true;
                window.open('#/eclipse/security/securitySet/list');
            }
        }
        else {
            this.createNewModel = true;
            this.selectedSubModel = "0";
            this.subModelName = "";
            this.subModelValidation = false;
            this.subModelNameValidation = false;
            this.nameSpaceValidation = false;
            let sessionHelper = new SessionHelper();
            let user = sessionHelper.getUser();
            if(user.teams.length!=0)
            this.modelNamespace = user.teams[0].name;
            else
            this.modelNamespace = null;
            this.isWindowOpen = false;
        }
    }

    /** To bind the Asset Class Model Type */
    private onsubModelChange(securitysubModel: any) {
        this.selectedAsset = 0;
        if (securitysubModel != "0") {
            let id = +SubModelTypeEnum[securitysubModel];
            if (id < 1) {
                this.submodelList = <ISubModels[]>[];
                return;
            }
            this.subModelValidation = false;
            this.submodelList = [];
            if (securitysubModel != 0) {
                this.getAssestTypesBySubModelType(id)
            }
        }
        else {
            this.subModelValidation = true;
        }
    }

    getAssestTypesBySubModelType(id: number) {
        switch (id) {

            case 1:
                // get the Secuity of Category
                this.ResponseToObjects<ICategory>(this._securityService.getCategoryData())
                    .subscribe(modelCat => {
                        modelCat.forEach(elementCat => {
                            this.submodelList.push({
                                id: elementCat.id,
                                name: elementCat.name,
                                modelType: this.modelTypeListEnum[this.modelTypeListEnum["1"]],
                                modelTypeId: 1,
                                securityAssetType: null
                            });
                        });
                    });
                break;

            case 2:
                // get the Secuity of Class
                this.ResponseToObjects<IClass>(this._securityService.getClassData())
                    .subscribe(modelCls => {
                        modelCls.forEach(elementCls => {
                            this.submodelList.push({
                                id: elementCls.id,
                                name: elementCls.name,
                                modelType: this.modelTypeListEnum[this.modelTypeListEnum["2"]],
                                modelTypeId: 2,
                                securityAssetType: null
                            });
                        });
                    });
                break;

            case 3:
                // get the Secuity of Sub-Class
                this.ResponseToObjects<ISubClass>(this._securityService.getSubClassData())
                    .subscribe(modelSubCls => {
                        modelSubCls.forEach(elementSubCls => {
                            this.submodelList.push({
                                id: elementSubCls.id,
                                name: elementSubCls.name,
                                modelType: this.modelTypeListEnum[this.modelTypeListEnum["3"]],
                                modelTypeId: 3,
                                securityAssetType: null
                            });
                        });
                    });
                break;
        }

    }

    /** validation for Create new Model  */
    OnSave() {
        this.subModelnameSpaceValidation = false;
        this.createNewModel = true;
        this.selectedSubModel = (this.selectedSubModel == "null" || this.selectedSubModel == "0") ? null : this.selectedSubModel;
        if ((!this.selectedSubModel) && (this.subModelName == undefined || this.subModelName == "")) {
            this.subModelValidation = true;
            this.subModelNameValidation = true;
            this.selectedSubModel = "0"
        }
        else if ((this.selectedSubModel) && (this.subModelName == undefined || this.subModelName == "")) {
            this.subModelValidation = false;
            this.subModelNameValidation = true;
        }
        else if ((!this.selectedSubModel) && (this.subModelName != undefined || this.subModelName != "")) {
            this.subModelValidation = true;
            this.subModelNameValidation = false;
            this.selectedSubModel = "0"
        }
        else {
            this.nameSpaceValidation = false;
            if (!this.subModelValidation && this.modelNamespace != "") {
                let _modelTypeId = SubModelTypeEnum[this.selectedSubModel];
                this._submodeldata = <IcreateNewModel>{
                    name: this.subModelName,
                    modelTypeId: +(_modelTypeId),
                    securityAsset: <ISecurityAsset>{ id: this.selectedAsset },
                    nameSpace: this.modelNamespace
                }
                this.ResponseToObjects<any[]>(this._modelService.validateSubModelNamespace(this.subModelName, this.modelNamespace))
                    .subscribe(model => {
                        if (model.length < 1) {
                            this._modelService.addSubModel(this._submodeldata)
                                .map((response: Response) => <ISubModel[]>response.json())
                                .subscribe(model => {
                                    this.submodelsData.filter(x => x.id == _modelTypeId)[0].submodelsCollection.push(model);
                                    this.displaySubModelsByTypes(this.subbModelTypeidSelected);
                                    this.subModelValidation = false;
                                    this.subModelNameValidation = false;
                                    this.nameSpaceValidation = false;
                                    this.subModelnameSpaceValidation = false;
                                    this.resetnewModel();

                                }, error => {
                                    // console.log(error);
                                    return false
                                });
                        }
                        else {
                            this.nameSpaceValidation = false;
                            this.createNewModel = true;
                            this.subModelnameSpaceValidation = true;
                            return false;
                        }
                    }, error => {
                        this.subModelnameSpaceValidation = true;
                        this.nameSpaceValidation = false;
                        this.createNewModel = false;
                        throw error;

                    });
            }
            else {
                this.nameSpaceValidation = true;
                this.createNewModel = true;
                return false
            }
            this.createNewModel = false;
        }
    }

    /** To Reset the Create New Model popUp */
    resetnewModel() {
        this.selectedSubModel = "";
        this.selectedAsset = 0;
        this.subModelName = '';
        this.modelNamespace = '';
        this.createNewModel = false;
        this.submodelList = [];
    }

    displaySubmodelByCategory(filtertype) {
        this.filterSubModel = null;
        if (filtertype == "Favorites") {
            this.subModeltypeFavorites = true;
            this.displaySubModelsByTypes(this.subbModelTypeidSelected);
            this.modelNodeslst = this.submodellst;
            this.modelNodeslst = this.modelNodeslst.filter(x => x.isFavorite);
        }
        else {
            this.subModeltypeFavorites = false;
            this.displaySubModelsByTypes(this.subbModelTypeidSelected)
            this.modelNodeslst = this.submodellst;
        }
    }

    loadisfavorites(isFavorite: boolean) {
        return (isFavorite) ? "fa fa-heart select" : "fa fa-heart";
    }

    setsubmodelasFavorite(submodelId: number, isFavorite: boolean) {
        if (this.subbModelTypeidSelected != 4) {
            this._modelService.updateSubmodelfavoritestatus(submodelId, !isFavorite)
                .subscribe(model => {
                    this.updateSubModelsByTypes(submodelId, !isFavorite);
                    this.displaySubModelsByTypes(this.subbModelTypeidSelected);

                }, error => {
                    this.displaySubModelsByTypes(this.subbModelTypeidSelected);
                    // console.log(error);
                    throw error;
                });
        }
        else {
            this._securitySetService.updateSecuritySetFavorite(submodelId, !isFavorite)
                .subscribe(model => {
                    this.updateSubModelsByTypes(submodelId, !isFavorite);
                    this.displaySubModelsByTypes(this.subbModelTypeidSelected);
                }, error => {
                    // console.log(error);
                    throw error;
                });
        }
    }

    setValid(event) {
        if (event.key != undefined) {
            if (event.target.max > 10) {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*") {
                    return false;
                }

                if (event.target.value.includes(".")) {
                    if (event.key == ".") {
                        return false
                    }
                }
            }
            else {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*" || event.key == ".") {
                    return false;
                }
            }
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            return (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max);
        }
        return true;
    }
    private setValidtargetUpper(event, subModelDetail) {
        if (event.key != undefined) {
            if (event.target.max > 10) {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*") {
                    return false;
                }

                if (event.target.value.includes(".")) {
                    if (event.key == ".") {
                        return false
                    }
                }
            }
            else {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*" || event.key == ".") {
                    return false;
                }
            }
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max) {
                // Calculate the Amount
                //subModelDetail.toleranceTypeValue = null;
            }
        }
        else {
            return false;

        }
        return true;
    }

    // calculateTolerance(tolranceband, CreateTreeEditChild) {
    //     let that = this;
    //     if (CreateTreeEditChild.length == undefined) {
    //         CreateTreeEditChild = [CreateTreeEditChild];
    //     }
    //     CreateTreeEditChild.forEach(element => {

    //         if (element.children != undefined) {

    //             element.toleranceTypeValue = tolranceband;
    //             let fixedBandRange = (tolranceband / 100) * element.targetPercent;
    //             element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
    //             element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);

    //             that.calculateTolerance(tolranceband, element.children);
    //         }
    //     });


    // }

    // setValidTolarance(event) {
    //     let parsetxt = parseInt(event.target.value + event.key);
    //     this.calculateTolerance(parsetxt, this.saveTreeData);
    // }


    // getToleranceTotal() {
    //     this.toleranceTotal = 0;
    //     if (this.submodelDetailslst.length > 0) {
    //         this.submodelDetailslst.forEach(element => {
    //             if (element.targetPercent != null) {
    //                 this.toleranceTotal = (this.toleranceTotal) + (element.targetPercent);

    //             }
    //         })
    //     };
    //     //  this.calculateFixedBand();
    //     return this.toleranceTotal;
    // }

    // calculateFixedBand() {
    //     let cnt = 0;
    //     if (this.submodelDetailslst.length > 0) {
    //         this.submodelDetailslst.forEach(element => {
    //             if (element.targetPercent != null) {
    //                 if (this.toleranceTypeValue == 2) {
    //                     if (this.toleranceTypePer != null && element.targetPercent != null) {
    //                         let fixedBandRange = (this.toleranceTypePer / 100) * element.targetPercent;
    //                         element.upperModelTolerancePercent = +fixedBandRange.toFixed(2);
    //                         element.lowerModelTolerancePercent = +fixedBandRange.toFixed(2);
    //                     }
    //                     else {
    //                         element.upperModelTolerancePercent = null;
    //                         element.lowerModelTolerancePercent = null;
    //                     }
    //                 }
    //             }
    //             else {
    //                 cnt++;
    //             }
    //         });
    //     }

    //     return (cnt > 0) ? false : true;
    // }

    // IsValidForm() {
    //     let showSaveBtn = this.calculateFixedBand();
    //     if (this.toleranceTotal == 100 && showSaveBtn) {
    //         return true;
    //     }
    //     return false;
    // }

    radiobuttondisbale(param) {
        this.toleranceTypePer = null;
        if (param == 1) {
            this.isDisabledToleranceTypePer = true;
            this.isDisabledUpperLowerBand = false;
        }
        else {
            this.isDisabledToleranceTypePer = false;
            this.isDisabledUpperLowerBand = true;
        }
        this.toleranceTypeValue = param;
    }

    cancelPopUp() {
        this.displayReassign = false;
        this.isSubModelChilderns = false;
        this.isChangedtext = false;
        this.SubModelChildernsValidation = false;
        this.subModelnameSpaceValidation = false;
        this.nameSpaceValidation = false;
        this.subModelNameValidation = false;
        this.subModelValidation = false;
        this.submodelList = [];
        this.isSubModelChildernSecurity = false;
        this.errorMessage = null;
    }

    modeldetailsSave() {
        let createTreeStructure: IModelDetailSave;
        if (this.CreateTreeEdit != undefined) {
            createTreeStructure = <IModelDetailSave>{
                name: this.CreateTreeEdit.nodeName,
                targetPercent: null,
                lowerModelTolerancePercent: null,
                upperModelTolerancePercent: null,
                toleranceTypeValue: null,
                lowerModelToleranceAmount: null,
                upperModelToleranceAmount: null,
                lowerTradeTolerancePercent: null,
                upperTradeTolerancePercent: null,
                rank: null,
                children: []
            }

            this.CreateTreeEdit.children.forEach(elementCat => {
                // Create root Node    Category           
                createTreeStructure.children.push({
                    id: elementCat.id,
                    name: elementCat.name,
                    modelDetailId: null,
                    modelTypeId: elementCat.modelTypeId,
                    targetPercent: elementCat.targetPercent,
                    lowerModelTolerancePercent: elementCat.lowerModelTolerancePercent,
                    upperModelTolerancePercent: elementCat.upperModelTolerancePercent,
                    toleranceTypeValue: elementCat.toleranceTypeValue,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    rank: elementCat.rank,
                    isEdited: null,
                    isSubstituted: null,
                    substitutedOf: null,
                    children: []
                });
            });
        }
    }
    onSaveModelStructure() {
        this.showSaveToDraftPopup = true;
    }


    updateSubModelsByTypes(modeltypeid: number, isFavorite: boolean) {
        this.modelNodeslst.forEach(element => {
            if (element.id == modeltypeid) {
                element.isFavorite = isFavorite;
            }
        });

        this.submodellst.forEach(element => {
            if (element.id == modeltypeid) {
                element.isFavorite = isFavorite;
            }
        });
    }

    removeTimestampIdFromSaveFormat(data) {
        let that = this;
        data.forEach(element => {
            delete element.timestampId;
            if (element.children != undefined) {
                that.removeTimestampIdFromSaveFormat(element.children);
            }
        })
    }
    showData(data) {
        if (data == "isChangeDetectionRef") {
            this.isChangeDetection = true;
        }
        else {
            if (data == true || data == false) {
                this.isUpdateStructure = data;
            }
        }
    }
    checkValidationsToSaveData() {
        if (this.saveTreeData != undefined) {
            delete this.saveTreeData['timestampId'];
            this.removeTimestampIdFromSaveFormat(this.saveTreeData.children);
            this.lowestLevelFlag = false;
            this.substituteForModelSave = false;
            this.CheckLowestLevelSecuritySetValidation(this.saveTreeData);
            if (this.lowestLevelFlag) {
                if (this.portfolioId) {
                    this.substituteForModelSave = true;
                }
                else {
                    this.substituteForModelSave = false;
                }
                this.showSaveToDraftPopup = true;
            }
            else {
                this.SaveDataToDraft();
            }
        }

    }

    CheckLowestLevelSecuritySetValidation(data) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        data.forEach((element, key) => {
            if (element.children.length == 0) {
                if (element.modelTypeId != 4) {
                    that.lowestLevelFlag = true;
                }
            }
            else {
                that.CheckLowestLevelSecuritySetValidation(element.children);
            }
        })
    }

    assignSecuritySet(childData) {
        childData.forEach(element => {
            if (element.modelTypeId == 4) {
                element.securityAsset = { "id": +((' ' + element.id).slice(1)) }
                element.id = null;
            }

            if (this.isUpdateStructure) {
                element.isEdited = true;
            }

            if (element.children != undefined)
            { this.assignSecuritySet(element.children) }
        });
    }
    SaveDataToDraft() {
        let modelStructure = <IModelStructureSaveUpdate>{};
        modelStructure.modelDetail = <IModelDetailSave>{};
        modelStructure.substitutedModelId = this.substitutedModelId;
        modelStructure.substitutedFor = this.portfolioId;
        modelStructure.modelDetail = this.saveTreeData;
        modelStructure.isSleeved = (this.isSleeved == 0) ? false : true;
        this.assignSecuritySet(this.saveTreeData.children);
        if (!this.isUpdateStructure) {
            // Save the Model Structure
            this._modelService.savemodeldetails(this.modelId, modelStructure)
                .map((response: Response) => <any>response.json())
                .subscribe((data: any) => {
                    this.navigateToView();
                }, error => {
                    console.log(error);
                    $(".info_popup").html("Model is not saved.Please Try Again!");
                    this.InfoPopup = true;
                    this.AddingExtraIdAttributeInSaveFormat(this.CreateTreeEdit.children, this.saveTreeData.children);

                });
            this.isUpdateStructure = true;
        }
        else {
            //Update the Model Structure
            this._modelService.updatemodeldetails(this.modelId, modelStructure)
                .map((response: Response) => <any>response.json())
                .subscribe((data: any) => {
                    this.navigateToView();
                }, error => {
                    this.AddingExtraIdAttributeInSaveFormat(this.CreateTreeEdit, this.saveTreeData);
                    console.log(error);
                    $(".info_popup").html("Model is not saved.Please Try Again!");
                    this.InfoPopup = true;

                });
        }
    }

    navigateToView() {
        this.savedChangeDetection()
        this.showSaveToDraftPopup = false;
        this._router.navigate(['/eclipse/model/view/', + this.modelId]);
    }

    closeInfoPopUp() {
        this.showSaveToDraftPopup = false;
        this.deleteNodeSubModel = false;
        this.deleteNodeModel = false;
        this.isSubModelChilderns = false;
        this.InfoPopup = false;
    }
    @HostListener('focusout', ['$event.target'])
    onFocusout(target) {
        this.isreadonlyNameSpace = true;
        this.isreadonlyName = true;
    }
    
      @HostListener('click', ['$event.target'])
    onClick(target) {
       $("#context-dd-menu").css({ display: 'none' });
    }

    // Validatin the Model whith Namespace
    validateSubModelByNamespace() {
        this.ResponseToObjects<any[]>(this._modelService.validateModelNamespace(this.droppedElement, this.modelNamespace))
            .subscribe(model => {
                if (model.length > 0) {
                    this.toleranceTypeModelNamespaceValid = true;
                    return true;
                }
                else {
                    this.toleranceTypeModelNamespaceValid = false
                    return false;
                }
            });
        return false;
    }
    isValidStructure() {
        this.isValidData = this.d3treeChartComponent.isValidStructure();
        return this.isValidData
    }
    getModelDataEmit(event: IModel) {
        this.isDynamicModel = event.isDynamic;
    }
    getSubModels(event) {
        this.submodelsData = event;
        if (!this.isDynamicModel)
            this.displaySubModelsByTypes(1);
        else
            this.displaySubModelsByTypes(4);
    }
    categoryCssByIsdynamic() {
        return (!this.isDynamicModel) ? "active" : null
    }
    securityCssByIsdynamic() {
        return (this.isDynamicModel) ? "active" : null
    }
    eventEmitDoubleClickNameSpace(event) {
        console.log("eventEmitDoubleClickNameSpace")
        this.isreadonlyNameSpace = false;
        this.isChangedtext = true;

    }
    eventEmitDoubleClickName(event) {
        this.isreadonlyName = false;
        this.isChangedtext = true;
        this.errorMessage = null;
    }
    showSubModelChilderns(submodelData: ISubModel) {
        this.selectedSubModelId = +submodelData.id;
        this.submodelDetailslst = [];
        this.isreadonlyNameSpace = true;
        this.isreadonlyName = true;
        if (submodelData.modelTypeId != 4) {
            if (submodelData.modelTypeId != 4) {
                this._modelService.getSubModelDetailById(+submodelData.id)
                    .map((response: Response) => <subModelDetail>response.json())
                    .subscribe(submodelDetails => {
                        this.subModelNameValue = submodelDetails.name
                        this.subModelNamespaceValue = submodelDetails.nameSpace;
                        this.copysubModelNameValue = submodelDetails.name
                        this.copysubModelNamespaceValue = submodelDetails.nameSpace;
                        this.submodelDetailslst = [];
                        this.preparingSubModelDataForThePopup(submodelDetails.children, this.submodelDetailslst)
                        this.isSubModelChilderns = true;
                        this.isChangedtext = false;
                        this.isSubModelChildernSecurity = false;
                    });
            }
        }
        else {
            //this.isSubModelChilderns = false;
            this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(+submodelData.id))
                .subscribe(securitysetDetails => {
                    this.subModelNameValue = securitysetDetails.name;
                    this.preparingSecuritiesDataForThePopup(securitysetDetails.securities);
                    this.isSubModelChilderns = false;
                    this.isChangedtext = false;
                    this.isSubModelChildernSecurity = true;
                },
                error => {
                    // console.log(error);
                })
        }
    }
    preparingSubModelDataForThePopup(data, submodelDetailslst) {
        data.forEach((element, key) => {
            submodelDetailslst.push(
                <IModelDetails>{
                    id: (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.id : element.id : element.id,
                    name: (element.modelTypeId == 4) ? (element.securityAsset) ? element.securityAsset.name : element.name : element.name,
                    modelType: element.modelType,
                    modelTypeId: element.modelTypeId,
                    rank: element.rank,
                    level: null,
                    targetPercent: element.targetPercent,
                    toleranceTypeValue: element.toleranceTypeValue,
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
            if (element.children.length > 0) {
                this.preparingSubModelDataForThePopup(element.children, submodelDetailslst);
            }
        });
    }
    preparingSecuritiesDataForThePopup(data) {
        if (data.length == undefined) {
            data = [data];
        }
        let list = [];
        data.forEach((element, key) => {
            list.push(
                <IModelDetails>{
                    id: element.id,
                    name: element.name,
                    modelType: null,
                    modelTypeId: 4,
                    rank: (element.rank != null) ? element.rank : 0,
                    level: null,
                    targetPercent: element.targetPercent,
                    toleranceTypeValue: null,
                    lowerModelTolerancePercent: (element.lowerModelTolerancePercent != null) ? element.lowerModelTolerancePercent : 0,
                    upperModelTolerancePercent: (element.upperModelTolerancePercent != null) ? element.upperModelTolerancePercent : 0,
                    lowerModelToleranceAmount: null,
                    upperModelToleranceAmount: null,
                    lowerTradeTolerancePercent: null,
                    upperTradeTolerancePercent: null,
                    leftValue: null,
                    rightValue: null,
                }
            );
            list[key].nodeName = element.name
        });
        this.submodelDetailslst = list;
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
                return true;
            }
            else {
                if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                    || event.key == "?" || event.key == "*" || event.key == "." || event.key == "=") {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
    private validtarUpperPercent(event, subModelDetail) {
        if (this.validateEventField(event)) {
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            return (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max);
        }
        else {
            return false;
        }
    }
    private validTolaranceBand(event, gridNodemodel) {
        if (this.validateEventField(event)) {
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;

            if ((!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max)) {
                // Calculate Amount                
                let fixedBandRange = (parseInt(event.target.value + event.key) / 100) * gridNodemodel.targetPercent;
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
    private validTargetPercent(event, gridNode) {
        if (this.validateEventField(event)) {
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
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
    isChangedObject() {
        this.isChangedtext = true;
    }
    updateSubModel() {
        this.errorMessage = null;
        this.SubModelChildernsValidation = false;
        if (this.isChangedtext && (this.copysubModelNameValue != this.subModelNameValue || this.copysubModelNamespaceValue != this.subModelNamespaceValue)) {
            this.isChangedtext = false;
            this.ResponseToObjects<any[]>(this._modelService.validateSubModelNamespace(this.subModelNameValue, this.subModelNamespaceValue))
                .subscribe(model => {
                    if (model.length < 1) {
                        this._modelService.updateSubmodel(this.selectedSubModelId, this.subModelNameValue, this.subModelNamespaceValue)
                            .map((response: Response) => <ISubModel>response.json())
                            .subscribe(model => {
                                this.isSubModelChilderns = false;
                                let modelName = model.name
                                let modelNameSpace = model.namespace
                                let subLst = this.submodelsData.filter(x => x.id == model.modelTypeId)[0].submodelsCollection.filter(y => y.id == this.selectedSubModelId)[0]
                                subLst.name = modelName;
                                subLst.nameSpace = modelNameSpace;
                                this.displaySubModelsByTypes(+this.subbModelTypeidSelected);
                                this.errorMessage = null;
                            }, error => {
                                this.SubModelChildernsValidation = true;
                                this.isSubModelChilderns = true;
                                this.errorMessage = "Sub-Model Name + Namespace must be unique, Please try again.";
                                this.isChangedtext = true;
                                throw error;
                            });
                    }
                    else {
                        this.SubModelChildernsValidation = true;
                        this.isSubModelChilderns = true;
                        this.errorMessage = "Sub-Model Name + Namespace must be unique";
                        this.isChangedtext = true;
                    }
                }, error => {
                    this.SubModelChildernsValidation = true;
                    this.isSubModelChilderns = true;
                    this.errorMessage = "Sub-Model Name + Namespace must be unique, Please try again.";
                    this.isChangedtext = true;
                    throw error;
                });
        }
        else {
            this.cancelPopUp();
        }
    }
    routeModelInfo() {
        if (this.modelId) {
            if (this.modelStatus) {
                this._router.navigate(['/eclipse/model/edit/', + this.modelId, this.modelStatus.toLowerCase()]);
            }
            else {
                this._router.navigate(['/eclipse/model/edit/', + this.modelId]);
            }
        }
        else {
            this._router.navigate(['/eclipse/model/modelinfoadd']);
        }
    }

    routeModelStructure() {
        if (this.modelId) {
            if (this.modelStatus) {
                this._router.navigate(['/eclipse/model/viewstructure/', + this.modelId, this.modelStatus.toLowerCase()]);
            }
            else {
                this._router.navigate(['/eclipse/model/viewstructure/', + this.modelId]);
            }
        }
        else {
            return false;
        }
    }
    onCancel() {
        this.isChangeDetection = false;
        if (this.modelId) {
            this._router.navigate(['/eclipse/model/view/', + this.modelId]);
        }
        else {
            this._router.navigate(['/eclipse/model/list/']);
        }
    }
    showToggle(toggleId) {

        $("button.active").removeClass("active");
        $(this).addClass("active");
        if (toggleId == 2) {
            $("#blk-1").hide();
            $("#blk-2").show();
            $("#rd1").removeClass("active");
            $('#rdb2').addClass("active");
            $(".left-hbox-container").addClass('showme');
            $('#viewstructure_container').hide();
            this.toggleIdShow = 2;
        }
        else {

            if (this.saveTreeData != undefined) {
                let isvalid = (this.CreateTreeEdit.children.length > 0) ? true : false;
                if (!this.isValidData && isvalid) {
                    $("#blk-1").hide();
                    $("#blk-2").show();
                    $("#rd1").removeClass("active");
                    if (!$("#rdb2").hasClass("active")) {
                        $('#rdb2').addClass("active");
                    }
                    // $('.right-hbox-container').css("right", -375);
                    $(".left-hbox-container").addClass('showme');
                    $('#viewstructure_container').hide();
                    this.toggleIdShow = 2;
                    return false;
                }
                else {
                    $("#blk-1").show();
                    $("#blk-2").hide();
                    $("#rd2").removeClass("active");
                    $('#rdb1').addClass("active");
                    $('.right-hbox-container').css("right", 0);
                    // $(".left-hbox-container").removeClass('showme');
                    $('#viewstructure_container').show();
                    this.d3treeChartComponent.ArrangingValuesToPlotPie(this.CreateTreeEdit);
                    d3.select('.tree_chart').remove();
                    this.d3treeChartComponent.createSvg(".node_tree", [this.CreateTreeEdit], "editMode");
                    this.d3treeChartComponent.isValidStructure();
                    this.toggleIdShow = 1;
                }

            }
            else {
                $("#blk-1").show();
                $("#blk-2").hide();
                $('.right-hbox-container').css("right", 0);
                $('#viewstructure_container').show();
                this.toggleIdShow = 1;
                // $(".left-hbox-container").removeClass('showme');
                //this.d3treeChartComponent.isValidStructure();
            }
        }
    }
    getTreeData(data) {
        this.CreateTreeEdit = data;
    }

    AddingExtraIdAttributeInSaveFormat(data, saveData) {
        let that = this;
        if (data.length == undefined) {
            data = [data];
        }
        if (saveData.length == undefined) {
            saveData = [saveData];
        }
        data.forEach((element, key) => {
            saveData[key]["timestampId"] = element.id;
            if (element.children != undefined) {
                that.AddingExtraIdAttributeInSaveFormat(element.children, saveData[key].children);
            }
        });
    }
    IsValidSubModel() {
        if (this.subModelNameValue != undefined && this.subModelNamespaceValue != undefined) {
            if (this.subModelNameValue.length > 0 && this.subModelNamespaceValue.length > 0) {
                return true;
            }
            else {
                if (this.subModelNameValue.length == 0 && this.subModelNamespaceValue.length == 0) {
                    return false;
                }
                else if (this.subModelNameValue.length == 0) {
                    return false;
                }
                else if (this.subModelNamespaceValue.length == 0) {
                    return false;
                }
            }
        }
        else {
            return false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        if (this.isChangeDetection) {
            this.savedView.exitWarning.show = true;
            return new Observable<boolean>((sender: Observer<boolean>) => {
                this.savedView.exitWarning.observer = sender;
            });
        }
        else {
            return Observable.of(true);
        }
    }
    /** Confirm when we are away from page */
    confirmClick(status: boolean) {
        this.savedView.exitWarning.show = false;
        this.savedView.exitWarning.observer.next(status);
        this.savedView.exitWarning.observer.complete();
    }
    savedChangeDetection() {
        this.isChangeDetection = false;
    }
}