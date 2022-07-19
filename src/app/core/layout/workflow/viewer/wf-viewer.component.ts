import { Component, OnInit, Input } from '@angular/core';
import { ProcessService } from '@app/core/services/process.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import * as _ from 'lodash';
import { ProcessStatistics } from '@app/core/models/processStatistics.model';

@Component({
    selector: 'core-wf-viewer',
    templateUrl: './wf-viewer.component.html',
    styleUrls: ['./wf-viewer.component.css'],
})
export class WfViewerComponent implements OnInit {
    @Input() processXml: string;
    @Input() currentTask: string;
    @Input() processStatistics: ProcessStatistics[];
    viewer: any;

    constructor(private processService: ProcessService, private alertService: AlertService) {}

    ngOnInit() {
        if (!this.processXml) {
            return;
        }

        this.viewer = new BpmnViewer({ container: '#canvas' });

        this.viewer.importXML(this.processXml, (err) => {
            if (err) {
                this.alertService.error('MESSAGES.UNABLE_TO_LOAD_WORKFLOW');
                return;
            }

            const canvas = this.viewer.get('canvas');
            const overlays = this.viewer.get('overlays');
            const elementRegistry = this.viewer.get('elementRegistry');

            if (this.currentTask) {
                this.renderCurrentTask(this.currentTask, elementRegistry, canvas, overlays);
            }

            if (this.processStatistics) {
                this.renderProcessStatistics(this.processStatistics, elementRegistry, canvas, overlays);
            }
        });
    }

    renderCurrentTask(currentTask, elementRegistry, canvas, overlays) {
        const shape = elementRegistry.get(currentTask);
        canvas.zoom('fit-viewport');

        if (!shape) {
            return;
        }

        const html = `<div style="border-radius: 10px; background-color: green; opacity: 0.3;
    pointer-events: none; width:${shape.width}px; height:${shape.height}px"/>`;
        overlays.add(this.currentTask, {
            position: {
                top: 0,
                left: 0,
            },
            html,
        });
    }

    renderProcessStatistics(processStatistics, elementRegistry, canvas, overlays) {
        processStatistics.forEach((pe) => {
            const incidents = _.sumBy(pe.incidents, 'incidentCount');

            const shape = elementRegistry.get(pe.id);

            canvas.zoom('fit-viewport');

            if (!shape) {
                return;
            }

            const position = _.includes(shape.type, 'bpmn:StartEvent')
                ? 'left: -5px; top: 23px;'
                : 'left: -8px; top: 67px;';
            const incidentBadge =
                incidents > 0 ? `<span class="badge badge-pill badge-danger">${incidents}</span>` : '';

            const html = `<div style="position: absolute; ${position} display:flex">
        <span class="badge badge-pill badge-primary">${pe.instances}</span>${incidentBadge}</div>`;

            overlays.add(pe.id, {
                position: {
                    top: 0,
                    left: 0,
                },
                html,
            });
        });
    }
}
