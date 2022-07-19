import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElandDiscussionComponent } from './eland-discussion.component';

describe('ElandDiscussionComponent', () => {
    let component: ElandDiscussionComponent;
    let fixture: ComponentFixture<ElandDiscussionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ElandDiscussionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ElandDiscussionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
