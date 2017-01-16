import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BaseComponent } from '../../../core/base.component';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import * as Util from '../../../core/functions';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import * as d3 from 'd3';
declare var $: JQueryStatic;
/** Services */
import { ModelService } from '../../../services/model.service';
import { PortfolioService } from '../../../services/portfolio.service';

/** Models import section */
import { IModel } from '../../../models/modeling/model';
import { IModelDetails } from '../../../models/modeling/modeldetails';
import { IModelStatus } from '../../../models/modeling/modelstatus';
import { IModelFilterTypes } from '../../../models/modeling/modelfiltertypes';
import { IModelingViewModel } from '../../../models/modeling/modelingviewmodel';
import { IAssignPortfolioToModel } from '../../../models/modeling/assignportfoliotomodel';
import { IModelPortfolios } from '../../../models/modeling/modelportfolios';
import { IPortfolioDetails, IPortfolioTeam, IPortfolio, IPortfolioSimple } from '../../../models/portfolio';
import { IModelTeams } from '../../../models/modeling/modelteams';
import { IModelPortfolioApprovalList } from '../../../models/modeling/modelportfolioapprovallist';
import { IApproveRejectModelPortfolios } from '../../../models/modeling/approverejectmodelportfolios';
import { IModelSleevedAccount } from '../../../models/modeling/modelsleevedaccounts';
import { IAssignSleeveToModel } from '../../../models/modeling/assignsleevetomodel';
import { IModelPortfolioAllocation, IPortfolioTotalTargetAllocationVM } from '../../../models/modeling/modelportfolioallocations';
import { IModelTargetAllocation, IModelTargetAllocationVM } from '../../../models/modeling/modeltargetallocations';
import { ISleevedAccountAllocation, ISleevedAccountTotalTargetAllocationVM } from '../../../models/modeling/sleevedaccountallocations';
import { D3TreeChartComponent } from '../shared/treechart/d3treechart.component';

@Component({
    selector: 'eclipse-model-dashboard',
    templateUrl: './app/components/model/view/view.component.html',
    providers: [ModelService, PortfolioService]
})
export class ModelViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    modelingModel: IModel;
    gridOptions: {
        regular: GridOptions
    };
    private columnDefs: ColDef[];
    modelId: number;
    displayviewMode: string = "viewMode";
    modelStatus: string = "approved";
    nameValidation: boolean = false;
    public tags: any[] = [];
    // selectedTag: number;
    checkForIsDynamicEnabled: number;
    flagEnableCorporateAction: boolean = true;
    isDetailEditMode: boolean = false;
    sampleFiled: string = '';
    modelPortfolios: IModelPortfolios[] = [];
    portfolioSuggestions: IPortfolioSimple[] = [];
    selectedPortfolio: string;
    modelTeams: IModelTeams[] = [];
    // portfolios: IPortfolio[];
    rowType: string;


    deleteCheck: boolean;
    displayConfirm: boolean;
    selectedPortfolioId: number;
    showAssignPopup: boolean;
    private confirmType: string = 'UNASSIGN';

    flagMP_AllocSection: boolean = false;
    flagAwaitingApproval: boolean = false;
    dispAwaitingApproval: string;
    assignPfToModel: IAssignPortfolioToModel;
    displayAwaitingApproval: string;
    flagDispApprovalReject: boolean = false;
    newlyAssignedPortfolioId: number;
    approveRejectModelPortfolios: IApproveRejectModelPortfolios;
    portfoliosAwaitingList: IModelPortfolioApprovalList[] = [];
    selectedGridPortfolioId: number;
    selectedGridMultiplePortfolioIds: number[] = [];
    displayPfMdlApprvlSec: boolean = false;
    btnApproveDisable: boolean = true;
    btnRejectDisable: boolean = true;
    privApproveModelAssign: boolean = false;
    isLinkDisabled: boolean;
    hasSubstitute: string;

    /** GRID variables */
    private modelGridOptions: GridOptions;
    private modelrowData: any[] = [];
    private modelColumnDefs: ColDef[];
    private models: IModel[] = [];
    modelList: any[] = [];
    setFilter: boolean = false;
    gridchildren: any[] = [];

    /** Set grid context params  */
    gridContext = {
        isGridModified: false,
        portfolioId: 0
    }

    selectedModel: string;
    private modelSuggestions: IModel[] = []

    /** Model Portfolio Allocations */
    modelPortfolioAllocations: IModelPortfolioAllocation[] = [];
    private structMPAllocation: IPortfolioTotalTargetAllocationVM;

    /** Model Allocations */
    private structMTargetAllocation: IModelTargetAllocationVM;
    modelTargetAllocations: IModelTargetAllocation[] = [];
    m_AUM: number;

    /** Variables for Sleeves -- Right panel */
    radioportfolio: string;
    radiosleeve: string;
    modelSleevedAccounts: IModelSleevedAccount[] = [];
    sleeveSuggestions: IModelSleevedAccount[];
    sleevedAccounts: IModelSleevedAccount[];
    selectedSleeveAccountId: number;
    selectedSleeve: string;
    assignSlvToModel: IAssignSleeveToModel;
    sleeveAllocations: ISleevedAccountAllocation[] = [];
    flagSlv_AllocSection: boolean = false;
    substitutedId: number = 0;
    private structSlvAllocation: ISleevedAccountTotalTargetAllocationVM;
    @ViewChild(D3TreeChartComponent) d3treeChartComponent: D3TreeChartComponent;
    isDisableBtnEdit: boolean = false;

    disableAssignButton: boolean = false;
    flagDispPfHasSubstitute: boolean = false;
    substitutedPortfolioId: any = 0;
    substitutedSleeveId: any = 0;

    /** 
     * ::CONSTRUCTOR:: 
    **/
    constructor(private activateRoute: ActivatedRoute, private _router: Router,
        private _modelService: ModelService,
        private _portfolioService: PortfolioService
    ) {
        super(PRIV_MODELS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.modelingModel = <IModel>{};
        this.gridOptions = { regular: <GridOptions>{} }
        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        this.modelGridOptions = <GridOptions>{};
        this.createColumnDefs();

        // if (!Util.isNull(this.modelId)) {
        (this.modelId > 0) ? this.tabsModel.id = this.modelId : this.modelId = undefined;
        // this.tags = ["One","two","three","four"];
    }

    /** 
     * ::INITS:: 
    **/

    ngOnInit() {
        this.initializeAllocations();
        if (this.modelId != undefined && this.modelId > 0)
            this.getModelCompleteDetailsById(this.modelId);
        this.setPortfoliosWhileLoad();
    }

    /** initialize Allocation Vms*/
    initializeAllocations() {
        this.structMPAllocation = <IPortfolioTotalTargetAllocationVM>{
            currentInAmt: null,
            currentInPercent: null,
            symbol: '',
            name: '',
            targetInAmt: null,
            targetInPercent: null
        }

        this.structSlvAllocation = <ISleevedAccountTotalTargetAllocationVM>{
            currentInAmt: null,
            currentInPercent: null,
            symbol: '',
            name: '',
            targetInAmt: null,
            targetInPercent: null
        }

        this.structMTargetAllocation = <IModelTargetAllocationVM>{
            symbol: '',
            targetInPercent: null
        }
    }

    /** 
     * ::GET MASTER DETAILS:: 
    **/

    /** Get Model details  and its associated portfolios by Id */
    getModelCompleteDetailsById(modelId: number) {
        //this.responseToObject<IModel>(this._modelService.getModelDetail(modelId)),
        Observable.forkJoin(
            this.responseToObject<IModelPortfolios[]>(this._modelService.getModelPortfolios(modelId)),
            this.responseToObject<IModelTeams[]>(this._modelService.getModelTeams(modelId)),
            // this.responseToObject<IPortfolio[]>(this._portfolioService.getPortfolios(0)),
            this.responseToObject<IModelTargetAllocation[]>(this._modelService.getModelAllocation(modelId)),
            this.responseToObject<IModelSleevedAccount[]>(this._modelService.getSleevedAccountsForModel(modelId)))

            .subscribe((model: any[]) => {
                // this.modelingModel = model[0];
                this.modelPortfolios = model[0];
                this.modelTeams = model[1];
                // this.portfolios = model[2];
                this.modelTargetAllocations = model[2];
                this.calculateMAllocTotals(model[2]);
                this.m_AUM = model[0].modelAUM;
                this.modelSleevedAccounts = model[3];
                this.checkStatusAwaitingList(this.modelPortfolios);
                // this.setTags(this.modelingModel);
                console.log('model Teams -----', JSON.stringify(model[0].teams));
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** 
     * ::LOADS:: 
    **/

    /** AutoComplete Search models by name */
    loadModelSuggestions(event) {
        Util.responseToObjects<IModel>(this._modelService.getModelSearch(event.query.toLowerCase()))
            .subscribe(model => {
                this.modelSuggestions = model;
                console.log('modelSuggestions-----------', this.modelSuggestions);
            });
    }

    /** AutoComplete Search portfolios by name */
    loadPortfolioSuggestions(event) {
        Util.responseToObjects<IPortfolioSimple>(this._portfolioService.searchPortfolio(event.query.toLowerCase()))
            .subscribe(model => {
                /** Portfolio suggestions should have non-deleted portfolios and assigned Portfolios */
                this.portfolioSuggestions = model;

                if (this.modelPortfolios.length > 0) {
                    this.modelPortfolios.forEach(element => {
                        this.portfolioSuggestions = this.portfolioSuggestions.filter(record => record.id != element.id && !record.isDeleted);
                    });
                }


                console.log('portfolios from Simple search----', this.portfolioSuggestions);
            });
    }

    /** AutoComplete Search models by name */
    loadSleeveSuggestions(event) {
        Util.responseToObjects<IModelSleevedAccount>(this._portfolioService.searchportfolioSleeveAccounts(event.query.toLowerCase()))
            .subscribe(model => {
                /** Sleeve suggestions should have non-deleted portfolios and assigned Sleeves*/
                this.sleeveSuggestions = model;

                if (this.modelSleevedAccounts.length > 0) {
                    this.modelSleevedAccounts.forEach(element => {
                        this.sleeveSuggestions = this.sleeveSuggestions.filter(record => record.id != element.id || element.isDeleted == 0);
                    });
                }
                console.log('Sleeved accounts for Sleeves simple search----', this.sleeveSuggestions);
            });
    }

    /** 
     * ::ON SELECTS:: 
    **/

    /** Fires on select Model from search portfolio */
    onModelSelect(params: any) {
        this._router.navigate(['/eclipse/model/search', params.id]);
    }

    /** Fires on select portfolio from search portfolio */
    onPortfolioSelect(params: any) {
        this.selectedPortfolioId = params.id;
        console.log('Params selectedPortfolioId', params.id);
    }

    /** Fires on select portfolio from search portfolio */
    onSleeveSelect(params: any) {
        this.selectedSleeveAccountId = params.id;
        console.log('Params selectedSleeveAccountId', params.id);
    }

    /** 
     * ::UN-ASSIGNS:: 
    **/

    /** Fires when remove button is clicked
     *  This will unassign the selected portfolio from Model
     */
    unAssignPortfolioFromModel() {
        /** X against a Portfolio (not available for Sleeves) allows user to remove the mapping between the Portfolio 
         * and the model and the Portfolio gets removed from the list after asking for a confirmation from the user. */
        console.log('unassign PortfolioId--', this.selectedPortfolioId);

        Util.responseToObject<any>(this._modelService.unAssignPortfolioFromModel(this.modelId, this.selectedPortfolioId))
            .subscribe(response => {
                this.displayConfirm = false;
                this.getModelPortfolios(this.modelId);
                this.substitutedId = null;
                this.d3treeChartComponent.portfolioIdFromView = null;
                if (this.substitutedId != 0) {
                    this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), this.modelId);
                }
            });
    }

    /** Delete check based on accounts length */
    private unassignConfirm(portfolioId: number) {
        this.displayConfirm = true;
        this.selectedPortfolioId = portfolioId;
        console.log('selectedPortfolioId--', portfolioId);
    }

    /** 
     * ::GETS-API:: 
    **/

    /** Gets the model portfolios based on Model Id */
    getModelPortfolios(modelId: number) {
        let permission = Util.getPermission(PRIV_APPROVEMODELASS);
        // console.log('user permissions for Model Assignment', permission);
        this.responseToObject<IModelPortfolios[]>(this._modelService.getModelPortfolios(modelId))
            .subscribe(model => {
                this.modelPortfolios = model;
                this.checkStatusAwaitingList(model);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** Gets Approval list of pending Portfolios of Model  */
    getApprovalPortfolioslistOfModels() {
        this.responseToObject<IModelPortfolioApprovalList[]>(this._modelService.getApprovalPortfolioslistOfModels(this.modelId))
            .subscribe(model => {
                this.portfoliosAwaitingList = model;
                this.modelGridOptions.api.collapseAll();
                this.setFilter = true;
                console.log('portfolios Awaiting List------', model);
            });
    }

    /** get Sleeved Accounts for give Model */
    getModelSleeves(modelId: number) {
        // let permission = Util.getPermission(PRIV_APPROVEMODELASS);
        // console.log('user permissions for Model Assignment', permission);
        this.responseToObject<IModelSleevedAccount[]>(this._modelService.getSleevedAccountsForModel(modelId))
            .subscribe(model => {
                this.modelSleevedAccounts = model;
                console.log("this.model Sleeved Accounts", model);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** 
     * ::CHECKS:: 
    **/

    /** check for the status Await8ing Approval */
    checkStatusAwaiting(modelPortfolio: any) {
        if (modelPortfolio.status == 'PENDING') {
            this.dispAwaitingApproval = '(PA)';
            return (modelPortfolio.status == 'PENDING');
        }
    }

    /** check whether the portfolio has substitute.
     *  If Portfolio has substituted Model, then display *
     */
    checkPortfolioHasSubstitute(modelPortfolio: any) {
        if (modelPortfolio.substitutedModelId != null) {
            this.hasSubstitute = '*';
            this.flagDispPfHasSubstitute = true;
            return (modelPortfolio.substitutedModelId != null)
        }
    }

    flagDispSleeveHasSubstitute: boolean = false;

    /** check whether the portfolio has substitute.
     *  If Portfolio has substituted Model, then display *
     */
    checkSleevedAccHasSubstitute(modelPortfolio: any) {
        if (modelPortfolio.substitutedModelId != null) {
            this.hasSubstitute = '*';
            this.flagDispSleeveHasSubstitute = true;
            return (modelPortfolio.substitutedModelId != null)
        }
    }

    /** check for pending portfolio status
     *  If pending portfolios are there, then display Legend below
     *  with Approve Assignment link enabled provided user should have
     *  APPROVE MODEL ASSIGNMENT privilege
     */
    checkStatusAwaitingList(modelPortfolios: IModelPortfolios[]) {
        let permission = Util.getPermission(PRIV_APPROVEMODELASS);
        this.isLinkDisabled = (permission.canRead) ? false : true;
        this.flagDispApprovalReject = (this.isInArray("PENDING", modelPortfolios));
    }

    /** 
     * ::HELPERS:: 
    **/

    /** checks for the existense of string within array */
    isInArray(string, array) {
        return array.some(function (el) {
            return el.status === string;
        });
    }

    // setTags(modelingModel: IModel) {
    //     if (modelingModel.tags != '')
    //         this.tags = modelingModel.tags.split(',');
    // }

    /** 
     * ::SETTINGS:: 
    **/

    /** While initialload set the portfolio radio active */
    setPortfoliosWhileLoad() {
        this.radioportfolio = "portfolios";
        this.radiosleeve = "";
        this.flagMP_AllocSection = false;
        this.flagSlv_AllocSection = false;
    }

    /** set portfolios option when portfolio is selected*/
    setPortfolios() {
        this.radioportfolio = "portfolios";
        this.radiosleeve = "";
        this.flagMP_AllocSection = false;
        this.flagSlv_AllocSection = false;
        this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), this.modelId);
        this.modelPortfolios.forEach(x => x.isSelected = false);

    }

    /** set sleeves option when sleeves is selected*/
    setSleeves() {
        this.radiosleeve = "sleeves";
        this.radioportfolio = "";
        this.flagSlv_AllocSection = false;
        this.flagMP_AllocSection = false;
        this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), this.modelId);
        this.modelSleevedAccounts.forEach(x => x.isSelected = false);
    }

    /** 
     * ::ASSIGNS:: 
    **/

    /** Fires when add button is clicked 
     *  This will assign the selected portfolio to specific model
     */
    assignPortfolioToModel() {

        /** ‘Search and Add’ search box allows user to search for a particular Portfolio they have access to. 
         * The + icon would add the selected Portfolio / Sleeve Account to the list below. Once added to the list, 
         * the model would be assigned to the Portfolio. Depending upon Model Assignment Approval preference setting, 
         * the Portfolio could be auto-assigned without any approval if the preference is set to NO and would need 
         * approval for the new Portfolio-Model assignment if preference is set to YES. */

        console.log('Model Id assign Section -----', this.modelId,
            'PortfolioId assign section ----', this.selectedPortfolioId);
        this.assignPfToModel = <IAssignPortfolioToModel>{
            id: this.selectedPortfolioId,
            substitutedModelId: null
        };

        if (this.substitutedId != 0) {
            this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), this.modelId);
        }
        this.responseToObject<any>(this._modelService.assignPortfolioToModel(this.assignPfToModel, this.modelId))
            .subscribe(modelPortfolios => {
                this.newlyAssignedPortfolioId = this.selectedPortfolioId;
                console.log('newly Assigned PortfolioId -----', this.newlyAssignedPortfolioId)
                this.getModelPortfolios(this.modelId);
                this.selectedPortfolio = null;
            });


    }

    /** Fires when add button is clicked 
     *  This will assign the selected portfolio to specific model
     */
    assignSleeveToModel() {
        /** When Sleeve is selected, the below search box will search Sleeved Accounts. 
         * Sleeved accounts are account type set to “Sleeve”. The search could happen based 
         * on Portfolio Name, Account ID, Number or Tags, or Sleeve Portfolio name.
            Sleeved Account Assigned cannot be deleted. Edit in model assignment can happen for Sleeves
.        */
        console.log('Model Id assign Section -----', this.modelId,
            'Sleeve Account id assign section ----', this.selectedSleeveAccountId);
        this.assignSlvToModel = <IAssignSleeveToModel>{
            id: this.selectedSleeveAccountId,
            substitutedModelId: null
        };
        if (this.substitutedId != 0) {
            this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), this.modelId);
        }
        this.responseToObject<any>(this._modelService.assignSleeveToModel(this.assignSlvToModel, this.modelId))
            .subscribe(modelSleeves => {
                this.getModelSleeves(this.modelId);
                this.selectedSleeve = null;
            });

    }

    /** 
     * ::DISPLAY SECTIONS:: 
    **/

    /** Fires when portfolio is selected from the list */
    displaySecMPAllocation(portfolioId: number) {
        /** There needs to be an API call every time a Portfolio is selected and Portfolio-Model 
         * Allocation tab is in expanded state to display the current and Target allocation of the 
         * Securities under that Portfolio. Once selected, the information corresponding to the selected 
         * Portfolio should get displayed in this section. */
        this.substitutedId = null;
        this.initializeAllocations();
        this.substitutedPortfolioId = portfolioId;
        console.log('selected PortfolioId && Modelid--------------------------', portfolioId, this.modelId);
        this.modelPortfolios.forEach((pf, index) => { pf.isSelected = (pf.id == portfolioId) ? true : false; });
        this.flagMP_AllocSection = true; /** Set this true for displaying div section  */

        this.responseToObject<IModelPortfolioAllocation[]>(this._modelService.getModelPortfolioAllocation(portfolioId))
            .subscribe(model => {
                this.modelPortfolioAllocations = model;
                this.calculateMPAllocTotals(model);
                console.log('model Portfolio allocations -----', model);
                this.d3treeChartComponent.setPortfolioId(portfolioId);
            }
            );


        /*---------------------------------------------------------------------------------------------------------
 -------------------------------View substitute-------------------------------------------------------------
 ----------------------------------------------------------------------------------------------------------- */
        let portfolioDetails = this.modelPortfolios.filter(x => x.id == portfolioId);
        this.substitutedId = portfolioDetails[0]['substitutedModelId'];
        let modelId = (this.substitutedId) ? this.substitutedId : this.modelId;
        if (portfolioDetails[0].status == "PENDING")
            this.d3treeChartComponent.portfolioPending = true;
        else
            this.d3treeChartComponent.portfolioPending = false;
        this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), modelId);
        this.d3treeChartComponent.setSubstitutedModelId(this.substitutedId);
    }

    /** Fires when portfolio is selected from the list */
    displaySecSlvAllocation(sleeveAccId: number) {
        console.log('selected PortfolioId && Modelid--------------------------', sleeveAccId, this.modelId);
        this.initializeAllocations();
        this.modelSleevedAccounts.forEach((slv, index) => { slv.isSelected = (slv.id == sleeveAccId) ? true : false; });
        this.flagSlv_AllocSection = true; /** Set this true for displaying div section  */
        this.responseToObject<ISleevedAccountAllocation[]>(this._portfolioService.getSleevedAccountAllocation(sleeveAccId))
            .subscribe(model => {
                this.sleeveAllocations = model;
                this.calculateSlvAllocTotals(model);
                console.log('model Sleeve allocations -----', model);
            });


        /*---------------------------------------------------------------------------------------------------------
-------------------------------View substitute-------------------------------------------------------------
----------------------------------------------------------------------------------------------------------- */
        this.substitutedSleeveId = sleeveAccId;
        let sleevedAccountDetails = this.modelSleevedAccounts.filter(x => x.id == sleeveAccId);
        this.substitutedId = sleevedAccountDetails[0]['substitutedModelId'];
        let modelId = (this.substitutedId) ? this.substitutedId : this.modelId;
        this.d3treeChartComponent.portfolioPending = false;
        this.d3treeChartComponent.gettingIsSleevedFlagFromView(true);
        this.d3treeChartComponent.portfolioIdFromView = sleeveAccId;
        this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus.toLowerCase(), modelId);
        if (this.substitutedId)
            this.d3treeChartComponent.setSubstitutedModelId(this.substitutedId);

    }

    /** 
     * ::TOTAL CALCULATIONS:: 
    **/

    /** Calculate the total allocations of selected portfolio */
    calculateMPAllocTotals(mp_TargetAllocation: IModelPortfolioAllocation[]) {
        if (mp_TargetAllocation.length > 0) {
            this.structMPAllocation = <IPortfolioTotalTargetAllocationVM>{
                targetInAmt: (mp_TargetAllocation.map(m => m.targetInAmt).length > 1) ?
                    mp_TargetAllocation.map(m => m.targetInAmt).reduce((a, b) => a + b, 0)
                    : mp_TargetAllocation[0].targetInAmt,
                currentInAmt: (mp_TargetAllocation.map(m => m.currentInAmt)) ?
                    mp_TargetAllocation.map(m => m.currentInAmt).reduce((a, b) => a + b, 0)
                    : mp_TargetAllocation[0].currentInAmt,
                targetInPercent: (mp_TargetAllocation.map(m => m.targetInPercent)) ?
                    mp_TargetAllocation.map(m => m.targetInPercent).reduce((a, b) => a + b, 0)
                    : mp_TargetAllocation[0].targetInPercent,
                currentInPercent: (mp_TargetAllocation.map(m => m.currentInPercent)) ?
                    mp_TargetAllocation.map(m => m.currentInPercent).reduce((a, b) => a + b, 0)
                    : mp_TargetAllocation[0].currentInPercent
            }
        }
    }

    /** Calculate the total allocations of selected portfolio */
    calculateSlvAllocTotals(slv_TargetAllocation: ISleevedAccountAllocation[]) {
        if (slv_TargetAllocation.length > 0) {
            this.structSlvAllocation = <ISleevedAccountTotalTargetAllocationVM>{
                targetInAmt: (slv_TargetAllocation.map(m => m.targetInAmt).length > 1) ?
                    slv_TargetAllocation.map(m => m.targetInAmt).reduce((a, b) => a + b, 0)
                    : slv_TargetAllocation[0].targetInAmt,
                currentInAmt: (slv_TargetAllocation.map(m => m.currentInAmt)) ?
                    slv_TargetAllocation.map(m => m.currentInAmt).reduce((a, b) => a + b, 0)
                    : slv_TargetAllocation[0].currentInAmt,
                targetInPercent: (slv_TargetAllocation.map(m => m.targetInPercent)) ?
                    slv_TargetAllocation.map(m => m.targetInPercent).reduce((a, b) => a + b, 0)
                    : slv_TargetAllocation[0].targetInPercent,
                currentInPercent: (slv_TargetAllocation.map(m => m.currentInPercent)) ?
                    slv_TargetAllocation.map(m => m.currentInPercent).reduce((a, b) => a + b, 0)
                    : slv_TargetAllocation[0].currentInPercent
            }
        }
    }

    /** Calculate the total allocations of Current Model */
    calculateMAllocTotals(m_TargetAllocation: IModelTargetAllocation[]) {
        if (m_TargetAllocation.length > 0) {
            this.structMTargetAllocation = <IModelTargetAllocationVM>{
                targetInPercent: (m_TargetAllocation.map(m => m.targetInPercent).length > 1) ?
                    m_TargetAllocation.map(m => m.targetInPercent).reduce((a, b) => a + b, 0)
                    : m_TargetAllocation[0].targetInPercent
            }
        }
    }

    /** 
     * GRID EVENTS
    **/

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.modelColumnDefs = [
            <ColDef>{ headerName: "Portfolio Name", field: "portfolio.name", width: 125, checkboxSelection: true },
            <ColDef>{ headerName: "Old Model", field: "oldModel.name", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "New Model", field: "newModel.name", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Requestor User Id", field: "requesterUser", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Created Date", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center', filter: 'text' },
        ];
    }

    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            let contextParams = params.api.context.contextParams.seed;
            this.modelGridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    //console.log('column event type : ' + type);
                    //console.log('column event : ' + event);
                    contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }

    /** Event fires on grid row click  */
    onRowClicked(event) {
        this.selectedGridPortfolioId = event.data.portfolio.id;
        this.tabsModel.id = event.data.portfolio.id;
        // this.rowType = event.data.type;
    }

    /** 
     * APPROVE/REJECT PORTFOLIO/S SECTION
    **/

    /** Show Pop up for Model-Portfolio Approve/Reject  */
    showPortfolioModelApprovalPopup() {
        this.displayPfMdlApprvlSec = true;
        this.getApprovalPortfolioslistOfModels();
    }

    /** Approves Or Rejects Portfolios of a Model which is/are in Awaiting state */
    approveOrRejectModelPortfolio(actionStatus: string) {
        console.log('selected Grid Multiple PortfolioIds----', this.selectedGridMultiplePortfolioIds)

        this.approveRejectModelPortfolios = <IApproveRejectModelPortfolios>{
            portfolioIds: this.selectedGridMultiplePortfolioIds
        };

        Util.responseToObject<any>(this._modelService.approveOrRejectModelPortfolio(this.modelId,
            actionStatus,
            this.approveRejectModelPortfolios))
            .subscribe(model => {
                this.displayPfMdlApprvlSec = false;
                this.getModelPortfolios(this.modelId);
            });
    }

    /** Select row on checkbox check  */
    checkboxSelection(node) {
        if (node.rowModel.context.contextParams.seed.gridOptions.context != undefined) {
            let portfolioId = node.rowModel.context.contextParams.seed.gridOptions.context.portfolioId;
            if (node.level == 0 && node.data.portfolio.id == portfolioId) {
                if (node.selected)
                    node.setSelected(true);
                else
                    node.setSelected(false);
            }
        }
    }

    /** handles multi selected portfolios associated to current Model */
    handleCheckboxSelectedItems(event) {
        this.selectedGridMultiplePortfolioIds = [];
        let portfolio = <IModelPortfolioApprovalList[]>this.modelGridOptions.api.getSelectedRows();
        console.log("onRowSelected in Model - Portfolio Approval List: ", portfolio);
        this.selectedGridMultiplePortfolioIds = portfolio.map(m => m.portfolio.id);
    }

    /** Sets the display modes (enable/disable) for Approve and Reject buttons */
    setDisplayModesForApproveRejectButtons() {
        if (Object.keys(this.selectedGridMultiplePortfolioIds).length > 0) {
            this.btnApproveDisable = false;
            this.btnRejectDisable = false;
        }
        else {
            this.btnApproveDisable = true;
            this.btnRejectDisable = true;
        }
        return true;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        $("#context-dd-menu").css({ display: 'none' });
        let pattern = /[0-9]+/g;
        if ((targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|input) id=')) || (targetElement.outerHTML.match('<span'))) return;
        let matches = targetElement.outerHTML.match(pattern);
        if (matches != null) {
            console.log('matches-------------------', matches);
            let [id = 0, val = 0] = matches;
            this.gridContext.portfolioId = id;
            this.modelGridOptions.api.forEachNode(this.checkboxSelection);
        }
    }

    onModelStatusChange(modelStatus) {
        //  Disable the Assign portfolio button when model status is pending 
        // let currentModel = this.modelingModel; /* FIX FOR 2179 */
        if (this.modelingModel != null) {
            this.disableAssignButton = ((modelStatus == 'pending') ||
                (this.modelingModel.currentStatusId == null && this.modelingModel.status != "Approved")) ? true : false;
        }
        $("#context-dd-menu").css({ display: 'none' });
        this.modelStatus = modelStatus.toLowerCase();
        this.d3treeChartComponent.displayChartByModelStaus(this.modelStatus, (this.substitutedId) ? this.substitutedId : this.modelId);
    }

    isCsselected(modelStatus) {
        return (this.modelStatus.toLowerCase() == modelStatus.toLowerCase()) ? "btn  btn-blue btn-sm" : "btn  btn-sm btn-gary"
    }

    reDirectToEdit() {
        if (this.substitutedId)
            return this._router.navigate(['/eclipse/model/viewstructure', this.modelId, this.modelStatus, this.substitutedId, this.substitutedPortfolioId, this.substitutedSleeveId, true]);
        else
            return this._router.navigate(['/eclipse/model/edit', this.modelId, this.modelStatus]);
    }
    showData(event) {
        if (typeof event === "boolean") {
            this.isDisableBtnEdit = event;
        }
    }
    getModelData(event) {
        if (event) {
            let statusId = (event.currentStatusId != null) ? (event.currentStatusId != event.statusId) ? event.currentStatusId : event.statusId : event.statusId;
            let status = (event.currentStatusId != null) ? (event.currentStatusId != event.statusId) ? event.currentStatus : event.status : event.status;
            event.status = status;
            event.statusId = statusId;
            this.modelingModel = event;
            this.displayAssignPortfolioBtn();
        }
    }
    showToggle(toggleId) {
        d3.select("#context-dd-menu").style("display", "none");
        $("button.active").removeClass("active");
        $(this).addClass("active");
        if (toggleId == 2) {
            $("#blk-1").hide();
            $("#blk-2").show();
            $("#rd1").removeClass("active");
            $('#rdb2').addClass("active");
            // $('.right-hbox-container').css("right", -375);
            $(".left-hbox-container").addClass('showme');
            $('#viewstructure_container').hide();
        }
        else {
            $('#viewstructure_container').show();
            // if (this.saveTreeData != undefined) {
            //     let isvalid = (this.saveTreeData.children.length > 0) ? true : false;
            //     if (!this.isValidData && isvalid) {
            //         $("#blk-1").hide();
            //         $("#blk-2").show();
            //         $("#rd1").removeClass("active");
            //         if (!$("#rdb2").hasClass("active")) {
            //             $('#rdb2').addClass("active");
            //         }
            //         // $('.right-hbox-container').css("right", -375);
            //         $(".left-hbox-container").addClass('showme');
            //         return false;
            //     }
            //     else {
            //         $("#blk-1").show();
            //         $("#blk-2").hide();
            //         $("#rd2").removeClass("active");
            //         $('#rdb1').addClass("active");
            //         $('.right-hbox-container').css("right", 0);
            //         // $(".left-hbox-container").removeClass('showme');
            //         this.d3treeChartComponent.isValidStructure();
            //     }

            // }
            // else {
            $("#blk-1").show();
            $("#blk-2").hide();
            $('.right-hbox-container').css("right", 0);
            $("#rd2").removeClass("active");
            $('#rdb1').addClass("active");
            $('.right-hbox-container').css("right", 0);
            $(".left-hbox-container").removeClass('showme');
            //}


        }

    }

    /*
    Method used to disable or enable the Assign portfolio button
    */
    displayAssignPortfolioBtn() {
        /* FIX FOR 2179 */
        if (this.modelingModel != null) {
            this.disableAssignButton = (this.modelingModel.currentStatusId == null &&
                this.modelingModel.status != "Approved") ? true : false;
        }
    }
    onChangeTab() {
        this.modelPortfolios.forEach(x => x.isSelected = false);
        this.modelSleevedAccounts.forEach(x => x.isSelected = false);
        this.setPortfoliosWhileLoad();
        this.setPortfolios();
    }
}