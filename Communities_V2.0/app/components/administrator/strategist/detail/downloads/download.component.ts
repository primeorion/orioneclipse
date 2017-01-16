import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { StrategistService } from '../../../../../services/strategist.service';
import { IStrategistDownload } from '../../../../../models/strategist';
import { IDocument } from '../../../../../viewmodels/document';
import { FormGroup } from '@angular/forms';


@Component({
    selector: 'community-strategist-downloads',
    templateUrl: './app/components/administrator/strategist/detail/downloads/download.component.html'
})
export class StrategistDownloadComponent extends BaseComponent {

    private downloads: IStrategistDownload[] = [];
    private showDocumentUploadError: boolean = false;
    private documentUploadError: string;
    private selectedDocumentFile: any;
    private document: IDocument = <IDocument>{};
    private submitDownload: boolean = false;

    private displayDeleteConfirm: boolean = false;
    private selectedDocumentId: number;


    @Input() strategistId: number;
    @Input() isViewMode: boolean;

    @Output() navigateToOtherView = new EventEmitter();

    constructor(private _strategistService: StrategistService) {
        super();


    }

    ngOnInit() {
        this.document = <IDocument>{};
        this.reset();
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
                return this._strategistService.uploadStrategistDocument(this.strategistId, this.document)
                    .subscribe(data => {
                        this.reset();
                        form.reset();
                        this.getStrategistDownload(this.strategistId);
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

    reset() {
        this.submitDownload = false;
        this.showDocumentUploadError = false;
        this.document = <IDocument>{};
        this.selectedDocumentFile = undefined;

        if (this.strategistId != undefined) {
            this.getStrategistDownload(this.strategistId);
        } else {
            this.downloads = [];
        }
    }

    private getStrategistDownload(strategistId) {
        this.ResponseToObjects<IStrategistDownload>(this._strategistService.getStrategistDownload(strategistId))
            .subscribe(model => {
                this.downloads = model;
            });

    }

    private displayDeleteDocumentConfirm(documentId) {
        this.selectedDocumentId = documentId;
        this.displayDeleteConfirm = true;
    }

    private deleteDocument() {
        this.displayDeleteConfirm = false;
        this.responseToObject<IStrategistDownload>(this._strategistService.deleteStrategistDocument(this.strategistId, this.selectedDocumentId))
            .subscribe(data => {
                this.downloads = this.downloads.filter(doc => doc.id != this.selectedDocumentId);
            });
    }

}