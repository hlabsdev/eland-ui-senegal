import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElandDialogComponent } from './eland-dialog.component';

describe('ElandDialogComponent', () => {
    let component: ElandDialogComponent;
    let fixture: ComponentFixture<ElandDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ElandDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ElandDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
