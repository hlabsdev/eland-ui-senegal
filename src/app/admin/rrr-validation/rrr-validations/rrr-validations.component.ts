import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Variables } from '@app/core/models/variables.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { RRRTypes } from '@app/workstation/rrr/rrrType/rrrType.model';
import { RRRValidation } from './../model/rrr-validation.model';
import { RRRValidationService } from '../service/rrr-validation.service';
import { RRRValidationTransaction } from '../model/rrr-validation-transaction.model';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { DialogConfig } from '@app/core/models/dialogConfig';

@Component({
    selector: 'app-rrr-validations',
    templateUrl: 'rrr-validations.component.html',
    styleUrls: ['./rrr-validations.component.scss'],
})
export class RRRValidationsComponent extends FormTemplateBaseComponent implements OnInit, OnChanges {
    @Output() add = new EventEmitter<RRRValidation>();
    @Output() saved = new EventEmitter<{ val: BAUnit; variable: Variables }>();

    @Output() selectedRRRValidation = new EventEmitter<{
        rrrValidation: RRRValidation;
        checked: boolean;
        requiredRRR: boolean;
    }>();

    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() options;
    @Input() selectedOptions: RRRValidationTransaction[];
    @Input() isPopup: boolean;

    _options = {
        add: true,
        delete: true,
    };

    rrrValidationsUrl: boolean;
    rrrValidations: RRRValidation[];
    rrrValidation: RRRValidation;
    search: string;
    rowSizes: any = RowSizes;
    baUnit: BAUnit = null;
    persistToDb: boolean;

    // preloader message
    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR_VALIDATION.TITLE_LIST'),
        titleTooltip: this.translateService.instant('RRR_VALIDATION.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'rrr-validations',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: false,
        searchBarField: ['label', 'rrrType', 'subType', 'type'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];
    dialogConfig: DialogConfig;

    @ViewChild('lazyRrrValidation', { read: ViewContainerRef })
    private lazyRrrValidationVcRef: ViewContainerRef;

    constructor(
        private rrrValidationService: RRRValidationService,
        public utilService: UtilService,
        protected router: Router,
        public translateService: TranslateService,
        private alertService: AlertService,
        private ngxLoader: NgxUiLoaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        super();
    }

    ngOnInit(): void {
        this.rrrValidationsUrl = this.router.url === '/administration/rrr-validations';
        this.tableConfig.customData = {"rrrValidationsUrl" : this.rrrValidationsUrl};
        if (this.formVariables.baUnit) {
            this.baUnit = new BAUnit(this.formVariables.baUnit);
        } else {
            this.persistToDb = true;
        }
        if (!this.rrrValidationsUrl) {
            this.cols = [
                { field: 'select', header: this.translateService.instant('COMMON.ACTIONS.SELECT'), sortable: false, filterable: false, type: 'text' },
                { field: 'require', header: this.translateService.instant('RRR_VALIDATION.RRR_REQUIRED'), sortable: false, filterable: false, type: 'text' },
                { field: 'label', header: this.translateService.instant('RRR_VALIDATION.LABEL'), sortable: true, filterable: true, type: 'text' },
                { field: 'rrrType', header: this.translateService.instant('RRR_VALIDATION.RRR_TYPE'), sortable: true, filterable: true, type: 'text' },                
            ];
        } else {
            this.tableConfig.addBtn = true;
            this.cols = [
                { field: 'label', header: this.translateService.instant('RRR_VALIDATION.LABEL'), sortable: true, filterable: true, type: 'text' },
                { field: 'rrrType', header: this.translateService.instant('RRR_VALIDATION.RRR_TYPE'), sortable: true, filterable: true, type: 'text' },
            ];
        }
        if(!this.isPopup)
        {
            this.cols.push({ field: 'subType', header: this.translateService.instant('RRR_VALIDATION.TYPE'), sortable: true, filterable: true, type: 'text' },);
            this.cols.push({ field: 'type', header: this.translateService.instant('RRR_VALIDATION.CLASSIFICATION'), sortable: true, filterable: true, type: 'text' },)
        }

        this.loadRRRValidations();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.options) {
            const keys = Object.keys(this.options);
            for (const key of keys) {
                this._options[key] = this.options[key] || (this.options[key] === false ? false : this._options[key]);
            }
        }
    }

    loadRRRValidations(search = '') {
        const args = {
            search,
        };

        this.rrrValidationService.getRRRValidations(args).subscribe((results) => {
            // preloading init
            this.ngxLoader.start();

            this.rrrValidations = results;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();

            this.rrrValidations.forEach((rrrValidation) => {
                if (rrrValidation.rrrType === RRRTypes.RIGHT) {
                    rrrValidation['subType'] = this.translateService.instant(
                        `RRR.RIGHT_TYPES.${rrrValidation.rightType}`,
                    );
                } else if (rrrValidation.rrrType === RRRTypes.RESTRICTION) {
                    rrrValidation['subType'] = this.translateService.instant(
                        `RRR.RESTRICTION_TYPES.${rrrValidation.restrictionType}`,
                    );
                } else {
                    rrrValidation['subType'] = this.translateService.instant(
                        `RRR.RESPONSIBILITY_TYPES.${rrrValidation.responsibilityType}`,
                    );
                }
                rrrValidation['haveAssociatedTransactions'] = rrrValidation.rrrValidationTransactions.length > 0;
                rrrValidation['checked'] =
                    this.selectedOptions &&
                    this.selectedOptions.find((item) => item.rrrValidation.id === rrrValidation.id)
                        ? true
                        : false;
                rrrValidation['requiredRRR'] =
                    this.selectedOptions &&
                    this.selectedOptions.find((item) => item.rrrValidation.id === rrrValidation.id && item.requiredRRR)
                        ? true
                        : false;
            });
        });
    }

    getPreloaderMessage() {
        if (this.rrrValidations.length === 0) {
            return '...';
        } else if (this.rrrValidations.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.rrrValidations.length +
                ' ' +
                this.translateService.instant('PRELOADER.RRR_VALIDATION') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.rrrValidations.length +
                ' ' +
                this.translateService.instant('PRELOADER.RRR_VALIDATIONS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    async showRRRValidationDialogue(rrrValidation = null) {
        this.rrrValidation = rrrValidation ? rrrValidation : new RRRValidation();
        this.lazyRrrValidationVcRef.clear();
        const { RRRValidationComponent } = await import('../rrr-validation.component');
        const RrrValidation = this.lazyRrrValidationVcRef.createComponent(
            this.cfr.resolveComponentFactory(RRRValidationComponent),
        );

        RrrValidation.instance.rrrValidation = this.rrrValidation;
        RrrValidation.instance.persistToDB = this.persistToDb;
        RrrValidation.instance.readOnly = !this.rrrValidationsUrl;
        RrrValidation.instance.baUnit = this.baUnit;
        RrrValidation.instance.formVariables = this.formVariables;
        RrrValidation.instance.rrrValidationsUrl = this.rrrValidationsUrl;
        this.dialogConfig = {
            showAction: this.rrrValidationsUrl,
            display: true,
            title: this.translateService.instant('RRR_VALIDATION.TITLE_ADD'),
            canSave: true,
            tabs: [
                { name: this.translateService.instant('PARAMETERS.GENERAL'), required: true },
                { name: this.translateService.instant('RRR_VALIDATION.PARTY_ROLE.TITLE'), required: true, disabled: false }
            ]
        };
        RrrValidation.instance.dialogConfig= this.dialogConfig;
        
        RrrValidation.instance.canceled.subscribe(() => {
            this.cancelRRRValidation();
        });
        RrrValidation.instance.saved.subscribe((data) => {
            this.saveRRRValidation(data);
        });
    }

    saveRRRValidation(rrrValidation) {
        if (rrrValidation.id) {
            // update

            this.rrrValidationService.updateRRRValidation(rrrValidation).subscribe(
                (response: RRRValidation) => {
                    this.cancelRRRValidation();
                    this.loadRRRValidations();
                },
                (err) => this.alertService.error('RRR_VALIDATION.MESSAGES.UPDATE_ERROR'),
            );
        } else {
            // create

            this.rrrValidationService.createRRRValidation(rrrValidation).subscribe(
                (response: RRRValidation) => {
                    this.cancelRRRValidation();
                    this.loadRRRValidations();
                },
                (err) => this.alertService.error('RRR_VALIDATION.MESSAGES.CREATE_ERROR'),
            );
        }
    }

    removeRRRValidation(rrrValidation) {
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE', () => {
            this.rrrValidationService.deleteRRRValidation(rrrValidation).subscribe(() => {
                this.loadRRRValidations();
            });
        });
    }

    cancelRRRValidation() {
        this.rrrValidation = null;
    }

    selectRRRValidation(rrrValidation) {
        rrrValidation.requiredRRR = rrrValidation.checked && rrrValidation.requiredRRR;

        this.selectedRRRValidation.emit({
            rrrValidation,
            checked: rrrValidation.checked,
            requiredRRR: rrrValidation.requiredRRR,
        });
    }

    reload(){
        this.loadRRRValidations();
    }
}
