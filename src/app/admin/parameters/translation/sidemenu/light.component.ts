import { Component, Input, OnInit } from '@angular/core';
@Component({
    selector: 'sog-light',
    template: `<div
        class="light pr-1"
        [style.opacity]="backgroundOpacity"
        [ngClass]="{ active: active, over: over }"
    ></div>`,
    styleUrls: ['./light.component.scss'],
})
export class LightComponent implements OnInit {
    @Input() active: boolean;
    @Input() over: boolean;
    @Input() level: number;
    backgroundOpacity: string;

    ngOnInit() {
        this.backgroundOpacity = (100 / (this.level + 1)).toString() + '%';
    }
}
