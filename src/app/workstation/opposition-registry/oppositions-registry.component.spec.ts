import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OppositionsRegistryComponent } from './oppositions-registry.component';

describe('OppositionsRegistryComponent', () => {
    let component: OppositionsRegistryComponent;
    let fixture: ComponentFixture<OppositionsRegistryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OppositionsRegistryComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OppositionsRegistryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
