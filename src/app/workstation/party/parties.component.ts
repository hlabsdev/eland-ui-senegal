import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { PartyService } from '@app/core/services/party.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { Party } from '@app/core/models/party.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Variables } from '@app/core/models/variables.model';
import * as _ from 'lodash';
import { LazyLoadEvent } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    templateUrl: './parties.component.html',
    selector: 'app-parties',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartiesComponent extends FormTemplateBaseComponent implements OnInit, AfterViewInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ val: BAUnit; variable: Variables }>();
    @Output() partyPickerSave = new EventEmitter<any>();
    @Output() partyPickerDelete = new EventEmitter<any>();
    @Input() picker = false;
    @Input() rrrParties: Party[];
    @Input() filterByRRRType: any;
    @Input() isAdmin = false;
    partiesUrl: boolean;
    sameEndPointRoute: boolean;
    rowSizes: any = RowSizes;
    parties: Party[];
    baUnit: BAUnit = null;
    party: Party = null;
    persistToDb: boolean;
    totalRecords: number;
    hideRemovePartyButton: boolean;

    @ViewChild('lazyParty', { read: ViewContainerRef })
    private lazyPartyVcRef: ViewContainerRef;

    @ViewChild('lazyPartyPicker', { read: ViewContainerRef })
    private lazyPartyPickerVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('PARTY.TITLE_LIST'),
        titleTooltip: this.translateService.instant('PARTY.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'parties',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: false,
        searchBarField: ['pid', 'party', 'role', 'radiationDate', 'inscriptionDate', 'modDate'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        protected partyService: PartyService,
        protected router: Router,
        protected alertService: AlertService,
        public translateService: TranslateService,
        private utilService: UtilService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private ngxLoader: NgxUiLoaderService,
        private changeDetector: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit(): void {
        this.partiesUrl =
            this.router.url === '/parties' || this.router.url.includes('ba-unit') || this.router.url === '/rrrs';
        this.sameEndPointRoute = this.router.url.includes('/parties');
        if (this.formVariables.baUnit) {
            this.baUnit = new BAUnit(this.formVariables.baUnit);
        } else {
            this.persistToDb = true;
        }

        this.hideRemovePartyButton = this.formVariables.isReadOnly || this.partiesUrl;
        this.loadParties();
    }

    loadParties() {
        this.ngxLoader.start();
        if (this.sameEndPointRoute) {
            this.partyService.getParties().subscribe(
                (parties) => {
                    this.parties = parties.content;
                    this.totalRecords = parties.totalElements;
                },
                (err) => this.alertService.apiError(err),
            );
        } else {
            if (this.picker) {
                this.parties = this.rrrParties;
                this.totalRecords = this.rrrParties.length;
            } else {
                this.parties = this.baUnit.parties;
                this.totalRecords = this.baUnit.parties.length;
            }
        }

        this.parties.forEach((party) => {
            party['role'] = this.translateService.instant('CODELIST.VALUES.' + party.partyRoleType.value);
            party['name'] = party.getName();
        });

        this.parties = _.sortBy(this.parties, ['role', 'name'], ['asc', 'asc']);
        this.setTableCols();
        this.ngxLoader.stop();
    }

    setTableCols() {
        this.cols = [
            { field: 'pid', header: this.translateService.instant('PARTY.ID'), width: '11%', sortable: false, filterable: false, type: 'text' },
            { field: 'party', header: this.translateService.instant('PARTY.NAME'), width: '17%', sortable: false, filterable: false, type: 'text'  },
            { field: 'role', header: this.translateService.instant('PARTY.ROLES'), width: '17%', sortable: false, filterable: false, type: 'text'  },
            { field: 'radiationDate', header: this.translateService.instant('PARTY.RADIATION_DATE'), width: '15%', sortable: true, filterable: true, type: 'date'  },
            { field: 'inscriptionDate', header: this.translateService.instant('PARTY.INSCRIPTION_DATE'), width: '15%', sortable: true, filterable: true, type: 'date'  },
            { field: 'modDate', header: this.translateService.instant('PARTY.MOD_DATE'), width: '15%', sortable: true, filterable: true, type: 'date'  },
        ];

        this.tableConfig.customData = { 
            'baUnit': this.baUnit,
            'picker': this.picker,
            'hideRemovePartyButton': this.hideRemovePartyButton
        };

        if(this.formVariables.isReadOnly  || this.partiesUrl){
            this.tableConfig.addBtn = false;
        } else {
            this.tableConfig.addBtn = true;
        }

        if((this.baUnit && !this.picker) || (this.picker && !this.formVariables.isReadOnly)){
            this.tableConfig.displayAction = true;
        } else {
            this.tableConfig.displayAction = false;
        }
    }

    showPartyDialogue(party = null): void {
        this.party = party ? party : new Party();
        this.lazyLoadParty();
        this.lazyLoadPartyPicker();
    }

    async lazyLoadParty() {
        const { PartyComponent } = await import('./party.component');
        if (this.party && !this.picker) {
            setTimeout(() => {
                this.lazyPartyVcRef.clear();
                const party = this.lazyPartyVcRef.createComponent(this.cfr.resolveComponentFactory(PartyComponent));
                party.instance.party = this.party;
                party.instance.persistToDB = this.persistToDb;
                party.instance.readOnly = this.hideRemovePartyButton || this.party.registrationDate;
                party.instance.partiesUrl = this.partiesUrl;
                party.instance.formVariables = this.formVariables;
                party.instance.canceled.subscribe(() => {
                    this.cancelParty();
                });
                party.instance.saved.subscribe(($event: any) => {
                    this.saveParty($event);
                });
            }, 100);
        }
    }
    async lazyLoadPartyPicker() {
        const { PartyPickerComponent } = await import('./partyPicker.component');
        if (this.picker) {
            setTimeout(() => {
                this.lazyPartyPickerVcRef.clear();
                const picker = this.lazyPartyPickerVcRef.createComponent(
                    this.cfr.resolveComponentFactory(PartyPickerComponent),
                );
                picker.instance.filterByRRRType = this.filterByRRRType;
                picker.instance.formVariables = this.formVariables;
                picker.instance.saved.subscribe(($event: any) => {
                    this.partyPickerAddParties($event);
                });
            }, 100);
        }
    }

    partyPickerUpdateParties() {
        this.parties = this.rrrParties;
        this.totalRecords = this.rrrParties.length;
    }

    partyPickerAddParties($event) {
        this.partyPickerUpdateParties();
        this.partyPickerSave.emit($event);
        // To close party picker
        this.party = null;
    }

    partyPickerDeleteParty($event) {
        this.partyPickerUpdateParties();
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE_SAVE_REQUIRED', () => {
            this.partyPickerDelete.emit($event);
        });
    }

    saveParty(party) {
        if (this.baUnit) {
            const index = _.findIndex(this.baUnit.parties, this.party);
            if (index > -1) {
                this.baUnit.parties[index] = party;
            } else {
                this.baUnit.parties.push(party);
            }
            this.saveToContext();
        }
        this.cancelParty();
    }

    removeparty(party: Party) {
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE', () => {
            this.removePartyAction(party);
        });
    }

    removePartyAction(party: Party) {
        const index = _.findIndex(this.baUnit.parties, party);
        if (index > -1) {
            this.baUnit.parties.splice(index, 1);
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

    cancelParty() {
        this.party = null;
    }

    reCenterDialog(dialog: Dialog) {
        // TODO :: CHECK IF we still need this function
        // setTimeout(() => dialog.center(), 300);
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }

    reload(){
        this.loadParties();
    }
}
