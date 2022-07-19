import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionInstancesRoutingModule } from './transactionInstances-routing.module';
import { TransactionInstancesComponent } from './transactionInstances.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [TransactionInstancesComponent],
    imports: [CommonModule, TransactionInstancesRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
})
export class TransactionInstancesModule {}
