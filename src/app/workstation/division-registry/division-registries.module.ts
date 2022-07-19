import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DivisionRegistriesRoutingModule } from './division-registries-routing.module';
import { DivisionRegistriesComponent } from './division-registries.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [DivisionRegistriesComponent],
    imports: [CommonModule, DivisionRegistriesRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [DivisionRegistriesComponent],
})
export class DivisionRegistriesModule {}
