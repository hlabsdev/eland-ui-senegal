import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PreloaderService {
    private territoriesToPreload = new BehaviorSubject([]);
    currentTerritoriesToPreload = this.territoriesToPreload.asObservable();

    private territoryTypeToPreload = new BehaviorSubject('');
    currentTerritoryTypeToPreload = this.territoryTypeToPreload.asObservable();

    private countriesToPreload = new BehaviorSubject([]);
    currentCountriesToPreload = this.countriesToPreload.asObservable();

    private regionsToPreload = new BehaviorSubject([]);
    currentRegionsToPreload = this.regionsToPreload.asObservable();

    private circlesToPreload = new BehaviorSubject([]);
    currentCirclesToPreload = this.circlesToPreload.asObservable();

    private divisionsToPreload = new BehaviorSubject([]);
    currentDivisionsToPreload = this.divisionsToPreload.asObservable();

    private districtsToPreload = new BehaviorSubject([]);
    currentDistrictsToPreload = this.divisionsToPreload.asObservable();

    private registriesToPreload = new BehaviorSubject([]);
    currentRegistriesToPreload = this.registriesToPreload.asObservable();

    private responsibleOfficesToPreload = new BehaviorSubject([]);
    currentResponsibleOfficesToPreload = this.registriesToPreload.asObservable();

    constructor() {}
    // Territory
    setTerritoriesToPreload(_dataToPreload: any[]) {
        this.territoriesToPreload.next(_dataToPreload);
    }
    setTerritoryTypeToPreload(_dataToPreload: string) {
        this.territoryTypeToPreload.next(_dataToPreload);
    }
    setCountriesToPreload(_dataToPreload: any[]) {
        this.countriesToPreload.next(_dataToPreload);
    }
    setRegionsToPreload(_dataToPreload: any[]) {
        this.regionsToPreload.next(_dataToPreload);
    }
    setCirclesToPreload(_dataToPreload: any[]) {
        this.circlesToPreload.next(_dataToPreload);
    }
    setCommunesToPreload(_dataToPreload: any[]) {
        this.divisionsToPreload.next(_dataToPreload);
    }
    setDistrictsToPreload(_dataToPreload: any[]) {
        this.districtsToPreload.next(_dataToPreload);
    }
    // Registry
    setRegistriesToPreload(_dataToPreload: any[]) {
        this.registriesToPreload.next(_dataToPreload);
    }
    // Responsible Offices
    setResponsibleOfficesToPreload(_dataToPreload: any[]) {
        this.responsibleOfficesToPreload.next(_dataToPreload);
    }
}
