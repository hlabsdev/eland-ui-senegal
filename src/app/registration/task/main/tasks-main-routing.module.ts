import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TasksMainComponent } from './tasks.main.component';

const routes: Routes = [
    { path: '', component: TasksMainComponent, canActivate: [AppAuthGuard] },
    { path: ':taskId', component: TasksMainComponent, canActivate: [AppAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TasksMainRoutingModule {}
