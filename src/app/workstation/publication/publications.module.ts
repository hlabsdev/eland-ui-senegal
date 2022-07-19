import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [PublicationsComponent],
    imports: [CommonModule, PublicationsRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [PublicationsComponent],
})
export class PublicationsModule {}
