import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GisOfficeComponent } from '@app/workstation/gis/gis-office.component';
import { GisComponent } from '@app/workstation/gis/gis.component';
import { ApplicantComponent } from '@app/workstation/applicant/applicant.component';
import { ApplicantsComponent } from '@app/workstation/applicant/applicants.component';
import { PublicationComponent } from '@app/workstation/publication/publication/publication.component';
import { RdaiComponent } from '@app/workstation/rdai/rdai/rdai.component';
import { AppAuthGuard } from '../core/utils/keycloak/app-auth-guard';
import { ApplicationComponent } from './application/application/application.component';
import { BAUnitComponent } from './baUnit/baUnit.component';
import { GroupComponent } from './party/groupparty/group.component';
import { PartiesComponent } from './party/parties.component';
import { PartyComponent } from './party/party.component';
import { RegisterActComponent } from './registerAct/registerAct.component';
import { ResponsibilityTypesComponent } from './rrr/responsibilityType/responsibilityTypes.component';
import { RestrictionTypesComponent } from './rrr/restrictionType/restrictionTypes.component';
import { RightTypesComponent } from './rrr/rightType/rightTypes.component';
import { RRRTypesConfigurationComponent } from './rrr/rrrType/rrrTypesConfiguration.component';
import { RRRComponent } from './rrr/rrr/rrr.component';
import { RRRsComponent } from './rrr/rrrs/rrrs.component';
import { SourceComponent } from './source/source.component';
import { SourcesComponent } from './source/sources.component';
import { SpatialUnitComponent } from './spatialUnit/spatialUnit.component';
import { SpatialUnitsComponent } from './spatialUnit/spatialUnits.component';

const APP_ROUTES: Routes = [
    { path: 'spatial-units', component: SpatialUnitsComponent, canActivate: [AppAuthGuard] },
    { path: 'spatial-unit', component: SpatialUnitComponent, canActivate: [AppAuthGuard] },
    { path: 'spatial-unit/:spatialUnitId', component: SpatialUnitComponent, canActivate: [AppAuthGuard] },
    {
        path: 'ba-units',
        loadChildren: () => import('./baUnit/baUnits/baUnits.module').then((m) => m.BAUnitsModule),
        canActivate: [AppAuthGuard],
    },
    { path: 'ba-unit', component: BAUnitComponent, canActivate: [AppAuthGuard] },
    { path: 'ba-unit/:baUnitId', component: BAUnitComponent, canActivate: [AppAuthGuard] },
    { path: 'applicants', component: ApplicantsComponent, canActivate: [AppAuthGuard] },
    { path: 'applicant', component: ApplicantComponent, canActivate: [AppAuthGuard] },
    { path: 'applicant/:applicantId', component: ApplicantComponent, canActivate: [AppAuthGuard] },
    { path: 'rrrs', component: RRRsComponent, canActivate: [AppAuthGuard] },
    { path: 'rrr', component: RRRComponent, canActivate: [AppAuthGuard] },
    { path: 'rrr/:rrrId', component: RRRComponent, canActivate: [AppAuthGuard] },
    { path: 'right-types', component: RightTypesComponent, canActivate: [AppAuthGuard] },
    { path: 'restriction-types', component: RestrictionTypesComponent, canActivate: [AppAuthGuard] },
    { path: 'responsibility-types', component: ResponsibilityTypesComponent, canActivate: [AppAuthGuard] },
    { path: 'rrrs/config', component: RRRTypesConfigurationComponent, canActivate: [AppAuthGuard] },
    { path: 'parties', component: PartiesComponent, canActivate: [AppAuthGuard] },
    { path: 'sources', component: SourcesComponent, canActivate: [AppAuthGuard] },
    { path: 'sources/:sourceId', component: SourceComponent, canActivate: [AppAuthGuard] },
    { path: 'party', component: PartyComponent, canActivate: [AppAuthGuard] },
    { path: 'party/:partyId', component: PartyComponent, canActivate: [AppAuthGuard] },
    { path: 'group', component: GroupComponent, canActivate: [AppAuthGuard] },
    { path: 'group/:groupPartyId', component: GroupComponent, canActivate: [AppAuthGuard] },
    {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.module').then((m) => m.TransactionsModule),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'rdais',
        loadChildren: () => import('../workstation/rdai/rdais.module').then((m) => m.RdaisModule),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'oppositionsregistry',
        loadChildren: () =>
            import('../workstation/opposition-registry/oppositions-registry.module').then(
                (m) => m.OppositionsRegistryModule,
            ),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'generalFormalityRegistries',
        loadChildren: () =>
            import('../workstation/general-formality-registry/general-formality-registries.module').then(
                (m) => m.GeneralFormalityRegistriesModule,
            ),
        canActivate: [AppAuthGuard],
    },
    { path: 'rdai', component: RdaiComponent, canActivate: [AppAuthGuard] },
    { path: 'rdai/:rdaiId', component: RdaiComponent, canActivate: [AppAuthGuard] },
    {
        path: 'preregistrationFormalities',
        loadChildren: () =>
            import('../workstation/preregistrationFormalities/preregistrationFormalities.module').then(
                (m) => m.PreregistrationFormalitiesModule,
            ),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'divisionRegistries',
        loadChildren: () =>
            import('../workstation/division-registry/division-registries.module').then(
                (m) => m.DivisionRegistriesModule,
            ),
        canActivate: [AppAuthGuard],
    },
    {
        path: 'publications',
        loadChildren: () => import('../workstation/publication/publications.module').then((m) => m.PublicationsModule),
        canActivate: [AppAuthGuard],
    },
    { path: 'publication', component: PublicationComponent, canActivate: [AppAuthGuard] },
    { path: 'publication/:publicationId', component: PublicationComponent, canActivate: [AppAuthGuard] },
    { path: 'rda', component: RegisterActComponent, canActivate: [AppAuthGuard] },
    { path: 'application', component: ApplicationComponent, canActivate: [AppAuthGuard] },
    {
        path: 'applications',
        loadChildren: () => import('./application/applications.module').then((m) => m.ApplicationsModule),
        canActivate: [AppAuthGuard],
    },
    { path: 'gis', component: GisComponent, canActivate: [AppAuthGuard] },
    { path: 'gis-office', component: GisOfficeComponent, canActivate: [AppAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(APP_ROUTES)],
    exports: [RouterModule],
})
export class WorkstationRoutingModule {}
