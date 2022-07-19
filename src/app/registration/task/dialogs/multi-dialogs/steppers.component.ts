import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Step } from '@app/registration/task/dialogs/multi-dialogs/step.model';

@Component({
    selector: 'sog-steppers',
    template: `
        <div class="steppers-container p-3 m-0 w-100 row">
            <div *ngFor="let step of steps; index as i" class="step col d-flex justify-content-center text-center">
                <div class="step-icon-container col-12 d-flex justify-content-center text-center align-middle p-0 m-0">
                    <div
                        class="step-icon cursor-pointer"
                        [ngClass]="{ selected: i === currentIndex }"
                        (click)="stepClick(step, i)"
                    >
                        {{ step.label | translate
                        }}<i
                            class="fa fa-check"
                            *ngIf="step.isDone"
                            style="margin-left: 0.5rem; font-size: 0.75rem;"
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./steppers.component.scss'],
})
export class SteppersComponent {
    @Input() steps: Step[];
    @Input() readonly = true;
    @Output() currentIndexChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() currentStepChange: EventEmitter<Step> = new EventEmitter<Step>();

    _currentIndex = 0;

    get currentIndex(): number {
        return this._currentIndex;
    }

    @Input()
    set currentIndex(newIndex: number) {
        this._currentIndex = newIndex;
        this.currentIndexChange.emit(this._currentIndex);
    }

    _currentStep: Step;

    get currentStep(): Step {
        return this._currentStep;
    }
    @Input()
    set currentStep(newIndex: Step) {
        this._currentStep = newIndex;
        this.currentIndexChange.emit(this._currentIndex);
    }

    stepClick(step: Step, index: number) {
        if (index !== this.currentIndex) {
            this.currentStep = step;
            this.currentIndex = index;
        }
    }
}
