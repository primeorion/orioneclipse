import { Component, Input, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ModelInformationTabNavComponent } from '../shared/modelInformation.tabnav.component';
import { SessionHelper } from '../../../core/session.helper';
import { Observable } from 'rxjs/Rx';
import { ModelService } from '../../../services/model.service';
import { IModelManagementStyles } from '../../../models/modeling/modelmanagementStyles';
import { IModelStatus } from '../../../models/modeling/modelstatus';
import { IModel, IModelAdd } from '../../../models/modeling/model';
import { Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import * as Util from '../../../core/functions';
import { TagInputComponent } from '../../../shared/tags/tag-input.component';
import { IRole } from '../../../models/role';
@Component({
    selector: 'eclipse-dashboard-overview',
    templateUrl: './app/components/model/information/add.component.html',
    providers: [ModelService]
})
export class ModelAddComponenet extends BaseComponent {
    userId: number = 0;
    private managementStylesList: IModelManagementStyles[] = [];
    private modelStatusList: IModelStatus[] = [];
    private modelCurrentStatusList: IModelStatus[] = [];

    private modelSaveData: IModelAdd = <IModelAdd>{};
    @Input() tagsLst: any[] = [];
    nameSpaceValidation: boolean = false;
    modelId: number;
    @ViewChild(TagInputComponent) taginputComponent: TagInputComponent;
    modelStatus: string
    lastModified: string;
    isDynamicReadOnly: boolean = false
    setModelStatusid: number;
    constructor(private _modelService: ModelService, private _router: Router, private activateRoute: ActivatedRoute) {
        super();
        this.modelId = Util.getRouteParam<number>(activateRoute);
        //this.modelStatus = (Util.getRouteParam<string>(activateRoute, 'nstatus') != null) ? Util.getRouteParam<string>(activateRoute, 'nstatus') : "APPROVED";
        this.modelStatus = Util.getRouteParam<string>(activateRoute, 'nstatus');
        this.isDynamicReadOnly = (this.modelId != undefined) ? true : false;

    } 

    ngOnInit() {
        let that = this;
        // that.bindModelDisplaydata();
        let sessionHelper = new SessionHelper();
        let user = sessionHelper.getUser();
        that.userId = user.id;
        let apiArray = [];
        apiArray.push(this._modelService.getModelManagementStyles().map((response: Response) => <IModelManagementStyles[]>response.json()));
        apiArray.push(this._modelService.getModelStatus().map((response: Response) => <IModelStatus[]>response.json()));

        Observable.forkJoin(apiArray)
            .subscribe((data: any[]) => {
                this.managementStylesList = data[0];
                this.modelStatusList = data[1];
                this.modelCurrentStatusList = data[1];

                if (that.modelId != undefined && that.modelId != 0) {

                    that.responseToObject<any>(that._modelService.getModelDetail(that.modelId))
                        .subscribe(model => {
                            that.userId = model.ownerUserId;
                            // permission 
                            let permission = Util.getPermission(PRIV_APPROVEMODELCHG);
                            // based on current status display the Model Status     
                            this.setModelStatusid = model.statusId;
                            // let modelStatus = (model.currentStatusId != null) ? (model.currentStatusId != model.statusId) ? model.currentStatusId : model.statusId : model.statusId;
                            that.modelSaveData = <IModelAdd>{
                                name: model.name,
                                description: model.description,
                                statusId: model.statusId,
                                currentStatusId: model.currentStatusId,
                                isDynamic: model.isDynamic,
                                managementStyleId: (model.managementStyleId == null) ? 0 : model.managementStyleId,
                                nameSpace: model.nameSpace,
                                tags: model.tags
                            };
                            this.lastModified = model.editedOn;
                            if (model.tags != null) {
                                that.tagsLst = model.tags.split(",");
                                this.taginputComponent.setTagList(that.tagsLst);
                            }
                            else {
                                that.tagsLst = [];
                            }
                            if (that.modelSaveData.statusId == 4) {
                                this.modelStatusList = this.modelStatusList.filter(x => x.id == that.modelSaveData.statusId)
                            }
                            else if (that.modelSaveData.statusId == 3) {
                                if (permission.canRead) {
                                    this.modelStatusList = this.modelStatusList.filter(x => x.id != 4 && x.id != 2);
                                }
                                else {
                                    this.modelStatusList = this.modelStatusList.filter(x => x.id != 4 && x.id != 2 && x.id != 1);
                                }
                            }
                            else if (that.modelSaveData.statusId == 1) {
                                this.modelStatusList = this.modelStatusList.filter(x => x.id != 4 && x.id != 3);
                            }

                            // currentStatusId
                            if (that.modelSaveData.currentStatusId == 4) {
                                this.modelCurrentStatusList = this.modelCurrentStatusList.filter(x => x.id == that.modelSaveData.currentStatusId)
                            }
                            else if (that.modelSaveData.currentStatusId == 3) {
                                if (permission.canRead) {
                                    this.modelCurrentStatusList = this.modelCurrentStatusList.filter(x => x.id != 4 && x.id != 2);
                                }
                                else {
                                    this.modelCurrentStatusList = this.modelCurrentStatusList.filter(x => x.id != 4 && x.id != 2 && x.id != 1);
                                }
                            }
                            else if (that.modelSaveData.currentStatusId == 1) {
                                this.modelCurrentStatusList = this.modelCurrentStatusList.filter(x => x.id != 4 && x.id != 3);
                            }
                        });
                }
                else {
                    that.modelSaveData = <IModelAdd>{
                        isCommunityModel: false,
                        statusId: 3,
                        currentStatusId: null,
                        managementStyleId: 0,
                        nameSpace: user.teams[0].name
                    };
                }
            });
    }

    bindModelDisplaydata() {
        let apiArray = [];
        apiArray.push(this._modelService.getModelManagementStyles().map((response: Response) => <IModelManagementStyles[]>response.json()));
        apiArray.push(this._modelService.getModelStatus().map((response: Response) => <IModelStatus[]>response.json()));

        Observable.forkJoin(apiArray)
            .subscribe((data: any[]) => {
                this.managementStylesList = data[0];
                this.modelStatusList = data[1].move(2, 0);

            });
    }
    IsValidForm() {
        if (this.modelSaveData.name && this.modelSaveData.statusId && this.modelSaveData.nameSpace) {
            return true;
        }
        return false;

    }
    onSubmit(_modelSave: IModelAdd) {
        this.nameSpaceValidation = false;
        _modelSave.tags = (this.tagsLst.length > 0) ? this.tagsLst.join(",") : null;
        if (!_modelSave.isDynamic) {
            _modelSave.isDynamic = false;
        }
        if (_modelSave.managementStyleId == 0) {
            _modelSave.managementStyleId = null
        }
        this.ResponseToObjects<IModelAdd>(this._modelService.validateModelNamespace(_modelSave.name, _modelSave.nameSpace))
            .subscribe(model => {
                if (this.modelId == undefined) {
                    if (model.length < 1) {
                        //   save the data
                        this._modelService.addModel(_modelSave)
                            .map((response: Response) => <IModelAdd>response.json())
                            .subscribe(model => {
                                this._router.navigate(['/eclipse/model/viewstructure/', + model.id]);
                            }, error => {
                                // console.log(error);
                                throw error;
                            });

                    }
                    else {
                        this.nameSpaceValidation = true;
                    }
                }
                else {
                    if (model.length > 0) {
                        if (+this.modelId == model[0].id) {
                            // if (this.setModelStatusid == 3 && _modelSave.statusId == 1) {
                            //     // _modelSave.statusId = this.setModelStatusid;
                            // }
                            // else if (this.setModelStatusid != _modelSave.statusId) {
                            //     _modelSave.statusId = this.setModelStatusid;
                            // }

                            // Update Data
                            _modelSave.id = +this.modelId;
                            this._modelService.updateModel(_modelSave)
                                .map((response: Response) => <any>response.json())
                                .subscribe(model => {
                                    // if (this.modelStatus == undefined) {
                                    //     this.modelStatus = (model.currentStatusId != 1) ? "approved" : "pending";
                                    // }
                                    let cs = (model.currentStatusId != null) ? ((model.currentStatusId == 1) ? "approved" : "pending") : ((model.statusId != 1) ? "pending" : "approved");

                                    this._router.navigate(['/eclipse/model/viewstructure/', + model.id, cs]);
                                }
                                , error => {
                                    //console.log(error);
                                    throw error;
                                });
                        }
                        else {
                            this.nameSpaceValidation = true;
                        }
                    }
                    else {
                        // if (this.setModelStatusid == 3 && _modelSave.statusId == 1) {
                        //     // _modelSave.statusId = this.setModelStatusid;
                        // }
                        // else if (this.setModelStatusid != _modelSave.statusId) {
                        //     _modelSave.statusId = this.setModelStatusid;
                        // }

                        // Update Data
                        _modelSave.id = +this.modelId;
                        this._modelService.updateModel(_modelSave)
                            .map((response: Response) => <any>response.json())
                            .subscribe(model => {
                                if (this.modelStatus == undefined) {
                                    this.modelStatus = (model.currentStatusId != 1) ? "approved" : "pending";
                                }
                                this._router.navigate(['/eclipse/model/viewstructure/', + model.id, this.modelStatus.toLowerCase()]);
                            }
                            , error => {
                                //console.log(error);
                                throw error;
                            });
                    }
                }
            });
    }

    validateModelnameByNamespace(modelname, modelnameSpace) {
        let resultnamespace = true;
        this.ResponseToObjects<any[]>(this._modelService.validateModelNamespace(modelname, modelnameSpace))
            .subscribe(model => {
                if (model.length > 0) {
                    resultnamespace = false;
                }
            });
        return resultnamespace;
    }
    routeModelInfo() {
        if (this.modelId) {
            this._router.navigate(['/eclipse/model/edit/', + this.modelId, this.modelStatus.toLowerCase()]);
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
            return false

        }
    }
    onCancel() {
        // if (this.modelId) {
        //     this._router.navigate(['/eclipse/model/view/', + this.modelId]);
        // }
        // else {
        this._router.navigate(['/eclipse/model/list/']);
        // }
    }
    setReadOnlyIsDynamic() {
        return false;
        //return (this.modelId != undefined) ? false : true;
    }
}
