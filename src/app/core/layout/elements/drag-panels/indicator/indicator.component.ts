import { Component, Input } from '@angular/core';

@Component({
    selector: 'sog-ind',
    template: '<span class="text-right ind">{{label}}</span>',
    styles: [
        `
            .ind {
                font-variant: small-caps;
                font-size: 10px;
                color: #2d353c;
            }
        `,
    ],
})
export class IndicatorComponent {
    @Input() label: string;
}
