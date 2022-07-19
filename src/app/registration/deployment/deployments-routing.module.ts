import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { DeploymentsComponent } from './deployments.component';

const routes: Routes = [{ path: '', component: DeploymentsComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DeploymentsRoutingModule {}
