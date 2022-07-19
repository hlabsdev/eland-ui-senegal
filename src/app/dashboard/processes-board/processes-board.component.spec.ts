import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessesBoardComponent } from './processes-board.component';

describe('ProcessesBoardComponent', () => {
    let component: ProcessesBoardComponent;
    let fixture: ComponentFixture<ProcessesBoardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcessesBoardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessesBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
