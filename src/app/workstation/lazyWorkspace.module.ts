import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RRRValidationsComponent } from '@app/admin/rrr-validation/rrr-validations/rrr-validations.component';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { PartiesComponent } from './party/parties.component';
import { RRRComponent } from './rrr/rrr/rrr.component';
import { RRRFormComponent } from './rrr/rrrForm/rrr.form.component';
import { RRRsComponent } from './rrr/rrrs/rrrs.component';

@NgModule({
    imports: [CommonModule, CoreModule, TranslateModule, NgxUiLoaderModule],
    declarations: [RRRsComponent, RRRValidationsComponent, RRRComponent, RRRFormComponent, PartiesComponent],
    exports: [
        CommonModule,
        FormsModule,
        RRRsComponent,
        RRRValidationsComponent,
        CoreModule,
        RRRComponent,
        RRRFormComponent,
        PartiesComponent,
    ],
})
export class LazyWorkSpaceModule {}
