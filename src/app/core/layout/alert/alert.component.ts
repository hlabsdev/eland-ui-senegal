import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { AlertService } from './alert.service';
@Component({
    selector: 'core-alert',
    templateUrl: './alert.component.html',
    animations: [
        trigger('alertState', [
            state(
                'show',
                style({
                    transform: 'translateX(0)',
                }),
            ),
            state(
                'hide',
                style({
                    transform: 'translateX(calc(100% + 100px))',
                }),
            ),
            transition('hide => show', animate('480ms ease-out')),
            transition('show => hide', animate('350ms ease-in')),
        ]),
    ],
})
export class AlertComponent implements OnInit, OnChanges {
    @Input() message: any;
    @Input() local = false;
    @Input() autoClear = false;
    @Input() compact = false;

    showAlert: boolean;
    get alertStateName() {
        return this.showAlert ? 'show' : 'hide';
    }

    constructor(private alertService: AlertService, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit() {
        if (!this.local) {
            this.alertService.getMessage().subscribe((message) => {
                this.message = message;
                this.changeDetectorRef.detectChanges();
                this.autoClearSetTimeout();
            });
        }
        this.autoClearSetTimeout();
    }

    ngOnChanges() {
        this.autoClearSetTimeout();
    }

    autoClearSetTimeout() {
        if (this.message) {
            this.showAlert = true;
        }
        if (this.autoClear) {
            setTimeout(() => {
                this.clear();
            }, 6000);
        }
    }

    clear() {
        this.showAlert = false;
        setTimeout(() => (this.local ? (this.message = null) : this.alertService.clear()), 1000);
    }
}
