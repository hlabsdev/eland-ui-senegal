import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UserService } from '@app/core/services/user.service';
import { LocaleDatePipe } from '@app/core/utils/localeDate.pipe';
import { SpecificTimezone } from '@app/core/utils/specificTimezone.pipe';
import { RowSizes } from '@app/core/models/rowSize.model';
import { User } from '@app/core/models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { findIndex, get, isNull, orderBy } from 'lodash';
import { of } from 'rxjs';
import { Variables } from '@app/core/models/variables.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { RRR } from '../rrr/rrr.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
@Component({
    selector: 'app-rrrs-picker',
    templateUrl: 'rrrsPicker.component.html',
    providers: [LocaleDatePipe, SpecificTimezone],
})
export class RRRsPickerComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ baUnit: BAUnit; variable: Variables }>();
    @Output() canceled = new EventEmitter<BAUnit>();

    regRRRs: RRR[];
    rrrs: RRR[];
    rrr: RRR;
    baUnit: BAUnit;
    totalRecords: number;
    rowSizes: any = RowSizes;
    searchText = '';
    radiate = true;
    persistToDb = true;
    user: User;

    @ViewChild('lazyRrr', { read: ViewContainerRef })
    private lazyRrrVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRRS_PICKER.TITLE'),
        titleTooltip: this.translateService.instant('RRRS_PICKER.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'rrrsPicker',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: false,
        searchBarField: ['rightTypeDescription', 'spatialUnitType', 'idParties', 'nameParties', 'rolParties', 'inscriptionDate', 'inscriptionSlip', 'modDate'],
        actions: [{
            type: 'edit',
            callback: 'showRRRDialogue',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private baUnitService: BAUnitService,
        private translateService: TranslateService,
        private datePipe: LocaleDatePipe,
        private specificTimezone: SpecificTimezone,
        private userService: UserService,
        protected alertService: AlertService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        super();
        this.user = this.userService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadRRRs();
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
                rrr.instance.readOnly = this.formVariables.isReadOnly || false;
                rrr.instance.rrrsUrl = false;
                rrr.instance.baUnit = this.baUnit;
                rrr.instance.formVariables = this.formVariables;
                rrr.instance.radiate = this.radiate;
                rrr.instance.canceled.subscribe(() => {
                    this.cancelRRR();
                });
                rrr.instance.saved.subscribe(($event: any) => {
                    this.saveRRR($event);
                });
            }, 100);
        }
    }

    saveRRR(rrr: RRR): void {
        rrr.modDate = new Date();
        rrr.modUser = this.user.username;

        // If we do not have a radiation date do not save the bordereau de liberation
        if (isNull(rrr.radiationDate)) {
            rrr.radiationTransactionId = null;
        }

        if (this.baUnit) {
            const index = findIndex(this.baUnit.rrrs, this.rrr);
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

    saveToContext(): void {
        this.baUnitService
            .updateBAUnit({
                baUnit: this.baUnit,
                baUnitFormFieldsRequired: this.formVariables.baUnitFormFieldsRequired,
            })
            .subscribe(
                (u) => {
                    this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                    this.baUnit = u;
                    this.saved.emit({
                        baUnit: this.baUnit,
                        variable: {
                            baUnit: { value: JSON.stringify(u), type: 'Json' },
                        },
                    });
                },
                (err) => this.alertService.apiError(err),
            );
    }

    cancelRRR(): void {
        this.rrr = null;
    }

    loadRRRs(): void {
        const baunitId = get(this.formVariables, 'baUnitId', null);
        const baUnitObs$ = baunitId ? this.baUnitService.getBAUnitById(baunitId) : of(this.formVariables.baUnit);
        baUnitObs$.subscribe(
            (baU) => {
                this.baUnit = baU;
                this.totalRecords = this.baUnit.rrrs.length;
                this.regRRRs = this.baUnit.rrrs
                    .filter((r) => isNull(r.radiationDate))
                    .filter((r) => r.type.value !== 'RIGHT_TYPE_OWNERSHIP')
                    .filter((r) => r.type.value !== 'RIGHT_TYPE_LEASE_CONCESSION');

                this.rrrs = [];

                for (const rrr of this.regRRRs) {
                    rrr['rightTypeDescription'] = this.translateService.instant(
                        'CODELIST.VALUES.' + rrr['type']['value'],
                    );
                    rrr['spatialUnitNumber'] =
                        rrr.getSpatialUnitType() !== 'undefined' ? rrr.spatialUnit.spatialUnitNumber : '';
                    rrr['inscriptionSlip'] = rrr['inscriptionTransactionId'];
                    rrr['inscriptionDate'] = this.datePipe.transform(
                        this.specificTimezone.transform(rrr.inscriptionDate),
                        'shortDate',
                    );
                    rrr['modDate'] = this.datePipe.transform(this.specificTimezone.transform(rrr.modDate), 'shortDate');

                    rrr['idParties'] = [];
                    rrr['nameParties'] = [];
                    rrr['rolParties'] = [];
                    for (const party of rrr.parties) {
                        const partyName = party.getName();
                        if (partyName) {
                            rrr['nameParties'].push(party.getName());
                            rrr['idParties'].push(party.extPID);
                            rrr['rolParties'].push(
                                this.translateService.instant('CODELIST.VALUES.' + party.partyRoleType.value),
                            );
                        }
                    }
                    this.rrrs.push(rrr);
                }

                this.rrrs = orderBy(this.rrrs, ['rightTypeDescription', 'inscriptionSlip'], ['asc', 'asc']);

                this.cols = [{
                        field: 'rightTypeDescription',
                        header: this.translateService.instant('RRR.RRR_TYPE'),
                        width: '12.5%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'spatialUnitType',
                        header: this.translateService.instant('RRR.SPATIAL_UNITS'),
                        width: '10%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'idParties',
                        header: this.translateService.instant('RRR.PARTY_ID'),
                        width: '10%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'nameParties',
                        header: this.translateService.instant('RRR.PARTY_NAME'),
                        width: '12%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'rolParties',
                        header: this.translateService.instant('RRR.PARTY_ROLE'),
                        width: '15%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'inscriptionDate',
                        header: this.translateService.instant('RRR.INSCRIPTION_DATE'),
                        width: '10%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'inscriptionSlip',
                        header: this.translateService.instant('RRR.INSCRIPTION_NUMBER'),
                        width: '12.5%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'modDate',
                        header: this.translateService.instant('RRR.MODIFICATION_DATE'),
                        width: '10%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                ];
            },
            (err) => this.alertService.apiError(err),
        );
    }

    reload(){
        this.loadRRRs();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
