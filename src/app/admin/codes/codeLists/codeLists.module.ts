import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeListsRoutingModule } from './codeLists-routing.module';
import { CodeListsComponent } from './codeLists.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';

@NgModule({
    declarations: [CodeListsComponent],
    imports: [CommonModule, CodeListsRoutingModule, TranslateModule, NgxUiLoaderModule, FormsModule, CoreModule],
    providers: [SectionsService],
})
export class CodeListsModule {}
