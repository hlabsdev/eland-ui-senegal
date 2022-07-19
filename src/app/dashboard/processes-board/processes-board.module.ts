import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessesBoardRoutingModule } from './processes-board-routing.module';
import { ProcessesBoardComponent } from './processes-board.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { AlertService } from '@app/core/layout/alert/alert.service';

@NgModule({
    declarations: [ProcessesBoardComponent],
    imports: [CommonModule, ProcessesBoardRoutingModule, TranslateModule, NgxUiLoaderModule, CoreModule, FormsModule],
    providers: [AlertService],
    exports: [ProcessesBoardComponent],
})
export class ProcessesBoardModule {}
