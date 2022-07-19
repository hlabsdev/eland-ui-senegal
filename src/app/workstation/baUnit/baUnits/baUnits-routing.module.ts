import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { BAUnitsComponent } from './baUnits.component';

const routes: Routes = [
    { path: '', component: BAUnitsComponent, canActivate: [AppAuthGuard] },
    { path: 'registered', component: BAUnitsComponent, canActivate: [AppAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BAUnitsRoutingModule {}
