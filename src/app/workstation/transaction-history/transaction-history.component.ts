import { Component, OnInit, Input } from '@angular/core';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { style, trigger, state, transition, animate } from '@angular/animations';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Source } from '@app/core/models/source.model';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-transaction-history',
    templateUrl: './transaction-history.component.html',
    animations: [
        trigger('rowExpansionTrigger', [
            state(
                'void',
                style({
                    transform: 'translateX(-10%)',
                    opacity: 0,
                }),
            ),
            state(
                'active',
                style({
                    transform: 'translateX(0)',
                    opacity: 1,
                }),
            ),
            transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
        ]),
    ],
})
export class TransactionHistoryComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});

    cols: any[];
    rowSizes: any = RowSizes;
    sources: Source[];
    baUnit: BAUnit = null;
    baUnitVersions: any[];

    constructor(
        public translateService: TranslateService,
        private alertService: AlertService,
        private baUnitService: BAUnitService,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit() {
        if (this.formVariables.baUnit) {
            this.baUnit = new BAUnit(this.formVariables.baUnit);
            this.ngxLoader.start();
            this.baUnitService.getBAUnitHistory(this.baUnit).subscribe(
                (baUnitVersions) => {
                    this.baUnitVersions = baUnitVersions;
                    this.cols = [
                        {
                            field: 'name',
                            header: this.translateService.instant('TRANSACTION_HISTORY.TRANSACTION_NAME'),
                        },
                        {
                            field: 'launchDate',
                            header: this.translateService.instant('TRANSACTION_HISTORY.LAUNCH_DATE'),
                        },
                        {
                            field: 'registrationDate',
                            header: this.translateService.instant('TRANSACTION_HISTORY.REGISTRATION_DATE'),
                        },
                    ];
                    this.ngxLoader.stop();
                },
                (err) => this.alertService.apiError(err),
            );
        }
        this.formVariables.showCurrentVersion = true;
    }
}
