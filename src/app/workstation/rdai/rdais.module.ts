import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdaisRoutingModule } from './rdais-routing.module';
import { RdaisComponent } from './rdais.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [RdaisComponent],
    imports: [CommonModule, RdaisRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [RdaisComponent],
})
export class RdaisModule {}
