import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { isObject, get } from 'lodash';

@Injectable()
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;
    private timeout;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next(1);
                }
            }
        });
    }

    success(message = 'API_MESSAGES.SAVE_SUCCESSFUL', params = {}) {
        this.showAlert({ type: 'success', text: message, params }, true);
    }

    error(message: string, params = {}) {
        this.showAlert({ type: 'error', text: message, params }, false);
    }

    warning(message: string, params = {}) {
        this.showAlert({ type: 'warning', text: message, params }, false);
    }

    displayErrorByType(error: any) {
        const type = error && error.details ? error.details.type : null;
        const { code, parameter } = error;

        switch (type) {
            case 'warning':
                this.warning('API_MESSAGES.' + (code || 'SERVER_CONNECT_ERROR'), { parameter });
                break;
            case 'success':
                this.success('API_MESSAGES.' + (code || 'SERVER_CONNECT_ERROR'), { parameter });
                break;
            default:
                this.error('API_MESSAGES.' + (code || 'SERVER_CONNECT_ERROR'), { parameter });
        }
    }

    apiError(error: any) {
        if (!isObject(error)) {
            return this.error(error);
        }

        const err: any = error;
        // TODO: return correct 404 api errors etc. currently we are not tackling not found errors
        if (err.error) {
            error = err.error;
        }

        const { code, parameter } = error.json ? error.json() : error;
        const customMsg = get(error, 'messageexception.customMessage');

        this.error('API_MESSAGES.' + (code || customMsg || 'SERVER_CONNECT_ERROR'), { parameter });
    }

    camundaError(error: any) {
        if (!error._body) {
            // TODO: detect error type and render correctly translated message , eg Http failure response for (unknown url): 0 Unknown Error.
            if (error.status === 0) {
                error.message = 'API_MESSAGES.CAM0001';
            }

            return this.error(error.message || error);
        }

        const { type, message } = JSON.parse(error._body);

        this.error('CAMUNDA_ERROR.' + type + ': ' + message); // TODO: Translate make them more understandable
    }

    showAlert(obj, keepAfterNavigationChange) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next(obj);
        window.scrollTo(0, 0);
        if (this.timeout) {
            clearInterval(this.timeout);
        }
        this.timeout = setTimeout(() => this.clear(), 8000);
    }

    clear() {
        this.subject.next(1);
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
