import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessDefinitionRoutingModule } from './process-definition-routing.module';
import { ProcessDefinitionComponent } from './process-definition.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { AlertService } from '@app/core/layout/alert/alert.service';

@NgModule({
    declarations: [ProcessDefinitionComponent],
    imports: [
        CommonModule,
        ProcessDefinitionRoutingModule,
        TranslateModule,
        NgxUiLoaderModule,
        CoreModule,
        FormsModule,
    ],
    providers: [AlertService],
    exports: [ProcessDefinitionComponent],
})
export class ProcessDefinitionModule {}
