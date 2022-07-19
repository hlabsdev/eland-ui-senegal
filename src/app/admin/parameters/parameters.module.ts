import { NgModule } from '@angular/core';
import { FormsComponent } from '@app/admin/parameters/forms/forms.component';
import { FormsElementComponent } from '@app/admin/parameters/forms/formsElement.component';
import { FormsGroupComponent } from '@app/admin/parameters/formsGroup/formsGroup.component';
import { FormsGroupElementComponent } from '@app/admin/parameters/formsGroup/formsGroupElement.component';
import { RegistryComponent } from '@app/admin/parameters/registry/registry.component';
import { ElementDialogResponsibleOfficeComponent } from '@app/admin/parameters/responsibleOffice/elementDialog.component';
import { ResponsibleOfficeComponent } from '@app/admin/parameters/responsibleOffice/responsibleOffice.component';
import { TranslateModule } from '@ngx-translate/core';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { CoreModule } from '../../core/core.module';
import { PrimeDragulaDirective } from '../PrimeDragula';
import { ParametersComponent } from './parameters.component';
import { ParametersService } from './parameters.service';
import { CircleComponent } from './territory/circle/circle.component';
import { CountryComponent } from './territory/country/country.component';
import { DistrictComponent } from './territory/district/district.component';
import { DivisionComponent } from './territory/division/division.component';
import { ElementDialogComponent } from './territory/elementDialog.component';
import { RegionComponent } from './territory/region/region.component';
import { TerritoryComponent } from './territory/territory.component';
import { CachingComponent } from '@app/admin/parameters/caching/caching.component';
import { LanguageDialogComponent } from '@app/admin/parameters/language/languageDialog.component';
import { LanguageComponent } from '@app/admin/parameters/language/language.component';
import { LocaleDialogComponent } from '@app/admin/parameters/locale/localeDialog.component';
import { LocaleComponent } from '@app/admin/parameters/locale/locale.component';
import { SectionsModule } from '@app/admin/parameters/translation/sections.module';
import { ParametersRoutingModule } from './parameters-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        ParametersRoutingModule,
        DragulaModule,
        TranslateModule,
        TabViewModule,
        CheckboxModule,
        DropdownModule,
        CoreModule,
        SelectButtonModule,
        SplitButtonModule,
        TranslateModule,
        InputTextareaModule,
        PanelMenuModule,
        AccordionModule,
        NgxUiLoaderModule,
        SectionsModule,
    ],
    declarations: [
        PrimeDragulaDirective,
        FormsComponent,
        FormsElementComponent,
        FormsGroupComponent,
        FormsGroupElementComponent,
        ParametersComponent,
        TerritoryComponent,
        ResponsibleOfficeComponent,
        LanguageComponent,
        LanguageDialogComponent,
        RegionComponent,
        DivisionComponent,
        DistrictComponent,
        CircleComponent,
        CountryComponent,
        ElementDialogComponent,
        RegistryComponent,
        ElementDialogResponsibleOfficeComponent,
        CachingComponent,
        LocaleComponent,
        LocaleDialogComponent,
    ],
    exports: [
        FormsComponent,
        FormsElementComponent,
        FormsGroupComponent,
        FormsGroupElementComponent,
        SectionsModule,
        ParametersComponent,
        TerritoryComponent,
        ResponsibleOfficeComponent,
        ElementDialogComponent,
        RegistryComponent,
        ElementDialogResponsibleOfficeComponent,
        CachingComponent,
        LocaleComponent,
        LocaleDialogComponent,
    ],
    providers: [DragulaService, ParametersService],
})
export class ParametersModule {}
