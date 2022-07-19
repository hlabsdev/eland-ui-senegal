import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { CoreModule } from '@app/core/core.module';

@NgModule({
    declarations: [ForgotPasswordComponent],
    imports: [CommonModule, ForgotPasswordRoutingModule, TranslateModule, SwiperModule, CoreModule],
})
export class ForgotPasswordModule {}
