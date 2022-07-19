import { Injectable } from '@angular/core';

@Injectable()
export class EventSourceService {
    EventSource = (path: string, headers: any = {}) => new EventSource(path);
}
