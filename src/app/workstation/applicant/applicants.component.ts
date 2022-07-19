import { ApplicantService } from '@app/core/services/applicant.service';
import { Applicant } from '@app/core/models/applicant.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-applicants',
    templateUrl: 'applicants.component.html',
})
export class ApplicantsComponent implements OnInit {
    applicantsUrl: boolean;
    applicants: Applicant[];
    rowSizes: any = RowSizes;
    
    tableConfig: TableConfig = {
        title: '',
        titleTooltip: '',
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'applicants',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['firstName', 'lastName'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private applicantService: ApplicantService,
        private router: Router,
        private alertService: AlertService,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.applicantsUrl = this.router.url === '/applicants';

        this.cols = [
            { field: 'firstName', header: this.translateService.instant('APPLICANT.FIRST_NAME'), sortable: true, filterable: true, type: 'text' },
            { field: 'lastName', header: this.translateService.instant('APPLICANT.LAST_NAME'), sortable: true, filterable: true, type: 'text' },
        ];

        if(this.applicantsUrl){
            this.tableConfig.addBtn = false;
            this.tableConfig.title = this.translateService.instant('HEADER.APPLICANTS');
            this.tableConfig.titleTooltip = this.translateService.instant('HEADER.APPLICANTS');
        } else {
            this.tableConfig.addBtn = true;
            this.tableConfig.title = this.translateService.instant('APPLICANTS.TITLE_LIST');
            this.tableConfig.titleTooltip = this.translateService.instant('APPLICANTS.TITLE_LIST');
        }

        this.tableConfig.customData = {'applicantsUrl' : this.applicantsUrl};

        this.getApplicants();
    }

    getApplicants() {
        this.ngxLoader.start();
        this.applicantService.getApplicants().subscribe(
            (result) => {
                this.applicants = result;
                this.ngxLoader.stop();
            },
            (err) => {
                this.ngxLoader.stop();
                this.alertService.apiError(err);
            },
        );
    }

    editApplicant(applicant: Applicant): void {
        this.router.navigate(['applicant', applicant.id]);
    }

    addApplicant(): void {
        this.router.navigate(['applicant']);
    }

    reload(){
        this.getApplicants();
    }
}
