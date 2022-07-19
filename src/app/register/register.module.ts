import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { CoreModule } from '@app/core/core.module';

@NgModule({
    declarations: [RegisterComponent],
    imports: [CommonModule, RegisterRoutingModule, TranslateModule, SwiperModule, CoreModule],
})
export class RegisterModule {}
