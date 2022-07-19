import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Form } from '@app/core/models/form.model';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '@app/core/services/form.service';
import { UtilService } from '@app/core/utils/util.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FormType } from '@app/core/models/form-type.model';
import * as _ from 'lodash';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-params-forms-group',
    templateUrl: './formsGroup.component.html',
})
export class FormsGroupComponent implements OnInit {
    rowSizes: any = RowSizes;
    forms: Form[];
    currentForm: any = null;
    errorMessage: string;

    tableConfig: TableConfig = {
        title: this.translateService.instant('FORMS_GROUP.TITLE'),
        titleTooltip: this.translateService.instant('FORMS_GROUP.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'formsGroup',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['name', 'description', 'formNames'],
        actions: [{
            type: 'edit',
            callback: 'showFormsGroupElementDialogue',
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
            { field: 'name', header: this.translateService.instant('FORMS_GROUP.NAME'), width: '20%', sortable: true, filterable: true, type: 'text' },
            { field: 'description', header: this.translateService.instant('FORMS_GROUP.DESCRIPTION'), width: '30%', sortable: true, filterable: true, type: 'text' },
            { field: 'formNames', header: this.translateService.instant('FORMS_GROUP.FORMS'), width: '50%', sortable: true, filterable: true, type: 'text' },
        ];
    }

    loadListForms() {
        this.formService.getFormsByType(FormType.LIST_FORM).subscribe(
            (forms: Form[]) => (this.forms = _.forEach(forms, this.getFormsNames)),
            (err) => this.alertService.error('MESSAGES.FORM_GROUPS.LOAD_FORMS_ERROR'),
        );
    }

    getFormsNames(form: any) {
        form.formNames = '';
        if (form.childFormsArr && form.childFormsArr.length > 0) {
            for (const [i, f] of form.childFormsArr.entries()) {
                if (i !== 0) {
                    form.formNames += ', ';
                }
                form.formNames += f.name;
            }
        }
        return form;
    }

    showFormsGroupElementDialogue(form: Form = new Form({})): void {
        this.currentForm = form;
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentForm) {
            const { FormsGroupElementComponent } = await import('./formsGroupElement.component');
            setTimeout(() => {
                this.lazyCurrentFromVcRef.clear();

                const elementDialog = this.lazyCurrentFromVcRef.createComponent(
                    this.cfr.resolveComponentFactory(FormsGroupElementComponent),
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
        this.alertService.success('MESSAGES.FORMS_GROUPS.SAVE_FORM_SUCCESS');
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
