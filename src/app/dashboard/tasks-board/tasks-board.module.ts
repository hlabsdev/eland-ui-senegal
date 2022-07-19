import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksBoardRoutingModule } from './tasks-board-routing.module';
import { TasksBoardComponent } from './tasks-board.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { AlertService } from '@app/core/layout/alert/alert.service';

@NgModule({
    declarations: [TasksBoardComponent],
    imports: [CommonModule, TasksBoardRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule, FormsModule],
    providers: [AlertService],
    exports: [TasksBoardComponent],
})
export class TasksBoardModule {}
