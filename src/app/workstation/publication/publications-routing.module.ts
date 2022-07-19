import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { PublicationsComponent } from './publications.component';

const routes: Routes = [{ path: '', component: PublicationsComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicationsRoutingModule {}
