import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ProcessesModule } from '@app/registration/process/processes.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DialogTransactionComponent } from '../dialogTransaction/dialogTransaction.component';
import { TransactionModule } from '../transaction/transaction.module';


@NgModule({
    declarations: [DialogTransactionComponent],
    imports: [CommonModule, TranslateModule, NgxUiLoaderModule, CoreModule,TransactionModule,ProcessesModule],
    exports: [DialogTransactionComponent],
})
export class DialogTransactionModule {}
