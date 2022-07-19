import { DataElement } from '@app/data/models/dataElement.model';

export interface RepositoryDataService {
    getDataServices: () => DataElement[] | DataElement;
}
