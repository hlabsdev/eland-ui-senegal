import { TranslateService } from '@ngx-translate/core';
import { FormService } from '@app/core/services/form.service';
import { UtilService } from '@app/core/utils/util.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Form } from '@app/core/models/form.model';
import { FormType } from '@app/core/models/form-type.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-params-forms',
    templateUrl: './forms.component.html',
})
export class FormsComponent implements OnInit {
    rowSizes: any = RowSizes;
    forms: Form[];
    currentForm: any = null;
    errorMessage: string;

    tableConfig: TableConfig = {
        title: this.translateService.instant('FORMS.TITLE'),
        titleTooltip: this.translateService.instant('FORMS.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'forms',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['name', 'description'],
        actions: [{
            type: 'edit',
            callback: 'showFormsElementDialogue',
        },{
            type: 'delete',
            callback: 'removeForm',
        }]
    }

    cols: TableCols[] = [];

    @ViewChild('lazyCurrentFrom', { read: ViewContainerRef })
    private lazyCurrentFromVcRef: ViewContainerRef;

    constructor(
        private translateService: TranslateService,
        private formService: FormService,
        private utilService: UtilService,
        private alertService: AlertService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit(): void {
        this.loadListForms();
        this.cols = [
            { field: 'name', header: this.translateService.instant('FORMS_GROUP.NAME'), sortable: true, filterable: true, type: 'text', width: '40%' },
            { field: 'description', header: this.translateService.instant('FORMS_GROUP.DESCRIPTION'), sortable: true, filterable: true, type: 'text', width: '60%' }
        ];
    }

    loadListForms() {
        this.formService.getFormsByType(FormType.FORM).subscribe(
            (forms: Form[]) => (this.forms = forms),
            (err) => this.alertService.error('MESSAGES.FORMS.LOAD_FORMS_ERROR'),
        );
    }

    showFormsElementDialogue(form: Form = new Form({})): void {
        this.currentForm = form;
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentForm) {
            const { FormsElementComponent } = await import('./formsElement.component');
            setTimeout(() => {
                this.lazyCurrentFromVcRef.clear();

                const elementDialog = this.lazyCurrentFromVcRef.createComponent(
                    this.cfr.resolveComponentFactory(FormsElementComponent),
                );
                elementDialog.instance.form = this.currentForm;
                elementDialog.instance.saved.subscribe(() => {
                    this.saved();
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    saved() {
        this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
        this.loadListForms();
        this.currentForm = null;
    }

    canceled() {
        this.loadListForms();
        this.currentForm = null;
    }

    removeForm(form) {
        this.utilService.displayConfirmationDialogWithMessageParameters(
            'MESSAGES.FORMS_GROUPS.CONFIRM_DELETE_FORM',
            { formName: form.name },
            () => {
                this.formService.deleteForm(form).subscribe(
                    (result) => {
                        this.loadListForms();
                        this.alertService.success('MESSAGES.FORMS_GROUPS.DELETE_FORM_SUCCESS');
                    },
                    (err) => this.alertService.error('MESSAGES.FORMS_GROUPS.DELETE_FORM_ERROR'),
                );
            },
            () => {},
        );
    }

    reload(){
        this.loadListForms();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
