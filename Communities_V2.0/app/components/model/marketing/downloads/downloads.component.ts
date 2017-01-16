import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { ModelMarketingService } from '../../../../services/model.marketing.service';
import { ModelService } from '../../../../services/model.service';
import { IDocument } from '../../../../viewmodels/document';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ITabNav } from '../../shared/model.tabnav.component';
import { IModelList, IModelMarketingDocument } from '../../../../models/model';
import * as Util from '../../../../core/functions';


@Component({
    selector: 'community-model-marketing-downloads',
    templateUrl: './app/components/model/marketing/downloads/downloads.component.html'
})
export class ModelMarketingDownloadComponent extends BaseComponent {

    private downloads: IModelMarketingDocument[] = [];
    private showDocumentUploadError: boolean = false;
    private submitDownload: boolean = false;
    private displayDeleteConfirm: boolean = false;
    private selectedDocumentId: number;
    private documentUploadError: string;
    private selectedDocumentFile: any;
    private modelId: number;

    private document: IDocument = <IDocument>{};
    private model: IModelList = <IModelList>{};
    private tabsModel: ITabNav;

    constructor(private _modelMarketingService: ModelMarketingService,
        private _modelService: ModelService,
        private activateRoute: ActivatedRoute, private _router: Router) {
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'E';


    }

    ngOnInit() {
        this.activateRoute.params.subscribe(params => {
            this.modelId = +params['id'];
            this.reset();
        });
    }

    reset() {

        this.submitDownload = false;
        this.showDocumentUploadError = false;
        this.document = <IDocument>{};
        this.selectedDocumentFile = undefined;

        if (this.modelId > 0) {
            this.getModelMarketingDownloads(this.modelId);
            this.getModelDetail(this.modelId);
        } else {
            this.downloads = [];
        }
    }

    private onModelChange(modelId) {
        this._router.navigate(['/community/model/marketing/downloads', modelId]);
    }

    dragDocument(event) {
        event.preventDefault();
        event.stopPropagation();

    }

    dropDocument(event) {
        if (event.dataTransfer.files.length != 1) {
            this.documentUploadError = 'Only one file can be uploaded at a time.'
            this.showDocumentUploadError = true;
        } else {
            this.selectDocumentFile(event.dataTransfer.files);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    selectFileFromInput(event) {
        this.selectDocumentFile(event.target.files);
    }

    selectDocumentFile(files) {

        this.showDocumentUploadError = false;
        var documentFile = files[0];

        if (this.isValidPdfDocument(documentFile.type)) {
            this.selectedDocumentFile = documentFile;
            this.document.name = documentFile.name;
        } else {
            this.documentUploadError = 'Only pdf documents can be uploaded.'
            this.showDocumentUploadError = true;
        }

    }

    addDocumentFile(form) {
        this.submitDownload = true;
        this.showDocumentUploadError = false;

        if (this.selectedDocumentFile != undefined) {
            if (form.valid) {
                this.document.document = this.selectedDocumentFile;
                // this.responseToObject<IModelMarketingDocument>(this._modelMarketingService.uploadMarketingDocument(this.modelId, this.document))
                return this._modelMarketingService.uploadMarketingDocument(this.modelId, this.document)
                    .subscribe(data => {
                        this.reset();
                        form.reset();
                        this.getModelMarketingDownloads(this.modelId);

                    }, error => {
                        this.documentUploadError = JSON.parse(error).message;
                        this.showDocumentUploadError = true;
                    });
            }
        } else {
            this.documentUploadError = 'Please select a document.'
            this.showDocumentUploadError = true;
        }
    }



    private getModelMarketingDownloads(modelId) {
        this.ResponseToObjects<IModelMarketingDocument>(this._modelMarketingService.getMarketingDocuments(modelId))
            .subscribe(downloads => {
                this.downloads = downloads;
            });

    }

    private getModelDetail(modelId) {
        this.responseToObject<IModelList>(this._modelService.getModelView(modelId))
            .subscribe(model => {
                this.model = model;

            });

    }

    private displayDeleteDocumentConfirm(documentId) {
        this.selectedDocumentId = documentId;
        this.displayDeleteConfirm = true;
    }

    private deleteDocument() {
        this.displayDeleteConfirm = false;
        this.responseToObject<IModelMarketingDocument>(this._modelMarketingService.deleteMarketingDocument(this.modelId, this.selectedDocumentId))
            .subscribe(data => {
                this.downloads = this.downloads.filter(doc => doc.id != this.selectedDocumentId);
            });
    }

    // private cancel(form: FormGroup) {
    //     form.reset();
    //     var self = this
    //     setTimeout(function () {
    //         self.reset();
    //     }, 500);
    // }
}