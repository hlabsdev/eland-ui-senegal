import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OppositionsRegistryRoutingModule } from './oppositions-registry-routing.module';
import { OppositionsRegistryComponent } from './oppositions-registry.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
    declarations: [OppositionsRegistryComponent],
    imports: [CommonModule, OppositionsRegistryRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule],
    exports: [OppositionsRegistryComponent],
})
export class OppositionsRegistryModule {}
