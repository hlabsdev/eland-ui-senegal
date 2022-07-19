import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

enum buttonStates {
    'default' = 'default',
    'rotated' = 'rotated',
}
@Component({
    selector: 'sog-drag-panels-button',
    template: ` <div class="border rounded px-1 pt-1 pb-2 cursor-pointer m-1 drag-button" (click)="activated()">
        <i class="fa px-auto mx-auto" [ngClass]="iconClass" aria-hidden="true" [@rotatedState]="currentState"></i>
    </div>`,
    styles: [
        `
            .drag-button {
                display: inline-block;
                width: 28px;
                height: 28px;
                text-align: center;
                vertical-align: bottom;
                border: 0;
                box-shadow: 0.5px 0.5px 1px 0.5px rgba(0, 0, 0, 0.25);
            }
            .drag-button:hover {
                background-color: #f1f1f1;
                box-shadow: 0.5px 0.5px 1px 0.5px rgba(0, 0, 0, 0.45);
            }
            .drag-button:active {
                background-color: #e1e1e1;
                box-shadow: -0.5px -0.5px 1px 0.5px rgba(0, 0, 0, 0.6);
            }
        `,
    ],
    animations: [
        trigger('rotatedState', [
            state(buttonStates.default, style({ transform: 'rotate(0)' })),
            state(buttonStates.rotated, style({ transform: 'rotate(90deg)' })),
            transition('rotated => default', animate('200ms ease-out')),
            transition('default => rotated', animate('200ms ease-in')),
        ]),
    ],
})
export class DragPanelsButtonComponent implements OnChanges {
    @Input() iconClass: string;
    @Input() switch: boolean;
    @Input() initalValue: boolean;
    @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
    currentState = buttonStates.default;

    activated() {
        this.currentState =
            this.switch && this.currentState === buttonStates.default ? buttonStates.rotated : buttonStates.default;
        this.buttonClick.emit(this.currentState !== buttonStates.default);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.currentState = this.initalValue ? buttonStates.rotated : buttonStates.default;
    }
}
