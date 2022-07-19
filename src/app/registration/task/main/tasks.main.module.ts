import { RegistrationModule } from './../../registration.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksMainRoutingModule } from './tasks-main-routing.module';
import { TasksMainComponent } from './tasks.main.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { ParametersService } from '@app/admin/parameters/parameters.service';

@NgModule({
    declarations: [TasksMainComponent],
    imports: [CommonModule, TasksMainRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule, FormsModule],
    exports: [TasksMainComponent],
    providers: [ParametersService],
})
export class TasksMainModule {}
