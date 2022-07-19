import { Component } from '@angular/core';

@Component({
    selector: 'sog-scroll',
    template: '<div class="w-100 sog-scroll-container"><ng-content></ng-content></div>',
    styleUrls: ['./sog-scroll.component.scss']
})
export class SogScrollComponent {}
