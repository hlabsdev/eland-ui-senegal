import { ColorPickerModule } from 'ngx-color-picker';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSettingsRoutingModule } from './profile-settings-routing.module';
import { ProfileSettingsComponent } from './profile-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { TableModule } from 'primeng/table';

@NgModule({
    declarations: [ProfileSettingsComponent],
    imports: [
        CommonModule,
        ProfileSettingsRoutingModule,
        TranslateModule,
        NgxUiLoaderModule,
        CoreModule,
        ColorPickerModule,
    ],
    exports: [ProfileSettingsComponent],
})
export class ProfileSettingsModule {}
