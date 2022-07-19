import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeListsComponent } from './codeLists.component';

describe('CodeListsComponent', () => {
    let component: CodeListsComponent;
    let fixture: ComponentFixture<CodeListsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CodeListsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CodeListsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
