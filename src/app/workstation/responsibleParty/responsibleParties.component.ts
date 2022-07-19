import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import * as _ from 'lodash';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { ResponsibleParty } from '@app/core/models/responsibleParty.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    templateUrl: './responsibleParties.component.html',
    selector: 'app-responsible-parties',
})
export class ResponsiblePartiesComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() responsibleParties: ResponsibleParty[] = [];
    @Output() saved = new EventEmitter<ResponsibleParty[]>();

    rowSizes: any = RowSizes;
    responsibleParty: ResponsibleParty = null;
    baUnit: BAUnit = null;

    @ViewChild('lazyResponsibleParty', { read: ViewContainerRef })
    private lazyResponsiblePartyVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RESPONSIBLE_PARTY.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'responsibleParties',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: false,
        enableReload: false,
        searchBarField: ['individualName', 'organizationName', 'role'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        protected router: Router,
        protected alertService: AlertService,
        public translateService: TranslateService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private utilService: UtilService,
    ) {
        super();
    }

    ngOnInit(): void {
        if (this.formVariables.baUnit) {
            this.baUnit = new BAUnit(this.formVariables.baUnit);
        }
        this.tableConfig.addBtn = this.formVariables.isReadOnly ? false : true;
        this.tableConfig.customData = { 'formVariables': this.formVariables };
        this.loadResponsibleParties();
    }

    loadResponsibleParties() {
        this.cols = [
            { field: 'individualName', header: this.translateService.instant('RESPONSIBLE_PARTY.INDIVIDUAL_NAME'), sortable: true, filterable: true, type: 'text' },
            { field: 'organizationName', header: this.translateService.instant('RESPONSIBLE_PARTY.ORGANIZATION_NAME'), sortable: true, filterable: true, type: 'text' },
            { field: 'role', header: this.translateService.instant('RESPONSIBLE_PARTY.ROLE'), sortable: true, filterable: true, type: 'text' },
        ];
    }

    showResponsiblePartyDialogue(responsibleParty = null): void {
        this.responsibleParty = responsibleParty ? responsibleParty : new ResponsibleParty();
        this.lazyLoadResponsibleParty();
    }

    async lazyLoadResponsibleParty() {
        const { ResponsiblePartyComponent } = await import('./responsibleParty.component');
        if (this.responsibleParty) {
            setTimeout(() => {
                this.lazyResponsiblePartyVcRef.clear();
                const responsibleParty = this.lazyResponsiblePartyVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ResponsiblePartyComponent),
                );
                responsibleParty.instance.responsibleParty = this.responsibleParty;
                responsibleParty.instance.readOnly = this.formVariables.isReadOnly;
                responsibleParty.instance.canceled.subscribe(() => {
                    this.cancelResponsibleParty();
                });
                responsibleParty.instance.saved.subscribe(($event: any) => {
                    this.saveResponsibleParty($event);
                });
            }, 100);
        }
    }

    saveResponsibleParty(responsibleParty: ResponsibleParty) {
        const index = _.findIndex(this.responsibleParties, this.responsibleParty);
        if (index > -1) {
            this.responsibleParties[index] = responsibleParty;
        } else {
            this.responsibleParties.push(responsibleParty);
        }
        this.cancelResponsibleParty();
        this.loadResponsibleParties();
    }

    removeResponsibleParty(responsibleParty: ResponsibleParty) {
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE_SAVE_REQUIRED', () => {
            this.removeResponsiblePartyAction(responsibleParty);
        });
    }

    removeResponsiblePartyAction(responsibleParty: ResponsibleParty) {
        const index = _.findIndex(this.responsibleParties, responsibleParty);
        if (index > -1) {
            this.responsibleParties.splice(index, 1);
        }
    }
    save() {}

    cancelResponsibleParty() {
        this.responsibleParty = null;
    }
}
