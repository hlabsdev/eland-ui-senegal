import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralFormalityRegistriesRoutingModule } from './general-formality-registries-routing.module';
import { GeneralFormalityRegistriesComponent } from './general-formality-registries.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [GeneralFormalityRegistriesComponent],
    imports: [CommonModule, GeneralFormalityRegistriesRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [GeneralFormalityRegistriesComponent],
})
export class GeneralFormalityRegistriesModule {}
