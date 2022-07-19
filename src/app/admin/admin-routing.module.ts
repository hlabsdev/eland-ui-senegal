import { ResponsibleOfficeComponent } from '@app/admin/parameters/responsibleOffice/responsibleOffice.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessRights } from '@app/core/models/accessRight';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { CodeListComponent } from './codes/codeList/codeList.component';
import { ParametersComponent } from './parameters/parameters.component';
import { RRRValidationsComponent } from './rrr-validation/rrr-validations/rrr-validations.component';
import { AdminLayoutComponent } from '@app/core/layout/admin/admin-layout.component';
import { CircleComponent } from './parameters/territory/circle/circle.component';
import { DistrictComponent } from './parameters/territory/district/district.component';
import { DivisionComponent } from './parameters/territory/division/division.component';
import { RegionComponent } from './parameters/territory/region/region.component';
import { CountryComponent } from './parameters/territory/country/country.component';
import { RegistryComponent } from './parameters/registry/registry.component';

const ADMIN_ROUTES: Routes = [
    {
        path: 'administration',
        component: AdminLayoutComponent,
        canActivate: [AppAuthGuard],
        data: [AccessRights.SYSTEM_ADMINISTRATOR],
        children: [
            {
                path: 'code-lists',
                loadChildren: () => import('./codes/codeLists/codeLists.module').then((m) => m.CodeListsModule),
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'code-list',
                component: CodeListComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'code-list/:codeListId',
                component: CodeListComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters',
                component: ParametersComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory',
                component: ParametersComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory&territory=Country',
                component: CountryComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory&territory=Region',
                component: RegionComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory&territory=Division',
                component: DivisionComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory&territory=District',
                component: DistrictComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'parameters?param=territory&territory=Circle',
                component: CircleComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'registry',
                component: RegistryComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'responsibleOffice',
                component: ResponsibleOfficeComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'transaction-instances',
                loadChildren: () =>
                    import('./transactionInstance/transactionInstances.module').then((m) => m.TransactionInstancesModule),
                canActivate: [AppAuthGuard],
                data: { accessData: [AccessRights.SEE_TRANSACTION_INSTANCES, AccessRights.SYSTEM_ADMINISTRATOR] },
            },
            {
                path: 'rrr-validations',
                component: RRRValidationsComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'rrr-validations/:id',
                component: RRRValidationsComponent,
                canActivate: [AppAuthGuard],
                data: [AccessRights.SYSTEM_ADMINISTRATOR],
            },
            {
                path: 'profile-settings',
                canActivate: [AppAuthGuard],
                loadChildren: () => import('../profile-settings/profile-settings.module').then((m) => m.ProfileSettingsModule),
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(ADMIN_ROUTES)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
