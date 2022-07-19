import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodeListsComponent } from './codeLists.component';

const routes: Routes = [{ path: '', component: CodeListsComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CodeListsRoutingModule {}
