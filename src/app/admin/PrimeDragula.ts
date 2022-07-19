import { Directive, OnChanges, AfterViewInit, OnInit, Input, ElementRef, SimpleChange } from '@angular/core';
import { DragulaService, dragula } from 'ng2-dragula';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[primeDragula]' })
export class PrimeDragulaDirective implements OnInit, AfterViewInit {
    @Input() public primeDragula: string;
    @Input() public dragulaModel: any;
    @Input() public dragulaOptions: any;
    protected container: any;
    private drake: any;
    private options: any;

    private el: ElementRef;
    private dragulaService: DragulaService;
    public constructor(el: ElementRef, dragulaService: DragulaService) {
        this.el = el;
        this.dragulaService = dragulaService;
    }
    ngOnInit() {
        this.options = Object.assign({}, this.dragulaOptions);
        this.container = this.el.nativeElement;
        if (!this.options.initAfterView) {
            this.initialize();
        }
    }

    ngAfterViewInit() {
        if (this.options.initAfterView) {
            this.initialize();
        }
    }

    // since we dont have access to the ngprime datatable body or table itself we need to bing laters in the angular event cycle
    // Once this fires we have a tbody tag to attach to and create the drag drop area from
    // because we need to setup dragula later we needed to create our own version of the directive so we
    // have access to the private property container.
    // If ngdragula ever changes that to protected we can just extend that directive outright and override the container.
    protected initialize() {
        if (this.options.childContainerSelector) {
            this.container = this.el.nativeElement.querySelector(this.options.childContainerSelector);
            this.options.mirrorContainer = this.container;
        }
        this.drake = dragula([this.container], this.options);
    }
}
