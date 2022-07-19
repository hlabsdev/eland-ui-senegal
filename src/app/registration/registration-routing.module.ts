import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TaskFormComponent } from './task/taskForm.component';

const TRANSACTION_ROUTES: Routes = [
    {
        path: 'tasks',
        loadChildren: () => import('./task/tasks/tasks.module').then((m) => m.TasksModule),
        canActivate: [AppAuthGuard],
    },
    { path: 'task/:taskId', component: TaskFormComponent, canActivate: [AppAuthGuard] },
    {
        path: 'deployments',
        loadChildren: () => import('./deployment/deployments.module').then((m) => m.DeploymentsModule),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'tasks-list',
        loadChildren: () => import('./task/main/tasks.main.module').then((m) => m.TasksMainModule),
        canActivate: [AppAuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(TRANSACTION_ROUTES)],
    exports: [RouterModule],
})
export class RegistrationRoutingModule {}
