import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BAUnitsComponent } from './baUnits.component';

describe('BAUnitsComponent', () => {
    let component: BAUnitsComponent;
    let fixture: ComponentFixture<BAUnitsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BAUnitsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BAUnitsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
