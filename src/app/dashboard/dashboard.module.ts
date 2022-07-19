import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/core/core.module';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        CoreModule,
        AutoCompleteModule,
        DynamicDialogModule,
        FieldsetModule,
        PanelModule,
    ],
})
export class DashboardModule {}
