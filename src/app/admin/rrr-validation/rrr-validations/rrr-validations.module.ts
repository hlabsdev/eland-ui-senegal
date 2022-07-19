import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRRValidationsRoutingModule } from './rrr-validations-routing.module';
// import { RRRValidationsComponent } from './rrr-validations.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { LocaleDatePipe } from '@app/core/utils/localeDate.pipe';
import { SpecificTimezone } from '@app/core/utils/specificTimezone.pipe';
import { AdminModule } from '@app/admin/admin.module';

@NgModule({
    declarations: [
        // RRRValidationsComponent
    ],
    imports: [
        CommonModule,
        RRRValidationsRoutingModule,
        TranslateModule,
        NgxUiLoaderModule,
        CoreModule,
        LocaleDatePipe,
        SpecificTimezone,
        AdminModule
    ],
})
export class RRRValidationsModule {}
