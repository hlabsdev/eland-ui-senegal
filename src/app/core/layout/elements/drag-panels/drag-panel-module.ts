import { NgModule } from '@angular/core';
import { DragPanelsComponent } from '@app/core/layout/elements/drag-panels/drag-panels/drag-panels.component';
import { SdDragPanelsComponent } from '@app/core/layout/elements/drag-panels/sd-drag-panels/sd-drag-panels.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DragPanelsButtonComponent } from '@app/core/layout/elements/drag-panels/drag-panels-button/drag-panels-button.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IndicatorComponent } from '@app/core/layout/elements/drag-panels/indicator/indicator.component';

const Components = [DragPanelsComponent, SdDragPanelsComponent, DragPanelsButtonComponent, IndicatorComponent];

@NgModule({
    imports: [CommonModule, DragDropModule, TranslateModule],
    declarations: [...Components],
    exports: [...Components],
})
export class DragPanelModule {}
