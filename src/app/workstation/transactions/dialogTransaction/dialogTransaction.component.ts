import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TransactionComponent } from '@app/workstation/transactions/transaction/transaction.component';

@Component({
    selector: 'app-dialogTransaction',
    templateUrl: './dialogTransaction.component.html',
})
export class DialogTransactionComponent implements OnInit {
    @ViewChild(TransactionComponent) transaction:TransactionComponent;
    step:number=1;
    isProcessSelected=false;
    @Input() displayCreateTransaction:boolean;
    @Input() transactionID: string;
    @Output() displayCreateTransactionChange = new EventEmitter();
   
    hasSystemAdministratorAccess: boolean;

    constructor() {
    }

    ngOnInit() {
    }
    saveTransaction(){
         this.transaction.saveTransaction();
    }
    closeTransaction(){
        this.displayCreateTransaction=false;
        this.step=1;
        this.displayCreateTransactionChange.emit(false);
    }
    updateStep(x){
        if(this.step+x<this.transaction.stepArray.length+1 && this.step+x>0 &&this.isProcessSelected==true)
        {
            this.step+=x;
        }
        this.transaction.setStep("step"+this.step);
    }
}
