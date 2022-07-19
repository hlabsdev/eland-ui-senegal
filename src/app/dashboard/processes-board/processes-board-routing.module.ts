import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { ProcessesBoardComponent } from './processes-board.component';

const routes: Routes = [
    {
        path: '',
        component: ProcessesBoardComponent,
        canActivate: [AppAuthGuard],
    },
    {
        path: ':processId',
        loadChildren: () => import('./definition/process-definition.module').then((m) => m.ProcessDefinitionModule),
        canActivate: [AppAuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProcessesBoardRoutingModule {}
