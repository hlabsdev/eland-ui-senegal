import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionInstancesComponent } from './transactionInstances.component';

const routes: Routes = [{ path: '', component: TransactionInstancesComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TransactionInstancesRoutingModule {}
