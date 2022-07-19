import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { DeploymentService } from '@app/core/services/deployment.service';
import { Deployment } from '@app/core/models/deployment.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    templateUrl: './deployments.component.html',
})
export class DeploymentsComponent implements OnInit {
    deployments: Deployment[];
    
    tableConfig: TableConfig = {
        title: this.translateService.instant('HEADER.PROCESSES'),
        titleTooltip: this.translateService.instant('HEADER.PROCESSES'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'deployments',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['id', 'name'],
        addBtn: false
    }

    cols: TableCols[] = [];

    constructor(
        private translateService: TranslateService,
        private deploymentService: DeploymentService,
        private alertService: AlertService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'id', header: this.translateService.instant('DEPLOYMENT.ID'), sortable: true, filterable: true, type: 'text' },
            { field: 'name', header: this.translateService.instant('DEPLOYMENT.NAME'), sortable: true, filterable: true, type: 'text' },
        ];
        this.loadDeployments();
    }

    loadDeployments() {
        this.ngxLoader.start();
        this.deploymentService.getDeployments().subscribe(
            (deployments) => {
                this.deployments = deployments;
                this.ngxLoader.stop();
            },
            (err) => {
                this.ngxLoader.stop();
                this.alertService.camundaError(err);
            },
        );
    }

    refresh() {
        this.loadDeployments();
        this.alertService.success('MESSAGES.CONTENT_REFRESHED');
    }

    reload(){
        this.loadDeployments();
    }
}
