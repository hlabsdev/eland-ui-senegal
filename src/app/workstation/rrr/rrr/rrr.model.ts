import { RRRType } from '../rrrType/rrrType.model';
import { SelectItem } from 'primeng/api';
import { Serializable } from '@app/core/interfaces/serializable.interface';
import { Variables } from '@app/core/models/variables.model';
import { Source } from '@app/core/models/source.model';
import { Fraction } from '@app/core/models/fraction.model';
import { Party } from '@app/core/models/party.model';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { CodeList } from '@app/core/models/codeList.model';
import { VersionedObject } from '@app/core/models/versionedObject.model';
import { SpatialUnit } from '../../spatialUnit/spatialUnit.model';
import { ResponsibilityType } from '../responsibilityType/responsibilityType.model';
import { RightType } from '../rightType/rightType.model';
import { RestrictionType } from '../restrictionType/restrictionType.model';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';
import Utils from '@app/core/utils/utils';
import { ModelFactory } from '@app/core/utils/model.factory';
import { cloneDeep, isEmpty, set } from 'lodash';
import { PartyTypes } from '../../party/partyType.model';
import { NaturalPerson } from '@app/core/models/naturalPerson.model';
import { LegalPerson } from '@app/core/models/legalPerson.model';
import { Parcel } from '../../spatialUnit/parcel/parcel.model';
import { SpatialUnitTypes } from '../../spatialUnit/spatialUnitType.model';
import { Building } from '../../spatialUnit/building/building.model';
import { SourceTypes } from '../../source/sourceType.model';
import { AdministrativeSource } from '@app/core/models/administrativeSource.model';
import { SupportSource } from '@app/core/models/supportSource.model';
import { Cheque } from '@app/core/models/cheque.model';

export class RRR extends VersionedObject implements Serializable, Selectable {
    [x: string]: any;
    rrrType: RRRType;
    rightType: RightType;
    restrictionType: RestrictionType;
    responsibilityType: ResponsibilityType;
    type: CodeList;
    rid: string;
    version: number;
    observations: string;
    share: Fraction;
    shareCheck: boolean;
    timeSpec: Date;
    inscriptionTransactionId: string;
    inscriptionDate: Date;
    radiationTransactionId: string;
    radiationDate: Date;
    documents: Source[];
    parties: Party[];
    spatialUnit: SpatialUnit;
    description: string;
    amount: number;
    frequency: CodeList;
    duration: number;
    durationMeasurement: CodeList;
    modDate: Date;
    modUser: string;
    rrrValidation: RRRValidation;
    registrationDate: Date;
    registered: boolean;

    constructor(obj: any = {}) {
        super(obj);
        this.rid = obj.rid;
        this.version = obj.version;
        this.observations = obj.observations;
        this.timeSpec = Utils.setDate(obj.timeSpec);
        this.share = obj.share ? new Fraction(obj.share) : new Fraction();
        this.label = obj.label;
        this.shareCheck = obj.shareCheck;
        this.rrrType = obj.rrrType;
        this.rightType = obj.rightType;
        this.restrictionType = obj.restrictionType;
        this.responsibilityType = obj.responsibilityType;
        this.type = obj.type;
        this.documents = obj.documents ? obj.documents.map((doc) => this.manageSourcePolymorphism(doc)) : [];
        this.parties = obj.parties ? obj.parties.map((party) => this.managePartyPolymorphism(party)) : [];
        this.inscriptiontransactionId = obj.transactionId;
        this.spatialUnit = obj.spatialUnit ? this.manageSpatialUnitPolymorphism(obj.spatialUnit) : null;
        this.inscriptionDate = Utils.setDate(obj.inscriptionDate);
        this.inscriptionTransactionId = obj.inscriptionTransactionId;
        this.radiationDate = Utils.setDate(obj.radiationDate);
        this.radiationTransactionId = obj.radiationTransactionId;
        this.description = obj.description;
        this.amount = obj.amount;
        this.frequency = obj.frequency;
        this.duration = obj.duration;
        this.durationMeasurement = obj.durationMeasurement;
        this.modDate = Utils.setDate(obj.modDate);
        this.modUser = obj.modUser;
        this.rrrValidation = obj.rrrValidation ? obj.rrrValidation : new RRRValidation();
        this.registrationDate = Utils.setDate(obj.registrationDate);
        this.registered = obj.registered ? obj.registered : false;
    }

    public getSelectItem(): SelectItem {
        return { label: this.value, value: this };
    }

    public serialize(): Variables {
        return {
            party: {
                value: JSON.stringify(this),
                type: 'Json',
            },
        };
    }

    public serializeWithoutId(): Variables {
        return {
            party: {
                value: JSON.stringify(set(cloneDeep(this), 'rid', null)),
                type: 'Json',
            },
        };
    }

    toSelectItem(): SelectItem {
        return { label: this.type.description, value: this };
    }

    getSpatialUnitType(): string {
        if (this.spatialUnit) {
            return this.spatialUnit.spatialUnitType;
        } else {
            return 'undefined';
        }
    }

    /**
     * Convert the Party json into the right Party model
     * (LegalPerson, NaturalPerson, Party)
     *
     * @param json JSON string with the party object representation
     */
    // TODO - remove duplicate method
    private managePartyPolymorphism(json: any) {
        if (json && json.partyType) {
            let party = new Party();
            if (json.partyType.value === PartyTypes.PARTY_NATURAL_PERSON) {
                party = new NaturalPerson(json);
            } else if (json.partyType.value === PartyTypes.PARTY_LEGAL_PERSON) {
                party = new LegalPerson(json);
            } else if (!isEmpty(json.groupParty)) {
                party = new Party(json);
                party.groupParty.partyMembers.map((member) => {
                    member.party = this.managePartyPolymorphism(member.party);
                });
            } else {
                party = new Party(json);
            }
            return party;
        } else {
            throw new Error('Party type does not exist');
        }
    }

    /**
     * Convert the SpatialUnit json into the right SpatialUnit model
     * (Building, Parcel, SpatialUnit)
     *
     * @param json JSON string with the spatial Unit object representation
     */
    // TODO - remove duplicate method
    private manageSpatialUnitPolymorphism(json: any): any {
        if (json && json.spatialUnitType === SpatialUnitTypes.BUILDING) {
            return new Building(json);
        }
        if (json && json.spatialUnitType === SpatialUnitTypes.PARCEL) {
            return new Parcel(json);
        } else {
            return new SpatialUnit(json);
        }
    }

    /**
     * Convert the Source json into the right Source model
     * (AdministrativeSource, SupportSource, Source)
     *
     * @param json JSON string with the source object representation
     */
    // TODO - remove duplicate method
    private manageSourcePolymorphism(json: any) {
        if (json && json.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE) {
            return new AdministrativeSource(json);
        } else if (json && json.sourceType === SourceTypes.SUPPORT_SOURCE) {
            return new SupportSource(json);
        } else if (json && json.sourceType === SourceTypes.CHEQUE) {
            return new Cheque(json);
        } else {
            return new Source(json);
        }
    }
}
