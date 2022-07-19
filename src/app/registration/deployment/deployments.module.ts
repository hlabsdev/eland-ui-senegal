import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeploymentsRoutingModule } from './deployments-routing.module';
import { DeploymentsComponent } from './deployments.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [DeploymentsComponent],
    imports: [CommonModule, DeploymentsRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule, FormsModule],
    exports: [DeploymentsComponent],
})
export class DeploymentsModule {}
