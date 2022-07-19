import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { ProcessDefinitionComponent } from './process-definition.component';

const routes: Routes = [{ path: '', component: ProcessDefinitionComponent, canActivate: [AppAuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProcessDefinitionRoutingModule {}
