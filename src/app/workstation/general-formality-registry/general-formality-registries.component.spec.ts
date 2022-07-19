import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralFormalityRegistriesComponent } from './general-formality-registries.component';

describe('GeneralFormalityRegistriesComponent', () => {
    let component: GeneralFormalityRegistriesComponent;
    let fixture: ComponentFixture<GeneralFormalityRegistriesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GeneralFormalityRegistriesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GeneralFormalityRegistriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
