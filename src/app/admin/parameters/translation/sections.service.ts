import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Section } from '@app/core/models/section.model';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { TranslationService } from '@app/translation/translation.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { TranslationRepository } from '@app/translation/translation.repository';
import * as _ from 'lodash';

@Injectable()
export class SectionsService {
    private _selectedSection: BehaviorSubject<Section> = new BehaviorSubject<Section>(null);
    selectedSection$: Observable<Section> = this._selectedSection.asObservable();
    private _currentAdd: BehaviorSubject<Section> = new BehaviorSubject<Section>(null);
    currentAdd$: Observable<Section> = this._currentAdd.asObservable();
    private _currentSectionItem: BehaviorSubject<SectionItem> = new BehaviorSubject<SectionItem>(null);
    currentSectionItem$: Observable<SectionItem> = this._currentSectionItem.asObservable();

    constructor(private translationService: TranslationService, private translationRepo: TranslationRepository) {}

    getCurrentSectionItem = () => this._currentSectionItem.getValue();

    getSectionByTranslationKey = (translationKey: string): Observable<Section> => {
        const createSection = (sectionName: string, parent?: Section): Observable<Section> =>
            this.translationRepo.section
                .setOne(new Section({ name: sectionName }).setParent(parent))
                .pipe(map((section) => new Section(section)));

        const getSection = (
            sectionName: string,
            options: { children?: string[]; parent?: Section } = {},
        ): Observable<Section> =>
            (options.parent
                ? of(options.parent.subSections || [])
                : this.translationService.currentSections$.pipe(first())
            ).pipe(
                mergeMap((sections) => {
                    let currentSection = null;
                    (sections || []).forEach((section) => {
                        if (section.name === sectionName) {
                            currentSection = section;
                        }
                    });
                    return (currentSection ? of(currentSection) : createSection(sectionName, options.parent)).pipe(
                        mergeMap((section) =>
                            !(options.children && options.children.length > 0)
                                ? of(section)
                                : getSection(options.children.shift(), { children: options.children, parent: section }),
                        ),
                    );
                }),
            );

        const parentElements = translationKey.split('.');
        return getSection(parentElements.shift(), { children: parentElements });
    };

    getSectionItemByTranslationKey = (
        translationKey: string,
        baseKey: string,
        saveNewSectionItem = true,
    ): Observable<SectionItem> => {
        const createSectionItem = (sectionItemName: string, parent: Section): Observable<SectionItem> => {
            const tmpSectionItem = new SectionItem({ key: sectionItemName }, parent);
            return !saveNewSectionItem
                ? of(tmpSectionItem)
                : this.translationRepo.sectionItem
                      .setOne(tmpSectionItem)
                      .pipe(map((savedSectionItem) => new SectionItem(savedSectionItem)));
        };

        return this.getSectionByTranslationKey(baseKey).pipe(
            mergeMap((parentSection) => {
                const currentSectionItems = _.filter(parentSection.sectionItems || [], { key: translationKey });
                return currentSectionItems.length > 0
                    ? of(currentSectionItems[0])
                    : createSectionItem(translationKey, parentSection);
            }),
        );
    };

    selectSection = (section: Section) => this._selectedSection.next(section);
    selectSectionItem = (sectionItem: SectionItem) => this._currentSectionItem.next(sectionItem);
    addSection = (section: Section) => this._currentAdd.next(section);

    selectCurrentSectionItemByTranslationKey = (
        translationKey: string,
        baseKey?: string,
        saveNewSectionItem = true,
    ) => {
        this.getSectionItemByTranslationKey(translationKey, baseKey, saveNewSectionItem).subscribe((sectionItem) => {
            this.selectSectionItem(sectionItem);
        });
    };

    clearSectionItemSelection = () => this._currentSectionItem.next(null);
}
