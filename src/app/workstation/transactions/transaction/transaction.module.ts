import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessesModule } from '@app/registration/process/processes.module';
import { LazyWorkSpaceModule } from '@app/workstation/lazyWorkspace.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from 'keycloak-angular';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DialogTransactionComponent } from '../dialogTransaction/dialogTransaction.component';
import { TransactionComponent } from './transaction.component';


@NgModule({
    declarations: [TransactionComponent],
    imports: [CommonModule, TranslateModule, NgxUiLoaderModule, CoreModule, LazyWorkSpaceModule,ProcessesModule],
    exports: [TransactionComponent],
})
export class TransactionModule {}
