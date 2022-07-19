import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDefinitionComponent } from './process-definition.component';

describe('ProcessDefinitionComponent', () => {
    let component: ProcessDefinitionComponent;
    let fixture: ComponentFixture<ProcessDefinitionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcessDefinitionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessDefinitionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
