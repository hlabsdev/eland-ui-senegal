import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessRights } from '@app/core/models/accessRight';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';

import { ProfileSettingsComponent } from './profile-settings.component';

const routes: Routes = [
    {
        path: '',
        component: ProfileSettingsComponent,
        canActivate: [AppAuthGuard],
        data: [AccessRights.SYSTEM_ADMINISTRATOR],
    },
    {
        path: '?setting=user_profile',
        component: ProfileSettingsComponent,
        canActivate: [AppAuthGuard],
        data: [AccessRights.SYSTEM_ADMINISTRATOR],
    },
    {
        path: '?setting=session_preferences',
        component: ProfileSettingsComponent,
        canActivate: [AppAuthGuard],
        data: [AccessRights.SYSTEM_ADMINISTRATOR],
    },
    {
        path: '?setting=application_preferences',
        component: ProfileSettingsComponent,
        canActivate: [AppAuthGuard],
        data: [AccessRights.SYSTEM_ADMINISTRATOR],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProfileSettingsRoutingModule {}
