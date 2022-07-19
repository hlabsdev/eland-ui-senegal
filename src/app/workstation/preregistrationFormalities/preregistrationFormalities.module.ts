import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreregistrationFormalitiesRoutingModule } from './preregistrationFormalities-routing.module';
import { PreregistrationFormalitiesComponent } from './preregistrationFormalities.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [PreregistrationFormalitiesComponent],
    imports: [
        CommonModule,
        PreregistrationFormalitiesRoutingModule,
        TranslateModule,
        NgxUiLoaderModule,
        CoreModule,
        FormsModule,
    ],
    exports: [PreregistrationFormalitiesComponent],
})
export class PreregistrationFormalitiesModule {}
