import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { OppositionsRegistryComponent } from './oppositions-registry.component';

const routes: Routes = [{ path: '', component: OppositionsRegistryComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OppositionsRegistryRoutingModule {}
