import { Applicant } from '@app/core/models/applicant.model';
import { Application } from '@app/core/models/application.model';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { GenericDocument } from '@app/core/models/genericDocument.model';
import { Transaction } from '@app/core/models/transaction.model';
import { Rdai } from '@app/core/models/rdai.model';
import { Registry } from '@app/core/models/registry.model';
import { ParcelSmall } from '@app/workstation/spatialUnit/parcel/parcelSmall.model';
import { SigtasLink } from '@app/core/models/sigtas.model';
import * as _ from 'lodash';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { Checklist } from '@app/workstation/checklist/checklist.model';

export class FormVariables {
    spatialUnitId: string;
    applicantId: string;
    application: Application | null;
    sources: string[];
    baUnit: BAUnit;
    baUnitId: string;
    registry: Registry;
    applicant: Applicant | null;
    party: string;
    checklists: Checklist[];
    transaction: string;
    numberOfProcesses: number | null;
    inputEntities: any[];
    saveToLadm: boolean; // added via form component
    isReadOnly: boolean; // added via form component
    checklistFormType: string; // added via form component
    administrativeSourceType: string; // added via form component
    complementaryInfoSection: string; // added via form component
    noticeSection: string; // added via form component
    showCurrentVersion: boolean;
    documentType: string;
    documentTemplate: string;
    documentLabel: string;
    generateDocumentId: string;
    document: GenericDocument;
    complementaryInfo: ComplementaryInfo;
    rdaiId: string;
    divisionRegistryId: string;
    generalFormalityRegistryId: string;
    oppositionRegistryId: string;
    rdaId: string;
    rdai: Rdai;
    applicationId: Application | null;
    preregistrationId: string;
    rootProcessInstanceId: string;
    signatoryAuthority: string;
    sigtasLinks: SigtasLink[];
    setPlacard: string;
    completedFormNames: string[];
    messageCode: { type: string; message: string };
    baUnitFormFieldsRequired: boolean;
    showRoleChangeButton: boolean;
    baUnitRRRLeaseFormFieldsRequired: boolean;
    consistencyChangeGroupId: string;
    rrrValidation: RRRValidation;
    validationTransaction: Transaction;
    isFastTrackProcess: boolean;
    arcGIS: any;
    slipType: string;
    allowElectronicSignature: boolean;
    electronicSignatureRole: string;
    boundariesDate: Date;
    generatedNicads: ParcelSmall[];
    newBaUnitIds: string[];
    requisitionDate: Date;
    journalSendDate: Date;
    courtSendDate: Date;
    attorneySendDate: Date;
    mayorSendDate: Date;
    individualSendDate: Date;
    rfpFilters: string;
    generateTitleNumber: boolean;
    useSubSpatialUnits: boolean;

    constructor(obj: any = {}) {
        this.applicantId = this.getValue(obj.applicantId);
        this.boundariesDate = this.getValue(obj.boundariesDate);
        this.applicationId = this.getValue(obj.applicationId);
        this.application =
            obj.application && obj.application.value
                ? new Application(JSON.parse(obj.application.value))
                : new Application();
        this.sources = obj.sources && obj.sources.value ? JSON.parse(obj.sources.value) : null;
        this.transaction = this.getValue(obj.transactionId);
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.numberOfProcesses = this.getValue(obj.numberOfProcesses);
        this.inputEntities = this.getValue(obj.inputEntities);
        this.sources = obj.sources && obj.sources.value ? JSON.parse(obj.sources.value) : null;
        this.checklists =
            obj.checklists && obj.checklists.value
                ? JSON.parse(obj.checklists.value).map((checklist) => new Checklist(checklist))
                : null;
        this.baUnit = obj.baUnit && obj.baUnit.value ? new BAUnit(JSON.parse(obj.baUnit.value)) : new BAUnit();
        this.applicant = obj.applicant && obj.applicant.value ? new Applicant(JSON.parse(obj.applicant.value)) : null;
        this.baUnitId = this.getValue(obj.baUnitId);
        this.showCurrentVersion = obj.showCurrentVersion;
        this.documentType = this.getValue(obj.documentType);
        this.documentTemplate = this.getValue(obj.documentTemplate);
        this.documentLabel = this.getValue(obj.documentLabel);
        this.document = obj.document && obj.document.value ? new GenericDocument(JSON.parse(obj.document.value)) : null;
        this.complementaryInfo =
            obj.complementaryInfo && obj.complementaryInfo.value
                ? new ComplementaryInfo(JSON.parse(obj.complementaryInfo.value))
                : null;
        this.rdaId = this.getValue(obj.rdaId);
        this.rdaiId = this.getValue(obj.rdaiId);
        this.divisionRegistryId = this.getValue(obj.divisionRegistryId);
        this.generalFormalityRegistryId = this.getValue(obj.generalFormalityRegistryId);
        this.generateDocumentId = this.getValue(obj.generateDocumentId);
        this.preregistrationId = this.getValue(obj.preregistrationId);
        this.rootProcessInstanceId = this.getValue(obj.rootProcessInstanceId);
        this.signatoryAuthority = this.getValue(obj.signatoryAuthority);
        this.sigtasLinks = this.getValue(obj.sigtasLinks) ? JSON.parse(this.getValue(obj.sigtasLinks)) : null;
        this.setPlacard = this.getValue(obj.setPlacard);
        this.completedFormNames = this.getValue(obj.completedFormNames) ? this.getValue(obj.completedFormNames) : [];
        this.baUnitFormFieldsRequired = this.getValue(obj.baUnitFormFieldsRequired)
            ? JSON.parse(this.getValue(obj.baUnitFormFieldsRequired))
            : true;
        this.messageCode = this.getValue(obj.messageCode);
        this.showRoleChangeButton = this.getValue(obj.showRoleChangeButton)
            ? JSON.parse(this.getValue(obj.showRoleChangeButton))
            : false;
        this.baUnitRRRLeaseFormFieldsRequired = this.getValue(obj.baUnitRRRLeaseFormFieldsRequired)
            ? JSON.parse(this.getValue(obj.baUnitRRRLeaseFormFieldsRequired))
            : true;
        this.consistencyChangeGroupId = this.getValue(obj.consistencyChangeGroupId);
        this.rrrValidation =
            obj.rrrValidation && obj.rrrValidation.value
                ? new RRRValidation(JSON.parse(obj.rrrValidation.value))
                : new RRRValidation();
        this.validationTransaction = obj.validationTransaction || null;
        this.isFastTrackProcess = this.getValue(obj.isFastTrackProcess)
            ? JSON.parse(this.getValue(obj.isFastTrackProcess))
            : false;
        this.rdai = this.getValue(obj.rdai) ? new Rdai(JSON.parse(this.getValue(obj.rdai))) : null;
        this.arcGIS = obj.arcGIS || {};
        this.slipType = this.getValue(obj.slipType);
        this.allowElectronicSignature = this.getValue(obj.allowElectronicSignature)
            ? JSON.parse(this.getValue(obj.allowElectronicSignature))
            : false;
        this.electronicSignatureRole = this.getValue(obj.electronicSignatureRole);
        this.generatedNicads = this.getValue(obj.generatedNicads)
            ? JSON.parse(this.getValue(obj.generatedNicads)).map((parcel) => new ParcelSmall(parcel))
            : [];
        this.newBaUnitIds = this.getValue(obj.newBaUnitIds) ? JSON.parse(this.getValue(obj.newBaUnitIds)) : null;
        this.requisitionDate = this.getValue(obj.requisitionDate);
        this.journalSendDate = this.getValue(obj.journalSendDate);
        this.courtSendDate = this.getValue(obj.courtSendDate);
        this.attorneySendDate = this.getValue(obj.attorneySendDate);
        this.mayorSendDate = this.getValue(obj.mayorSendDate);
        this.individualSendDate = this.getValue(obj.individualSendDate);
        this.rfpFilters = this.getValue(obj.rfpFilters);
        this.generateTitleNumber = this.getValueParse(obj.generateTitleNumber);
        this.useSubSpatialUnits = this.getValueParse(obj.useSubSpatialUnits);
    }

    getValue(variable: { value: any }): any {
        return variable && variable.value ? variable.value : null;
    }

    getValueParse(variable: { value: any }): any {
        return variable && variable.value ? JSON.parse(variable.value) : null;
    }

    getPath(path = '', defaultValue: any = null): any {
        return defaultValue ? _.get(this, path, defaultValue) : _.get(this, path);
    }

    hasPath(path = ''): boolean {
        return _.hasIn(this, path);
    }
}
