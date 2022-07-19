import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ProcessInstance } from '@app/core/models/processInstance.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Transaction } from '@app/core/models/transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { ProcessService } from '@app/core/services/process.service';
import { TransactionService } from '@app/core/services/transaction.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';

@Component({
    selector: 'app-transaction-instances',
    templateUrl: './transactionInstances.component.html',
})
export class TransactionInstancesComponent implements OnInit {
    processInstances: ProcessInstance[];
    cols: any[];
    task: any;
    user: any;
    rowSizes: any = RowSizes;

    totalRecords;
    transactions: SelectItem[];
    selectTransaction: Transaction;
    search: string;
    completed = false;

    constructor(
        private translateService: TranslateService,
        private transactionService: TransactionService,
        private alertService: AlertService,
        private processService: ProcessService,
        private utilService: UtilService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.getTransactions().then(() => {
            this.loadTransactionInstances({ count: true });
        });
    }

    loadTransactionInstances(filters: any = {}) {
        const { count, completed, selectTransaction } = filters;

        this.route.queryParams.subscribe((params) => {
            this.completed = params && params.completed === 'true' ? true : false;

            const requestBody = _.pickBy(
                {
                    processDefinitionId: this.selectTransaction && this.selectTransaction.workflowProcessId,
                    unfinished: !this.completed ? true : false,
                    finished: this.completed ? true : false,
                },
                _.identity,
            );

            const query = {
                firstResult: filters.first || 0,
                maxResults: filters.rows || this.rowSizes.MEDIUM,
            };

            this.cols = [
                { field: 'processDefinitionKey', header: this.translateService.instant('PROCESS.PROCESS_NAME') },
                {
                    field: 'processDefinitionVersion',
                    header: this.translateService.instant('TRANSACTION_INSTANCE.VERSION'),
                },
                {
                    field: 'startTime',
                    header: this.translateService.instant('TRANSACTION_INSTANCE.PROCESS_START_DATE'),
                },
                { field: 'state', header: this.translateService.instant('TRANSACTION_INSTANCES.STATE') },
            ];

            const countPromise$ = count
                ? this.processService.getProcessInstancesHistoryRequestBodyCount({ requestBody }).toPromise()
                : Promise.resolve(null);

            return countPromise$.then((totalRecords) => {
                if (totalRecords) {
                    this.totalRecords = totalRecords;
                }

                return this.processService
                    .getProcessInstancesHistoryRequestBody({ requestBody, query })
                    .toPromise()
                    .then((val) => {
                        if (selectTransaction && this.selectTransaction) {
                            val.forEach((t) => {
                                t.transactionName = this.selectTransaction.name;
                            });
                            this.cols.push({
                                field: 'transactionName',
                                header: this.translateService.instant('TRANSACTION_INSTANCE.TRANSACTION_NAME'),
                            });
                        }
                        this.processInstances = val;
                    });
            });
        });
    }

    refresh() {
        this.loadTransactionInstances();
    }

    getTransactions() {
        return this.transactionService
            .getTransactions()
            .toPromise()
            .then((transactions) => {
                this.transactions = transactions.map((t) => t.toSelectItem());
                this.transactions.unshift(this.utilService.getSelectPlaceholder('TASK.TRANSACTION'));
            })
            .catch((err) => this.alertService.apiError(err));
    }
}
