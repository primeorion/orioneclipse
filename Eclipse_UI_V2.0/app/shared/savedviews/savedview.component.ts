import { Component, Input, Output, EventEmitter } from '@angular/core';

import { GridOptions, ColDef } from 'ag-grid/main';
import * as Util from '../../core/functions';
import { IView, IViews, IColDef, IUpdateView  } from '../../models/views';
import { ISavedView } from '../../viewmodels/savedview';
export * from '../../viewmodels/savedview';
import { ViewsService } from '../../services/views.service';

@Component({
    selector: 'eclipse-savedviews',
    templateUrl: './app/shared/savedviews/savedview.component.html',
    //properties: ['viewTypeId'],
    //providers: [ViewsService],
    //directives: [Dialog, FORM_DIRECTIVES]
})

export class SavedViewComponent {
    @Input() model: ISavedView;
    @Input() viewTypeId: number = 0;
    view: IViews;
    savedViews: IViews[];
    //saveViewAsControlGroup: ControlGroup;
    isNameRequired: boolean = false;
    displaySaveViewAsDialog: boolean = false;
    saveView: IView = <IView>{};
    isManual: boolean = false;
    filterModel: any;
    displayUpdateConfirmDialog: boolean = false;
    displayDeleteConfirmDialog: boolean = false;
    updateView: IUpdateView = <IUpdateView>{};
    isUpdate: boolean = false;
    loggedInUserViewsCount: number = 0;
    cloneView: IViews;
    popupText: string = '';
    isViewNameExists: boolean = false;
    isSetDefault: boolean = false;
    isViewDeleted: boolean = false;

    @Output() parentCallback = new EventEmitter();
    @Output() parentColDefCallback = new EventEmitter();
    constructor(private _viewsService: ViewsService) {
        this.view = <IViews>{};
        //  this.createSaveViewControlGroup();
        this.view.isDefault = 0;
        this.view.isPublic = 0;
    }

    ngOnInit() {
        this.loadSavedViews();
    }

    /** Get custom view list to bind CustonView drop down */
    loadSavedViews() {
        Util.responseToObjects<IViews>(this._viewsService.getSavedViewsByTypeId(this.viewTypeId))
            .subscribe(Views => {
                this.savedViews = Util.sortBy(Views);
                let defaultView = Views.find(d => d.isDefault == 1);
                this.loggedInUserViewsCount = Views.length;
                if (defaultView != undefined) { //this.loggedInUserViewsCount > 0 && 
                    this.model.id = Views.find(d => d.isDefault == 1).id;
                    this.getView(this.model.id);
                } else {
                    this.model.id = 0;
                    this.getView(this.model.id);
                    // this.parentColDefCallback.emit('load parent col defs');
                    // this.model.parentGridOptions.api.setColumnDefs(this.model.parentColumnDefs);
                    if (!this.isViewDeleted) {
                        this.isViewDeleted = false;
                        this.parentCallback.emit('load parent grid data');
                    }
                }
            });
    }

    /** Save ag-grid modified view */
    saveViewAs() {
        if (this.isViewNameExists) return;
        if (this.view.name != undefined) this.view.name = this.view.name.trim();
        if (this.view.name) {
            Util.responseToObject<any>(this._viewsService.checkViewNameExistence(this.view.name.trim(), +this.viewTypeId))
                .subscribe(m => {
                    this.isViewNameExists = m.length > 0;
                    if (this.view.id > 0) this.isViewNameExists = false;
                    if (this.isViewNameExists)
                        return;
                    else {
                        let gridFilters = this.model.parentGridOptions.api.getFilterModel();
                        let gridColumns = this.model.parentGridOptions.columnApi.getAllColumns();
                        let columnDefs = <IColDef[]>[];
                        gridColumns.forEach(element => {
                            let columnDef = <IColDef>{};
                            columnDef.id = element.getColId();
                            columnDef.name = element.getColDef().headerName;
                            columnDef.field = element.getColDef().field;
                            columnDef.width = element.getActualWidth();
                            columnDef.visible = element.isVisible();
                            columnDef.sortOrder = element.getSort();
                            columnDef.isSorted = element.isSortAscending();
                            columnDef.isFilterActive = element.isFilterActive();
                            columnDef.isColumnResized = (element.getActualWidth() != element.getColDef().width) ? true : false;
                            columnDefs.push(columnDef);
                        });

                        if (this.view.id > 0) {
                            this.updateView.id = this.view.id;
                            this.updateView.name = this.view.name;
                            this.updateView.viewTypeId = this.viewTypeId;
                            this.updateView.isDefault = (this.view.isDefault == 1);
                            this.updateView.isPublic = (this.view.isPublic == 1);
                            this.updateView.filter = "StatusId";
                            this.updateView.gridColumnDefs = { filters: gridFilters, columnDefs: columnDefs };
                            //console.log('saved view update : ', JSON.stringify(this.updateView));

                            Util.responseToObject<IViews>(this._viewsService.updateView(this.updateView))
                                .subscribe(m => {
                                    // To refresh 'select customm view' drop down list with newly created view
                                    this.refreshCustomViews();
                                    this.resetSaveViewAsForm();
                                    this.displayUpdateConfirmDialog = false;
                                    this.model.id = m.id;
                                    this.getView(this.model.id);
                                });
                        } else {
                            this.saveView.name = this.view.name;
                            this.saveView.viewTypeId = this.viewTypeId;
                            this.saveView.isDefault = this.view.isDefault == 1 ? true : false;
                            this.saveView.isPublic = this.view.isPublic == 1 ? true : false;
                            this.saveView.filter = "StatusId";
                            this.saveView.gridColumnDefs = { filters: gridFilters, columnDefs: columnDefs };
                            //console.log('saved view new/copy : ', JSON.stringify(this.saveView));

                            Util.responseToObject<IViews>(this._viewsService.addView(this.saveView))
                                .subscribe(m => {
                                    // To refresh 'select customm view' drop down list with newly created view
                                    this.refreshCustomViews();
                                    this.resetSaveViewAsForm();
                                    this.model.id = m.id;
                                    this.getView(this.model.id);
                                }, error => {
                                    console.log('error : ', error);
                                });
                        }
                    }
                });
        }
        else {
            this.isNameRequired = true
        }
    }

    /** To refresh 'select customm view' drop down list with newly created view */
    refreshCustomViews() {
        Util.responseToObjects<IViews>(this._viewsService.getSavedViewsByTypeId(this.viewTypeId))
            .subscribe(m => {
                this.savedViews = Util.sortBy(m);
            });
    }

    /** Fires on custom view drop down change */
    onCustomViewChange(params) {
        //console.log('is grid modified from saved view ts :', this.model.parentGridOptions.context.isGridModified);
        if (this.model.parentGridOptions.context.isGridModified) {
            this.isManual = true;
            this.model.exitWarning.show = true;
        } else {
            this.getView(params.target.value);
        }
    }

    /** To get custom view based viewId */
    getView(viewId: number) {
        if (viewId > 0) {
            Util.responseToObject<IViews>(this._viewsService.getView(viewId))
                .subscribe(view => {
                    this.cloneView = view;
                    this.isManual = false;
                    this.view = view;
                    this.view.isDefault = view.isDefault;
                    this.view.isPublic = view.isPublic;
                    this.convertColDef(view.gridColumnDefs);
                    this.parentCallback.emit('load parent grid data');
                });
        } else {
            this.model.id = viewId;
            this.parentColDefCallback.emit('load parent col defs');
            this.model.parentGridOptions.api.setColumnDefs(this.model.parentColumnDefs);
            this.parentCallback.emit('load parent grid data');
        }
    }

    /** To convert as column defs */
    convertColDef(colDefs: any) {
        this.filterModel = colDefs.filters;
        let customColDefs = [];
        this.model.parentColumnDefs.forEach(coldef => {
            let item = colDefs.columnDefs.find(cd => cd.field == coldef.field);
            if (item != undefined) {
                coldef.width = item.width;
                coldef.hide = !item.visible;
                coldef.sort = item.sortOrder;
            }
            customColDefs.push(coldef);
        });
        this.model.parentGridOptions.api.setColumnDefs(customColDefs);
    }

    /** Close Save View As popup */
    closeSaveViewDialog() {
        this.resetSaveViewAsForm();
        //To load default/custom view on cancel button click
        this.getView(this.model.id);
    }

    /** To reset save view as popup form */
    private resetSaveViewAsForm() {
        this.isNameRequired = false;
        this.isViewNameExists = false
        this.displaySaveViewAsDialog = false;
        //this.displayCopyViewAsDialog = false;
        this.view = <IViews>{};
        this.saveView = <IView>{};
    }

    /** Confirm when we are away from page */
    confirmClick(status: boolean) {
        if (this.isManual) {
            if (!status) {
                //It will execute if user clicks YES button on popup
                this.model.exitWarning.show = false;
                this.displaySaveViewAsDialog = true;
                this.view = <IViews>{};
            } else {
                //It will execute if user clicks NO button on popup
                this.model.exitWarning.show = false;
                this.displayUpdateConfirmDialog = false;
                this.getView(this.model.id);
            }
        } else {
            //To check: Is NO button clicked on 'page navigation' or 'update view' 
            if (this.isUpdate) {
                this.isUpdate = false;
                this.displayUpdateConfirmDialog = false;
            } else {
                this.model.exitWarning.show = false;
                this.displaySaveViewAsDialog = true;
                this.model.exitWarning.observer.next(status);
                this.model.exitWarning.observer.complete();
            }
        }
    }

    // /** Save View As Portfolio */
    // private createSaveViewControlGroup() {
    //     this.saveViewAsControlGroup = this._builder.group({
    //         name: new Control('', Validators.required)
    //     });
    // }

    /** To delete view */
    deleteView(viewId: number) {
        console.log('model id 1 : ', this.model.id);
        Util.responseToObject<IView>(this._viewsService.deleteView(viewId))
            .subscribe(m => {
                this.isViewDeleted = true;
                this.loadSavedViews();
                this.displayDeleteConfirmDialog = false;
            });
    }

    /** Fires on update view click  */
    onUpdateViewClick() {
        //this.displayUpdateConfirmDialog = true;
        this.saveViewAs();
        this.isUpdate = true;
        this.view = this.cloneView;
    }

    // /** Fires on save view as click  */
    // onSaveViewAsClick() {
    //     this.popupText = "Save View As";
    //     this.displaySaveViewAsDialog = true;
    //     this.view = <IViews>{};
    // }

    /** Fires on copy view as click  */
    onCopyViewClick() {
        this.popupText = "Copy View As";
        this.displaySaveViewAsDialog = true;
        if (this.cloneView != undefined) {
            this.view = this.cloneView;
            if (this.model.id == 0) {
                this.view.isDefault = 0;
                this.view.isPublic = 0;
            }
            this.view.name = '';
            this.view.id = 0;
        }

        if (this.isSetDefault) {
            this.isSetDefault = false;
            if (this.model.id > 0) 
                this.view.isDefault = 1;
        }
    }

    /** Fires on set as default view click */
    onSetAsDefaultClick(viewId: number) {
        Util.responseToObject<any>(this._viewsService.setAsDefaultView(viewId))
            .subscribe(m => {
                this.isSetDefault = true;
                console.log('from set as deafult view : ', m);
            });
    }

    /** To hide error messages */
    hideError() {
        if (this.view.name) {
            this.isNameRequired = false;
            this.isViewNameExists = false;
        }
    }

}