import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreregistrationFormalitiesComponent } from './preregistrationFormalities.component';

describe('PreregistrationFormalitiesComponent', () => {
    let component: PreregistrationFormalitiesComponent;
    let fixture: ComponentFixture<PreregistrationFormalitiesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PreregistrationFormalitiesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PreregistrationFormalitiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
