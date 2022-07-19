export class ProcessXml {
    id: string;
    bpmn20Xml: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.bpmn20Xml = obj.bpmn20Xml;
    }
}
