import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RrrsFormComponent } from './rrrs.form.component';

describe('RrrsFormComponent', () => {
    let component: RrrsFormComponent;
    let fixture: ComponentFixture<RrrsFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RrrsFormComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RrrsFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
