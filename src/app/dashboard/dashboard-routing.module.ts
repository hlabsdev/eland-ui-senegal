import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';

const APP_ROUTES: Routes = [
    {
        path: 'dashboard/tasks',
        loadChildren: () => import('./tasks-board/tasks-board.module').then((m) => m.TasksBoardModule),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'dashboard/processes',
        loadChildren: () => import('./processes-board/processes-board.module').then((m) => m.ProcessesBoardModule),
        canActivate: [AppAuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(APP_ROUTES)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
