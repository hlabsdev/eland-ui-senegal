import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TasksComponent } from './tasks.component';

const routes: Routes = [
    { path: '', component: TasksComponent, canActivate: [AppAuthGuard] },
    { path: ':groupId', component: TasksComponent, canActivate: [AppAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TasksRoutingModule {}
