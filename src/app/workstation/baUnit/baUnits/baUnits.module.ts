import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BAUnitsRoutingModule } from './baUnits-routing.module';
import { BAUnitsComponent } from './baUnits.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [BAUnitsComponent],
    imports: [CommonModule, BAUnitsRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [BAUnitsComponent],
})
export class BAUnitsModule {}
