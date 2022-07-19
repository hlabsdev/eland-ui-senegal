import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RRRValidationsComponent } from './rrr-validations.component';

const routes: Routes = [{ path: '', component: RRRValidationsComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RRRValidationsRoutingModule {}
