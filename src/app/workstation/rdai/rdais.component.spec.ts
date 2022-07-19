import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RdaisComponent } from './rdais.component';

describe('RdaisComponent', () => {
    let component: RdaisComponent;
    let fixture: ComponentFixture<RdaisComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RdaisComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RdaisComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
