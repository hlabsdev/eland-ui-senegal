import * as _ from 'lodash';

import { ApplicantComponent } from '../applicant/applicant.component';
import { ApplicationComponent } from '../application/application/application.component';
import { BAUnitPickerComponent } from '../baUnit/baUnitPicker.component';
import { BAUnitSetBatchTransactionsComponent } from '../baUnit/baUnitSetBatchTransactions.component';
import { BAUnitComponent } from '../baUnit/baUnit.component';
import { ChecklistComponent } from '../checklist/checklist.component';
import { DocumentGenerationComponent } from '../documentGeneration/document.generation.component';
import { PartiesComponent } from '../party/parties.component';
import { RdaiComponent } from '../rdai/rdai/rdai.component';
import { RegisterActComponent } from '../registerAct/registerAct.component';
import { RRRsComponent } from '../rrr/rrrs/rrrs.component';
import { SourcesComponent } from '../source/sources.component';
import { SpatialUnitsComponent } from '../spatialUnit/spatialUnits.component';
import { ComplementaryInfoComponent } from '../complementaryInfo/complementaryInfo.component';
import { PreregistrationFormalityComponent } from '../preregistrationFormalities/preregistrationFormality/preregistrationFormality.component';
import { BulletinComponent } from '../bulletin/bulletin.component';
import { NoticeComponent } from '../notice/notice.component';
import { LinksComponent } from '../links/links.component';
import { ListFormComponent } from '../list-form/list-form.component';
import { ConsistencyChangeDialogComponent } from '../consistencyChange/consistencyChangeDialog.component';
import { ConsistencyChangeComponent } from '../consistencyChange/consistencyChange.component';
import { BaunitChooseCreatePickerComponent } from '../consistencyChange/subforms/baunitChooseCreatePicker.component';
import { SpatialUnitPickerComponent } from '../spatialUnit/spatialUnitPicker.component';
import { CreateBaunitComponent } from '../consistencyChange/subforms/createBaunit.component';
import { RrrsFormComponent } from '../rrr/rrrsForm/rrrs.form.component';
import { RRRsPickerComponent } from '../rrr/rrrsPicker/rrrsPicker.component';
import { GisOfficeComponent } from '@app/workstation/gis/gis-office.component';
import { SpatialUnitDragPanelComponent } from '@app/workstation/spatialUnit/spatialUnit-drag-panel.component';
import { DivisionRegistryComponent } from '@app/workstation/division-registry/division-registry.component';
import { GeneralFormalityRegistryComponent } from '../general-formality-registry/general-formality-registry/general-formality-registry.component';
import { OppositionRegistryComponent } from '../opposition-registry/opposition-registry/opposition-registry.component';

export const formList = {
    'APP-SPATIAL-UNITS': {
        component: SpatialUnitsComponent,
        label: 'SPATIAL_UNIT',
    },
    'APP-PARTIES': {
        component: PartiesComponent,
        label: 'PARTY',
    },
    'APP-CHECKLIST': {
        component: ChecklistComponent,
        label: 'CHECKLIST',
    },
    'APP-BA-UNIT-CONTEXT': {
        component: BAUnitComponent,
        label: 'BA_UNIT',
    },
    'APP-BA-UNIT': {
        component: BAUnitComponent,
        label: 'BA_UNIT',
    },
    'APP-BA-UNIT-PICKER': {
        component: BAUnitPickerComponent,
        label: 'BA_UNIT_PICKER',
    },
    'APP-APPLICANT': {
        component: ApplicantComponent,
        label: 'APPLICANT',
    },
    'APP-SOURCES': {
        component: SourcesComponent,
        label: 'SOURCES',
    },
    'APP-PREREGISTRATION-FORMALITY': {
        component: PreregistrationFormalityComponent,
        label: 'PREREGISTRATION_FORMALITY',
    },
    'APP-DIVISION-REGISTRY': {
        component: DivisionRegistryComponent,
        label: 'DIVISION_REGISTRY',
    },
    'APP-GENERAL-FORMALITY-REGISTRY': {
        component: GeneralFormalityRegistryComponent,
        label: 'GENERAL_FORMALITY_REGISTRY',
    },
    'APP-OPPOSITION-REGISTRY': {
        component: OppositionRegistryComponent,
        label: 'OPPOSITION_REGISTRY',
    },
    'APP-RRRS': {
        component: RRRsComponent,
        label: 'RRR',
    },
    'APP-BA-SOURCES': {
        component: SourcesComponent,
        label: 'SOURCES',
    },
    'APP-BA-UNIT-SET-BATCH-TRANSACTIONS': {
        component: BAUnitSetBatchTransactionsComponent,
        label: 'BA_UNIT_SET_BATCH_TRANSACTIONS',
    },
    'APP-DOC-GENERATION-CONTEXT': {
        component: DocumentGenerationComponent,
        label: 'DOCUMENT_GENERATION',
    },
    'APP-RDAI': {
        component: RdaiComponent,
        label: 'RDAI',
    },
    'APP-RDA': {
        component: RegisterActComponent,
        label: 'RDA',
    },
    'APP-PUBLICATION': {
        loadChildren: () => import('../publication/publications.module').then((m) => m.PublicationsModule),
        label: 'PUBLICATION',
    },
    'APP-APPLICATION': {
        component: ApplicationComponent,
        label: 'APPLICATION',
    },
    'APP-COMPLEMENTARY-INFO': {
        component: ComplementaryInfoComponent,
        label: 'COMPLEMENTARY_INFO',
    },
    'APP-BULLETIN': {
        component: BulletinComponent,
        label: 'BULLETIN',
    },
    'APP-LINKS': {
        component: LinksComponent,
        label: 'LINKS',
    },
    'APP-NOTICE': {
        component: NoticeComponent,
        label: 'NOTICE',
    },
    'FORM-LIST': {
        component: ListFormComponent,
        label: 'NO-LABEL',
        preload: true,
    },
    'APP-CONSISTENCY-CHANGE': {
        component: ConsistencyChangeComponent,
        label: 'CONSISTENCY-CHANGE',
    },
    'APP-BA-CCP': {
        component: BaunitChooseCreatePickerComponent,
        label: 'BAUNIT-CHOOSE-CREATE-PICKER',
    },
    'APP-SPATIAL-UNIT-PICKER': {
        component: SpatialUnitPickerComponent,
        label: 'SPATIAL-UNIT-PICKER',
    },
    'APP-SPATIAL-UNIT-DRAG': {
        component: SpatialUnitDragPanelComponent,
        label: 'SPATIAL_UNIT_DRAG',
    },
    'APP-CREATE-BAUNIT': {
        component: CreateBaunitComponent,
        label: 'CREATE-BAUNIT',
    },
    'APP-RRR-PICKER-DEL': {
        loadChildren: () => import('../rrr/rrrsForm/rrrs.form.module').then((m) => m.RrrsFormModule),
        label: 'RRR-MOD-DEL',
        options: { add: false },
    },
    'APP-RRR-RADIATION-PICKER': {
        component: RRRsPickerComponent,
        label: 'RRRS_PICKER',
    },
    'APP-GIS-OFFICE': {
        component: GisOfficeComponent,
        label: 'APP-GIS-OFFICE',
    },
};

export const formMapper = (formType) => {
    formType = formType ? _.first(_.split(formType, '.')) : formType; // component
    return formList[formType];
};
