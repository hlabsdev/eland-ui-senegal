import { SwiperModule } from 'ngx-swiper-wrapper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragPanelModule } from '@app/core/layout/elements/drag-panels/drag-panel-module';
import { DivisionRegistryService } from '@app/core/services/division-registry.service';
import { GeneralFormalityRegistryService } from '@app/core/services/generalFormalityRegistry.service';
import { KeycloakAdminService } from '@app/core/services/KeycloakAdminService.component';
import { OppositionRegistryService } from '@app/core/services/oppositionRegistry.service';
import { MatchPipe } from '@app/core/utils/pipes/Match.pipe';
import { MatchSelectItemPipe } from '@app/core/utils/pipes/MatchSelectItem.pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TranslateModule } from '@ngx-translate/core';
import { KeycloakAngularModule } from 'keycloak-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CarouselModule } from 'primeng/carousel';
import { EditorModule } from 'primeng/editor';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MenubarModule } from 'primeng/menubar';
import { SliderModule } from 'primeng/slider';
import { SpinnerModule } from 'primeng/spinner';
import { ConfigComponent } from './app-config/config.component';
import { ConfigService } from './app-config/config.service';
import { CoreService } from './core.service';
import { AlertComponent } from './layout/alert/alert.component';
import { AlertService } from './layout/alert/alert.service';
import { ButtonComponent } from './layout/elements/button/button.component';
import { CheckboxComponent } from './layout/elements/checkbox/checkbox.component';
import { DateComponent } from './layout/elements/date/date.component';
import { DialogComponent } from './layout/overlay/dialog/dialog.component';
import { DynamicFieldDirective } from './layout/elements/dynamic-field/dynamic-field.directive';
import { DynamicFormComponent } from './layout/elements/dynamic-form/dynamic-form.component';
import { FileViewerComponent } from './layout/elements/file-viewer/file-viewer.component';
import { FractionComponent } from './layout/elements/fraction/fraction.component';
import { HtmlEditorComponent } from './layout/elements/html-editor/html-editor.component';
import { InputComponent } from './layout/elements/input/input.component';
import { LabelComponent } from './layout/elements/label/label.component';
import { MultiInputComponent } from './layout/elements/multi-input/multi.input.component';
import { SearchbarComponent } from './layout/elements/searchbar/searchbar.component';
import { SelectComponent } from './layout/elements/select/select.component';
import { SeparatorComponent } from './layout/elements/separator/separator.component';
import { SogParcelCardComponent } from './layout/elements/sog-parcel-card/sog-parcel-card.component';
import { SogParcelCardsComponent } from './layout/elements/sog-parcel-card/sog-parcel-cards.component';
import { WfModelerComponent } from './layout/workflow/modeler/wf-modeler.component';
import { WfViewerComponent } from './layout/workflow/viewer/wf-viewer.component';
import { DynamicPanelElementComponent } from './layout/elements/dynamic-panel/dynamic-panel-element.component';
import { DynamicPanelComponent } from './layout/elements/dynamic-panel/dynamic-panel.component';
import { SogPanelComponent } from './layout/elements/sog-panel/sog-panel.component';
import { TextareaComponent } from './layout/elements/textarea/textarea.component';
import { DynamicFormsDirective } from './layout/m-form/dynamic-forms.directive';
import { ApplicationPreferencesService } from './services/application-preferences.service';
import { ApplicationService } from './services/application.service';
import { CodeListService } from './services/codeList.service';
import { ContentService } from './services/content.service';
import { DeploymentService } from './services/deployment.service';
import { FormService } from './services/form.service';
import { GroupService } from './services/group.service';
import { LanguageService } from './services/language.service';
import { PartyService } from './services/party.service';
import { ProcessService } from './services/process.service';
import { RegistryService } from './services/registry.service';
import { SelectService } from './layout/elements/select/select.service';
import { TaskService } from './services/task.service';
import { TransactionHistoryService } from './services/transactionHistory.service';
import { TransactionInstanceService } from './services/transactionInstance.service';
import { TransactionService } from './services/transaction.service';
import { UserService } from './services/user.service';
import { SigtasService } from './services/sigtas.service';
import { HttpReqInterceptor } from './utils/http.interceptor.service';
import { LocaleDatePipe } from './utils/localeDate.pipe';
import { NoTimezone } from './utils/noTimezone.pipe';
import { SpecificTimezone } from './utils/specificTimezone.pipe';
import { UtilService } from './utils/util.service';
import { ValidationService } from './utils/validation.service';
import { KeyCloakInitService } from './utils/keycloak/app-init';
import { SafeUrlPipe } from './utils/safe.url.pipe';
import { SigtasUtilService } from './utils/sigtasUtil.service';
import { LenPipe } from '@app/core/utils/pipes/Len.pipe';
import { SogScrollComponent } from '@app/core/layout/sog-scroll/sog-scroll.component';
import { EventSourceService } from '@app/core/utils/eventSource.service';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PickListModule } from 'primeng/picklist';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitterModule } from "primeng/splitter";
import { ElandDialogComponent, ElandDiscussionComponent, ElandTableComponent } from './components';
import { PanelMenuModule } from 'primeng/panelmenu';
import {InputTextModule} from "primeng/inputtext";

const EntryComponents = [
    InputComponent,
    LabelComponent,
    SearchbarComponent,
    ButtonComponent,
    SelectComponent,
    SeparatorComponent,
    DialogComponent,
    DateComponent,
    CheckboxComponent,
    FractionComponent,
    MultiInputComponent,
    HtmlEditorComponent,
    TextareaComponent,
];

const Components = [
    ElandTableComponent,
    ElandDialogComponent,
    ElandDiscussionComponent,
    AlertComponent,
    WfViewerComponent,
    WfModelerComponent,
    FileViewerComponent,
    DynamicPanelComponent,
    SogPanelComponent,
    DynamicPanelElementComponent,
    SogParcelCardComponent,
    SogParcelCardsComponent,
    DynamicFormComponent,
    ConfigComponent,
    SogParcelCardsComponent,
    SogParcelCardComponent,
    DynamicPanelElementComponent,
    DynamicPanelComponent,
    LocaleDatePipe,
    SearchbarComponent,
    SogScrollComponent,
];

const Pipes = [MatchPipe, MatchSelectItemPipe, LocaleDatePipe, NoTimezone, SpecificTimezone, SafeUrlPipe, LenPipe];

const Directives = [DynamicFieldDirective, DynamicFormsDirective];

@NgModule({
    imports: [
        DragDropModule,
        KeyFilterModule,
        FormsModule,
        TranslateModule,
        AccordionModule,
        FieldsetModule,
        PanelModule,
        ScrollPanelModule,
        PdfViewerModule,
        MenuModule,
        SplitButtonModule,
        RouterModule,
        OverlayPanelModule,
        ReactiveFormsModule,
        CommonModule,
        DropdownModule,
        CheckboxModule,
        RadioButtonModule,
        TableModule,
        CalendarModule,
        ListboxModule,
        KeycloakAngularModule,
        TabViewModule,
        SliderModule,
        TriStateCheckboxModule,
        SpinnerModule,
        MenubarModule,
        DialogModule,
        EditorModule,
        CarouselModule,
        AutoCompleteModule,
        AngularEditorModule,
        TooltipModule,
        DragPanelModule,
        SwiperModule,
        SelectButtonModule,
        DynamicDialogModule,
        SplitterModule,
        PanelMenuModule,
        ConfirmDialogModule,
        InputTextModule
    ],
    declarations: [...EntryComponents, ...Components, ...Pipes, ...Directives],
    providers: [
        AlertService,
        ApplicationService,
        ValidationService,
        ConfirmationService,
        UserService,
        GroupService,
        PartyService,
        TaskService,
        UtilService,
        DeploymentService,
        ProcessService,
        TransactionService,
        FormService,
        TransactionInstanceService,
        KeyCloakInitService,
        ConfigService,
        RegistryService,
        ContentService,
        TransactionHistoryService,
        SelectService,
        SigtasService,
        LanguageService,
        CoreService,
        CodeListService,
        SigtasUtilService,
        RegistryService,
        KeycloakAdminService,
        DivisionRegistryService,
        OppositionRegistryService,
        GeneralFormalityRegistryService,
        ApplicationPreferencesService,
        EventSourceService,
        ConfirmationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpReqInterceptor,
            multi: true,
        },
    ],
    exports: [
        ...EntryComponents,
        ...Components,
        ...Directives,
        ...Pipes,
        FormsModule,
        TranslateModule,
        CheckboxModule,
        RadioButtonModule,
        StepsModule,
        PickListModule,
        TableModule,
        SliderModule,
        TriStateCheckboxModule,
        ScrollPanelModule,
        AutoCompleteModule,
        SharedModule,
        DialogModule,
        PanelModule,
        CalendarModule,
        ListboxModule,
        PdfViewerModule,
        ConfirmDialogModule,
        DropdownModule,
        EditorModule,
        CarouselModule,
        FileUploadModule,
        AccordionModule,
        FieldsetModule,
        PanelModule,
        MultiSelectModule,
        SpinnerModule,
        KeyFilterModule,
        OverlayPanelModule,
        MenubarModule,
        TooltipModule,
        TabViewModule,
        SelectButtonModule,
        DynamicDialogModule,
        SplitterModule,
    ],
})
export class CoreModule {}
