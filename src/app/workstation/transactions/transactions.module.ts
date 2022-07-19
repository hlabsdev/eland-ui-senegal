import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { TransactionModule } from './transaction/transaction.module';
import { ProcessesModule } from '@app/registration/process/processes.module';
import { DialogTransactionModule } from './dialogTransaction/dialogTransaction.module';

@NgModule({
    declarations: [TransactionsComponent],
    imports: [CommonModule, TransactionsRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule,DialogTransactionModule],
    exports: [TransactionsComponent],
})
export class TransactionsModule {}
