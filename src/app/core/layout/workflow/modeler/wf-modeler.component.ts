import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcessService } from '@app/core/services/process.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import BpmnViewer from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import * as moddle from './moddle';

@Component({
    selector: 'core-wf-modeler',
    templateUrl: './wf-modeler.component.html',
    styleUrls: ['./wf-modeler.component.css'],
})
export class WfModelerComponent implements OnInit {
    @Input() processXml: string;
    @Output() elementSelected = new EventEmitter();
    viewer: any;

    constructor(private processService: ProcessService, private alertService: AlertService) {}

    ngOnInit() {
        if (!this.processXml) {
            this.alertService.error('MESSAGES.DIAGRAM_UNAVAILABLE');
            return;
        }

        this.viewer = new BpmnViewer({
            additionalModules: [propertiesPanelModule, propertiesProviderModule],
            container: '#canvas',
            //BPMNViewer's Config panel 
            propertiesPanel: {
                parent: '#properties',
            },
            moddleExtensions: {
                camunda: moddle.moddle,
            },
        });

        this.viewer.importXML(this.processXml, (err) =>
            err ? this.alertService.error('MESSAGES.UNABLE_TO_LOAD_WORKFLOW') : null,
        );
        this.viewer.get('eventBus').on('element.click', (event: any) => this.elementSelected.emit(event));
    }
}
