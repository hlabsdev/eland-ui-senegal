import { Building } from '@app/workstation/spatialUnit/building/building.model';
import { Parcel } from '@app/workstation/spatialUnit/parcel/parcel.model';
import { SpatialUnit } from '@app/workstation/spatialUnit/spatialUnit.model';
import { SpatialUnitTypes } from '@app/workstation/spatialUnit/spatialUnitType.model';
import { AdministrativeSource } from '@app/core/models/administrativeSource.model';
import { LegalPerson } from '@app/core/models/legalPerson.model';
import { NaturalPerson } from '@app/core/models/naturalPerson.model';
import { Party } from '@app/core/models/party.model';
import { Source } from '@app/core/models/source.model';
import { SupportSource } from '@app/core/models/supportSource.model';
import { PartyTypes } from '@app/workstation/party/partyType.model';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import { Leasehold } from '@app/workstation/rrr/right/leasehold.model';
import { SubLease } from '@app/workstation/rrr/right/subLease.model';
import { Right } from '@app/workstation/rrr/right/right.model';
import { RightTypes } from '@app/workstation/rrr/rightType/rightType.model';
import { Responsibility } from '@app/workstation/rrr/responsibility/responsibility.model';
import { Restriction } from '@app/workstation/rrr/restriction/restriction.model';
import { RRR } from '@app/workstation/rrr/rrr/rrr.model';
import { RRRTypes } from '@app/workstation/rrr/rrrType/rrrType.model';
import { Mortgage } from '@app/workstation/rrr/mortgage/mortgage.model';
import { RestrictionTypes } from '@app/workstation/rrr/restrictionType/restrictionType.model';
import { isEmpty } from 'lodash';
import { Cheque } from '../models/cheque.model';

export class ModelFactory {
    /**
     * Convert the SpatialUnit json into the right SpatialUnit model
     * (Building, Parcel, SpatialUnit)
     *
     * @param json JSON string with the spatial Unit object representation
     */
    static manageSpatialUnitPolymorphism(json: any): any {
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
     * Convert the Party json into the right Party model
     * (LegalPerson, NaturalPerson, Party)
     *
     * @param json JSON string with the party object representation
     */
    static managePartyPolymorphism(json: any) {
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
     *  Convert the RRR json into the correct RRR
     *
     * @param json JSON string with the RRR object representation
     */
    static manageRRRPolymorphism(json: any): RRR {
        if (json && json.rrrType === RRRTypes.RESPONSIBILITY) {
            return new Responsibility(json);
        } else if (json && json.rrrType === RRRTypes.RESTRICTION) {
            if (json.restrictionType === RestrictionTypes.MORTGAGE) {
                return new Mortgage(json);
            } else {
                return new Restriction(json);
            }
        } else if (json && json.rrrType === RRRTypes.RIGHT) {
            if (json.rightType === RightTypes.LEASEHOLD) {
                return new Leasehold(json);
            } else if (json.rightType === RightTypes.SUBLEASE) {
                return new SubLease(json);
            } else {
                return new Right(json);
            }
        } else {
            return new RRR(json);
        }
    }

    /**
     * Convert the Source json into the right Source model
     * (AdministrativeSource, SupportSource, Source)
     *
     * @param json JSON string with the source object representation
     */
    static manageSourcePolymorphism(json: any) {
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
