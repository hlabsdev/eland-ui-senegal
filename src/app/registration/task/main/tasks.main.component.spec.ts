import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksMainComponent } from './tasks.main.component';

describe('TasksMainComponent', () => {
    let component: TasksMainComponent;
    let fixture: ComponentFixture<TasksMainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TasksMainComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
