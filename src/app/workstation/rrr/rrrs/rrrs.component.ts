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
import { RowSizes } from '@app/core/models/rowSize.model';
import { Variables } from '@app/core/models/variables.model';
import { PartyService } from '@app/core/services/party.service';
import { LocaleDatePipe } from '@app/core/utils/localeDate.pipe';
import { SpecificTimezone } from '@app/core/utils/specificTimezone.pipe';
import { UtilService } from '@app/core/utils/util.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { RRR } from '../rrr/rrr.model';
import { RRRService } from '../rrr/rrr.service';
import { isNull } from 'lodash';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-rrrs',
    templateUrl: './rrrs.component.html',
    providers: [LocaleDatePipe, SpecificTimezone],
})
export class RRRsComponent extends FormTemplateBaseComponent implements OnInit, OnChanges {
    @Output() add = new EventEmitter<RRR>();
    @Output() saved = new EventEmitter<{ val: BAUnit; variable: Variables }>();
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() options: any;
    @Input() isAdmin = false;
    @Input() isPopup: boolean;
    _options = {
        add: true,
        delete: true,
    };

    rrrsUrl: boolean;
    sameEndPointRoute: boolean;
    rrrs: RRR[];
    rrr: RRR;
    search: string;
    rowSizes: any = RowSizes;
    baUnit: BAUnit = null;
    persistToDb: boolean;
    hideDeleteButton: boolean;

    @ViewChild('lazyRrr', { read: ViewContainerRef })
    private lazyRrrVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR.TITLE_LIST'),
        titleTooltip: this.translateService.instant('RRR.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'rrrs',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: false,
        searchBarField: ['rightTypeDescription', 'spatialUnitNumber', 'idParties', 'nameParties', 'rolParties', 'radiationDate', 'radiationSlip', 'inscriptionDate', 'inscriptionSlip', 'modDate'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private rrrservice: RRRService,
        public utilService: UtilService,
        protected partyService: PartyService,
        protected router: Router,
        public translateService: TranslateService,
        private alertService: AlertService,
        private datePipe: LocaleDatePipe,
        private specificTimezone: SpecificTimezone,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private ngxLoader: NgxUiLoaderService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.rrrsUrl = this.router.url === '/rrrs' || this.router.url.includes('ba-unit');
        if(!this.rrrsUrl){
            this.tableConfig.enableExport = false;
        }
        this.sameEndPointRoute = this.router.url.includes('/rrrs');
        if (this.formVariables.baUnit) {
            this.baUnit = new BAUnit(this.formVariables.baUnit);
        } else {
            this.persistToDb = true;
        }

        this.cols = [
            {
                field: 'rightTypeDescription',
                header: this.translateService.instant('RRR.RRR_TYPE'),
                width: '8%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {
                field: 'spatialUnitNumber',
                header: this.translateService.instant('RRR.SPATIAL_UNITS'),
                width: '8%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {   
                field: 'idParties', 
                header: this.translateService.instant('RRR.PARTY_ID'), 
                width: '9%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {   
                field: 'nameParties', 
                header: this.translateService.instant('RRR.PARTY_NAME'), 
                width: '10%', 
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            { 
                field: 'rolParties', 
                header: this.translateService.instant('RRR.PARTY_ROLE'), 
                width: '10%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            /* {
                field: 'radiationDate',
                header: this.translateService.instant('RRR.RADIATION_DATE'),
                width: '10%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {
                field: 'radiationSlip',
                header: this.translateService.instant('RRR.RADIATION_NUMBER'),
                width: '8%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {
                field: 'inscriptionDate',
                header: this.translateService.instant('RRR.INSCRIPTION_DATE'),
                width: '10%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            {
                field: 'inscriptionSlip',
                header: this.translateService.instant('RRR.INSCRIPTION_NUMBER'),
                width: '8%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            },
            { 
                field: 'modDate', 
                header: this.translateService.instant('RRR.MODIFICATION_DATE'), 
                width: '10%',
                sortable: false, 
                filterable: false, 
                type: 'text'
            }, */
        ];
        this.loadRRRs();
        this.hideDeleteButton = this.formVariables.isReadOnly || this.rrrsUrl || !this._options.delete;
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (this.options) {
            const keys = Object.keys(this.options);
            for (const key of keys) {
                this._options[key] = this.options[key] || (this.options[key] === false ? false : this._options[key]);
            }
        }
    }

    loadRRRs(search = '') {
        this.ngxLoader.start();
        const args = {
            search,
        };

        const rrrObs = this.sameEndPointRoute ? this.rrrservice.getRRRs(args) : of(this.baUnit.rrrs);
        rrrObs.subscribe(
            (result) => {
                const rrrs = result;
                this.rrrs = [];

                for (const rrr of rrrs) {
                    rrr['rightTypeDescription'] = this.translateService.instant(
                        'CODELIST.VALUES.' + rrr['type']['value'],
                    );
                    rrr['spatialUnitNumber'] =
                        rrr.getSpatialUnitType() !== 'undefined' ? rrr.spatialUnit.spatialUnitNumber : '';

                    rrr['idParties'] = [];
                    rrr['nameParties'] = [];
                    rrr['rolParties'] = [];
                    const parties =
                        isNull(rrr.radiationDate) &&
                        (rrr.type.value === 'RIGHT_TYPE_OWNERSHIP' || rrr.type.value === 'RIGHT_TYPE_LEASE_CONCESSION')
                            ? rrr.parties.filter((p) => isNull(p.radiationDate))
                            : rrr.parties;

                    for (const party of parties) {
                        const partyName = party.getName();
                        if (partyName) {
                            rrr['nameParties'].push(party.getName());
                            rrr['idParties'].push(party.extPID);
                            rrr['rolParties'].push(
                                this.translateService.instant('CODELIST.VALUES.' + party.partyRoleType.value),
                            );
                        }
                    }

                    rrr['inscriptionSlip'] = rrr['inscriptionTransactionId'];
                    rrr['inscriptionDate'] = this.datePipe.transform(
                        this.specificTimezone.transform(rrr.inscriptionDate),
                        'shortDate',
                    );
                    rrr['radiationSlip'] = rrr['radiationTransactionId'];
                    rrr['radiationDate'] = this.datePipe.transform(
                        this.specificTimezone.transform(rrr.radiationDate),
                        'shortDate',
                    );
                    rrr['modDate'] = this.datePipe.transform(this.specificTimezone.transform(rrr.modDate), 'shortDate');

                    this.rrrs.push(rrr);
                }

                this.rrrs = _.orderBy(this.rrrs, ['rightTypeDescription', 'inscriptionSlip'], ['asc', 'asc']);


                this.tableConfig.customData = { 
                    'formVariables': this.formVariables,
                    'rrrsUrl': this.rrrsUrl,
                    'baUnit': this.baUnit,
                    'hideDeleteButton': this.hideDeleteButton,
                    'rrrs': this.rrrs
                };
                
                if(this.formVariables.isReadOnly  || this.rrrsUrl || !this._options.add){
                    this.tableConfig.addBtn = false;
                } else {
                    this.tableConfig.addBtn = true;
                }
                this.ngxLoader.stop();
            },
            (err) => {
                this.alertService.apiError(err);
                this.ngxLoader.stop();
            },
        );
    }

    showRRRDialogue(rrr = null): void {
        this.rrr = rrr ? rrr : new RRR();
        this.lazyLoadRRR();
    }

    async lazyLoadRRR() {
        const { RRRComponent } = await import('../rrr/rrr.component');
        if (this.rrr) {
            setTimeout(() => {
                this.lazyRrrVcRef.clear();
                const rrr = this.lazyRrrVcRef.createComponent(this.cfr.resolveComponentFactory(RRRComponent));
                rrr.instance.rrr = this.rrr;
                rrr.instance.persistToDB = this.persistToDb;
                rrr.instance.readOnly = this.formVariables.isReadOnly || this.rrrsUrl;
                rrr.instance.rrrsUrl = this.rrrsUrl;
                rrr.instance.baUnit = this.baUnit;
                rrr.instance.formVariables = this.formVariables;
                rrr.instance.canceled.subscribe(() => {
                    this.cancelRRR();
                });
                rrr.instance.saved.subscribe(($event: any) => {
                    this.saveRRR($event);
                });
            }, 100);
        }
    }

    saveRRR(rrr) {
        if (this.baUnit) {
            const index = _.findIndex(this.baUnit.rrrs, this.rrr);
            if (index > -1) {
                this.baUnit.rrrs[index] = rrr;
            } else {
                this.baUnit.rrrs.push(rrr);
            }
            this.saveToContext();
        }
        this.cancelRRR();
        this.loadRRRs();
    }

    removeRRR(rrr) {
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE', () => {
            this.removeRRRAction(rrr);
        });
    }

    removeRRRAction(rrr: RRR) {
        const index = _.findIndex(this.baUnit.rrrs, rrr);
        if (index > -1) {
            this.baUnit.rrrs.splice(index, 1);
            this.saveToContext();
        }
    }

    saveToContext() {
        if (this.formVariables.baUnit) {
            this.saved.emit({
                val: this.baUnit,
                variable: {
                    baUnit: { value: JSON.stringify(this.baUnit).replace('"/g', '\\"'), type: 'Json' },
                },
            });
        }
    }

    cancelRRR() {
        this.rrr = null;
    }

    reload(){
        this.loadRRRs();
    }
}
