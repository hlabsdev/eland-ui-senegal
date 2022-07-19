import { Parcel } from '@app/workstation/spatialUnit/parcel/parcel.model';
import { ParcelSmall } from '@app/workstation/spatialUnit/parcel/parcelSmall.model';
import { ConsistencyChange } from '@app/core/models/consistencyChange.model';

export interface DestinationOptions {
    subElements: parcelSubElement[];
    condition: (subElement: parcelSubElement, destination: ConsistencyChange) => boolean;
}

export type parcelSubElement = Parcel | ParcelSmall;
