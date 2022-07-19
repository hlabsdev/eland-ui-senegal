import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { RdaisComponent } from './rdais.component';

const routes: Routes = [{ path: '', component: RdaisComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RdaisRoutingModule {}
