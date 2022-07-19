import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TranslateService } from '@ngx-translate/core';
import { WarningResult } from '@app/core/utils/models/warningResult.model';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { Variables } from '@app/core/models/variables.model';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { BAUnit } from './baUnit.model';
import { BAUnitService } from './baUnit.service';

@Component({
    selector: 'app-ba-unit-picker',
    templateUrl: 'baUnitPicker.component.html',
})
export class BAUnitPickerComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ baUnit: BAUnit; variable: Variables }>();
    @Output() canceled = new EventEmitter<BAUnit>();
    baUnit: BAUnit;
    regBaUnits: BAUnit[];
    totalRecords: number;
    rowSizes: any = RowSizes;
    cols: any[];
    searchText = '';
    caveatWarningMessage: string;

    @ViewChild('dataTableBAUnitPicker') table: Table;

    constructor(
        private baUnitService: BAUnitService,
        private alertService: AlertService,
        protected route: ActivatedRoute,
        protected translateService: TranslateService,
    ) {
        super();
    }

    ngOnInit(): void {
        const routeObs = this.route.params;
        routeObs
            .pipe(map((params: Params) => params['baUnitId']))
            .pipe(
                switchMap((baUnitId: string) => {
                    const baunitid = baUnitId ? baUnitId : this.formVariables.baUnitId;
                    const baunit = this.formVariables.baUnit ? this.formVariables.baUnit : new BAUnit();
                    return baunitid ? this.baUnitService.getBAUnit(new BAUnit({ uid: baunitid })) : of(baunit);
                }),
            )
            .subscribe(
                (baUnit) => {
                    this.baUnit = baUnit;
                    this.caveatWarningMessage = new WarningResult('MESSAGES.BA_UNIT_HAS_CAVEATS_WARNING').toMessage();
                },
                (err) => this.alertService.apiError(err),
            );
    }

    searchBaUnits() {
        this.table.reset();
        this.loadRegisteredBAUnits();
    }

    loadRegisteredBAUnits(event: LazyLoadEvent = {}) {
        const args = {
            page: event.first / event.rows,
            perPage: event.rows ? event.rows : this.rowSizes.SMALL,
            orderBy: event.sortField,
            direction: event.sortOrder,
            search: this.searchText,
            withoutActiveTransactions: true,
        };

        this.baUnitService.getRegisteredBAUnits(args).subscribe(
            (result) => {
                this.regBaUnits = result.content;
                this.totalRecords = result.totalElements;

                this.cols = [
                    { field: 'titleName', header: this.translateService.instant('BA_UNIT.ID'), width: '30%' },
                    {
                        field: 'registry.district.circle',
                        header: this.translateService.instant('BA_UNIT.REGISTRY.DISTRICT'),
                        width: '30%',
                    },
                    { field: 'owner', header: this.translateService.instant('BA_UNIT.OWNER'), width: '30%' },
                ];
            },
            (err) => this.alertService.apiError(err),
        );
    }

    save(baUnit: BAUnit) {
        this.saved.emit({
            baUnit,
            variable: {
                baUnitId: { value: baUnit.uid, type: 'String' },
                titleNumber: { value: baUnit.getTitle(), type: 'String' },
            },
        });
        this.alertService.success('BA_UNIT_PICKER.SUCCESFULL_ADD_MESSAGE');
    }

    cancel(): void {
        this.canceled.emit(this.baUnit);
    }
}
