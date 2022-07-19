import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RRRValidationsComponent } from './rrr-validations.component';

describe('RRRValidationsComponent', () => {
    let component: RRRValidationsComponent;
    let fixture: ComponentFixture<RRRValidationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RRRValidationsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RRRValidationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
