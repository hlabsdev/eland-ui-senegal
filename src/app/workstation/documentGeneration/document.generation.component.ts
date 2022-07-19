import { AlertService } from '@app/core/layout/alert/alert.service';
import { ContentService } from '@app/core/services/content.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidationService } from '@app/core/utils/validation.service';
import { UtilService } from '@app/core/utils/util.service';
import { Variables } from '@app/core/models/variables.model';
import { GenericDocument } from '@app/core/models/genericDocument.model';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { NgForm } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
    selector: 'app-document-generation-context',
    templateUrl: 'document.generation.component.html',
})
export class DocumentGenerationComponent extends FormTemplateBaseComponent implements OnInit {
    @ViewChild('form', { read: NgForm }) form: any;
    @Input() formVariables = new FormVariables();
    @Output() saved = new EventEmitter<{ val: any; variable: Variables }>();
    @Output() canceled = new EventEmitter<true>();

    document: GenericDocument;

    editorConfig: AngularEditorConfig = {
        editable: false,
        spellcheck: false,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: false,
        showToolbar: false,
        sanitize: false,
    };

    constructor(
        protected route: ActivatedRoute,
        protected contentService: ContentService,
        protected alertService: AlertService,
        protected utilServices: UtilService,
        protected translateService: TranslateService,
        protected validationService: ValidationService,
    ) {
        super();
    }

    ngOnInit() {
        if (
            !this.formVariables.baUnitId &&
            !this.formVariables.hasPath('baUnit.uid') &&
            !this.formVariables.applicantId
        ) {
            return this.alertService.warning('MESSAGES.BA_UNIT_AND_APPLICANT_REQUIRED_FOR_SUMMARY');
        }

        if (this.formVariables.document) {
            this.document = this.formVariables.document;
            return;
        }

        this.generateDocument();
    }

    regenerate() {
        this.utilServices.displayConfirmationDialog('MESSAGES.REGENERATE_DOCUMENT', () => {
            this.generateDocument();
        });
    }

    generateDocument() {
        const baUnitId = this.formVariables.getPath('baUnit.uid')
            ? this.formVariables.getPath('baUnit.uid')
            : this.formVariables.baUnitId;
        const args = {
            documentType: this.formVariables.documentType,
            documentTemplate: this.formVariables.documentTemplate,
            baUnitId,
            generateDocumentId: this.formVariables.generateDocumentId,
            signatoryAuthority: this.formVariables.signatoryAuthority,
            setPlacard: this.formVariables.setPlacard,
            applicationId: this.formVariables.applicationId,
            slipType: this.formVariables.slipType ? this.formVariables.slipType : '',
        };

        this.contentService.getTemplate(args).subscribe(
            (doc) => {
                if (doc && doc.body) {
                    this.document = doc;
                    return;
                }

                this.document = new GenericDocument();
                return this.alertService.warning('MESSAGES.DOCUMENT_NOT_GENERATED');
            },
            (err) => this.alertService.apiError(err),
        );
    }

    cancel(): void {
        this.canceled.emit(true);
    }
}
