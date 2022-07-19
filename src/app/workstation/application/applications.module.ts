import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationsRoutingModule } from './applications-routing.module';
import { ApplicationsComponent } from './applications.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
@NgModule({
    declarations: [ApplicationsComponent],
    imports: [CommonModule, ApplicationsRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [ApplicationsComponent],
})
export class ApplicationsModule {}
