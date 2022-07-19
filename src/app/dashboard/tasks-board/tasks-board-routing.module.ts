import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TasksBoardComponent } from './tasks-board.component';

const routes: Routes = [{ path: '', component: TasksBoardComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TasksBoardRoutingModule {}
