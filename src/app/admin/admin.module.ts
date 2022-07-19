import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ParametersModule } from '@app/admin/parameters/parameters.module';
import { TranslateModule } from '@ngx-translate/core';
import { DragulaModule } from 'ng2-dragula';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { CoreModule } from '@app/core/core.module';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { AdminRoutingModule } from './admin-routing.module';
import { BlockerRRRElementComponent } from './rrr-validation/blocker-rrr-element.component';
import { BlockerRRRsComponent } from './rrr-validation/blocker-rrrs.component';
import { RRRValidationPartyRoleElementComponent } from './rrr-validation/rrr-validation-party-role-element.component';
import { RRRValidationPartyRolesComponent } from './rrr-validation/rrr-validation-party-roles.component';
import { RRRValidationComponent } from './rrr-validation/rrr-validation.component';
import { RRRValidationFormComponent } from './rrr-validation/rrr-validation.form.component';
import { RRRValidationService } from './rrr-validation/service/rrr-validation.service';
import { CodeListComponent } from './codes/codeList/codeList.component';

@NgModule({
    imports: [
        RouterModule,
        AdminRoutingModule,
        CoreModule,
        TabViewModule,
        CheckboxModule,
        DropdownModule,
        SelectButtonModule,
        SplitButtonModule,
        DragulaModule,
        TranslateModule,
        InputTextareaModule,
        NgxUiLoaderModule,
    ],
    declarations: [
        RRRValidationComponent,
        CodeListComponent,
        RRRValidationFormComponent,
        RRRValidationPartyRolesComponent,
        RRRValidationPartyRoleElementComponent,
        BlockerRRRsComponent,
        BlockerRRRElementComponent,
    ],
    exports: [
        RouterModule,
        CodeListComponent,
        RRRValidationComponent,
        RRRValidationFormComponent,
        RRRValidationPartyRolesComponent,
        RRRValidationPartyRoleElementComponent,
        BlockerRRRsComponent,
        BlockerRRRElementComponent,
    ],
    providers: [AppAuthGuard, TransactionInstanceService, TransactionHistoryService, RRRValidationService],
})
export class AdminModule {}
