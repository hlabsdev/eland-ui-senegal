import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionRegistriesComponent } from './division-registries.component';

describe('DivisionRegistriesComponent', () => {
    let component: DivisionRegistriesComponent;
    let fixture: ComponentFixture<DivisionRegistriesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DivisionRegistriesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DivisionRegistriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
