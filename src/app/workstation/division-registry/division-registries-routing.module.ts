import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { DivisionRegistriesComponent } from './division-registries.component';

const routes: Routes = [{ path: '', component: DivisionRegistriesComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DivisionRegistriesRoutingModule {}
