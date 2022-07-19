import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElandTableComponent } from './eland-table.component';

describe('ElandTableComponent', () => {
    let component: ElandTableComponent;
    let fixture: ComponentFixture<ElandTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ElandTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ElandTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
