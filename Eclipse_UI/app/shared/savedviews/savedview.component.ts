import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../core/functions';
import { IView, IViews, IColDef, IUpdateView  } from '../../models/views';
import { ISavedView } from '../../viewmodels/savedview';
export * from '../../viewmodels/savedview';
import { ViewsService } from '../../services/views.service';

@Component({
    selector: 'eclipse-savedviews',
    templateUrl: './app/shared/savedviews/savedview.component.html',
    properties: ['viewTypeId'],
    providers: [ViewsService],
    directives: [Dialog, FORM_DIRECTIVES]
})

export class SavedViewComponent {
    @Input() model: ISavedView;
    viewTypeId: number = 0;
    view: IViews;
    savedViews: IViews[];
    saveViewAsControlGroup: ControlGroup;
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

    @Output() parentCallback = new EventEmitter();
    constructor(private _builder: FormBuilder, private _viewsService: ViewsService) {
        this.view = <IViews>{};
        this.createSaveViewControlGroup();
        this.view.isDefault = 0;
        this.view.isPublic = 0;
    }

    ngOnInit() {
        //console.log('saved views ngOnInit()');
        this.loadSavedViews();
    }

    /** Get custom view list to bind CustonView drop down */
    loadSavedViews() {
        Util.responseToObjects<IViews>(this._viewsService.getSavedViewsByTypeId(this.viewTypeId))
            .subscribe(portfolioViews => {
                let defaultView = portfolioViews.find(d => d.isDefault == 1);
                this.loggedInUserViewsCount = portfolioViews.length;
                if (this.loggedInUserViewsCount > 0 && defaultView != undefined) {
                    this.model.id = portfolioViews.find(d => d.isDefault == 1).id;
                    this.savedViews = Util.sortBy(portfolioViews);
                    this.getView(this.model.id);
                } else {
                    this.model.id = 0;
                    this.parentCallback.emit('load parent grid data');
                }
            });
    }

    /** Save ag-grid modified view */
    saveViewAs(form) {
        if (form == undefined || form.valid) {
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
                this.updateView.filter = "portfolioStatusId";
                this.updateView.gridColumnDefs = { filters: gridFilters, columnDefs: columnDefs };
                console.log('saved view update : ', this.updateView);

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
                this.saveView.name = form.value.name;
                this.saveView.viewTypeId = this.viewTypeId;
                this.saveView.isDefault = this.view.isDefault == 1 ? true : false;
                this.saveView.isPublic = this.view.isPublic == 1 ? true : false;
                this.saveView.filter = "portfolioStatusId";
                this.saveView.gridColumnDefs = { filters: gridFilters, columnDefs: columnDefs };
                console.log('saved view new/copy : ', this.saveView);

                Util.responseToObject<IViews>(this._viewsService.addView(this.saveView))
                    .subscribe(m => {
                        // To refresh 'select customm view' drop down list with newly created view
                        this.refreshCustomViews();
                        this.resetSaveViewAsForm();
                        this.model.id = m.id;
                        this.getView(this.model.id);
                    });
            }
        }
        else {
            this.isNameRequired = true
        }
    }

    /** To refresh 'select customm view' drop down list with newly created view */
    refreshCustomViews() {
        Util.responseToObjects<IViews>(this._viewsService.getSavedViewsByTypeId(this.viewTypeId))
            .subscribe(portfolioViews => {
                this.savedViews = Util.sortBy(portfolioViews);
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
    }

    /** To reset save view as popup form */
    private resetSaveViewAsForm() {
        this.isNameRequired = false;
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
            } else {
                //It will execute if user clicks NO button on popup
                this.model.exitWarning.show = false;
                this.getView(this.model.id);
            }
        } else {
            //To check is NO button clicking on page navigation or update view 
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

    /** Save View As Portfolio */
    private createSaveViewControlGroup() {
        this.saveViewAsControlGroup = this._builder.group({
            name: new Control('', Validators.required)
        });
    }

    /** To delete view */
    deleteView(viewId: number) {
        console.log('model id 1 : ', this.model.id);
        Util.responseToObject<IView>(this._viewsService.deleteView(viewId))
            .subscribe(m => {
                this.loadSavedViews();
                this.displayDeleteConfirmDialog = false;
            });
    }

    /** Fires on update view click  */
    onUpdateViewClick() {
        this.displayUpdateConfirmDialog = true;
        this.isUpdate = true;
        this.view = this.cloneView;
    }

    /** Fires on save view as click  */
    onSaveViewAsClick() {
        this.popupText = "Save View As";
        this.displaySaveViewAsDialog = true;
        this.view = <IViews>{};
    }

    /** Fires on copy view as click  */
    onCopyViewClick() {
        this.popupText = "Copy View As";
        this.displaySaveViewAsDialog = true;
        this.view = this.cloneView;
        this.view.name = '';
        this.view.id = 0;
    }

    /** Fires on set as default view click */
    onSetAsDefaultClick(viewId: number) {
        Util.responseToObject<any>(this._viewsService.setAsDefaultView(viewId))
            .subscribe(m => {
                console.log('from set as deafult view : ', m);
            });
    }

}