import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SidebarModule } from 'primeng/sidebar';
import {CardModule} from 'primeng/card';
import {SplitterModule} from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';



@NgModule({
    declarations: [TasksComponent],
    imports: [CommonModule, TasksRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule, FormsModule,RadioButtonModule,SidebarModule,CardModule
        ,SplitterModule, ToolbarModule
    ],
    exports: [TasksComponent],
})
export class TasksModule {}
