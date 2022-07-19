import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionInstancesComponent } from './transactionInstances.component';

describe('TransactionInstancesComponent', () => {
    let component: TransactionInstancesComponent;
    let fixture: ComponentFixture<TransactionInstancesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionInstancesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TransactionInstancesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
