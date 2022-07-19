import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { GeneralFormalityRegistriesComponent } from './general-formality-registries.component';

const routes: Routes = [{ path: '', component: GeneralFormalityRegistriesComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GeneralFormalityRegistriesRoutingModule {}
