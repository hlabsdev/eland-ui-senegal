import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RrrsFormComponent } from './rrrs.form.component';

const routes: Routes = [{ path: '', component: RrrsFormComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RrrsFormRoutingModule {}
