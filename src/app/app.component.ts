import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { defaultLocale } from './core/utils/locale.constants';
import { CoreService } from './core/core.service';
import { DataService } from './data/data.service';
import { TranslationRepository } from '@app/translation/translation.repository';
import { FormsRepository } from '@app/forms.repository';
import { Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewChecked {
    title = 'app';
    logged = false;
    activeTopbarItem: Element;
    topbarMenuButtonClick: boolean;
    topbarMenuActive: boolean;
    loginPage = false;

    constructor(
        private translate: TranslateService,
        private formsRepo: FormsRepository,
        private dataService: DataService,
        translationRepo: TranslationRepository,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private config: PrimeNGConfig
    ) {
        // change this default locale by a defaullt comming from application config
        translate.setDefaultLang(defaultLocale);
        translate.use(defaultLocale);
        dataService.loadRepositories([translationRepo, formsRepo]);
    }

    ngOnInit() {
        this.logged = true;
        this.config.setTranslation({
            "startsWith": "Commence par",
            "contains": "Contient",
            "notContains": "Ne contient pas",
            "endsWith": "Se termine pas",
            "equals": "Égale à",
            "notEquals": "Pas égale",
            "noFilter": "Aucun filtre",
            "lt": "Moins de",
            "lte": "Inférieur ou égal à",
            "gt": "Supérieur à",
            "gte": "Supérieur ou égal à",
            "is": "Est",
            "isNot": "N'est pas",
            "before": "Avant",
            "after": "Après",
            "dateIs": "La date est",
            "dateIsNot": "La date n'est pas",
            "dateBefore": "La date est antérieure",
            "dateAfter": "La date est postérieure",
            "clear": "Effacer",
            "apply": "Appliquer",
            "matchAll": "Tout correspondre",
            "matchAny": "Correspond à n'importe quel",
            "addRule": "Ajouter une règle",
            "removeRule": "Supprimer la règle",
            "accept": "Oui",
            "reject": "Non",
            "choose": "Choisir",
            "upload": "Importer",
            "cancel": "Annuler",
            "dayNames": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
            "dayNamesShort": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            "dayNamesMin": ["Di","Lun","Ma","Me","Je","Ven","Sa"],
            "monthNames": ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre"," Décembre"], 
            "monthNamesShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", " Déc"],
            "dateFormat": "dd/mm/yy",
            "today": "AUjourd'hui",
            "weekHeader": "Wk",
            "weak": 'Faible',
            "medium": 'Moyen',
            "strong": 'Fort',
            "passwordPrompt": 'Entrer un mot de passe',
            "emptyMessage": 'Aucun résultat trouvé',
            "emptyFilterMessage": 'Aucun résultat trouvé'
        });
    }

    ngAfterViewChecked(): void {
        if (
            this.router.url === '/login' ||
            this.router.url.includes('/login') ||
            this.router.url === '/register' ||
            this.router.url === '/forgot-password'||
            this.router.url === '/404'
        ) {
            this.loginPage = true;
            this.changeDetectorRef.detectChanges();
        } else {
            this.loginPage = false;
        }
    }

    onResize(event) {
        CoreService.screenSize = {
            width: event.target.innerWidth,
            height: event.target.innerHeight,
        };
    }

    onTopbarItemClick(event: Event, item: Element) {
        this.topbarMenuButtonClick = true;
        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item;
        }
        event.preventDefault();
    }

    onTopbarMenuButtonClick(event: Event) {
        this.topbarMenuButtonClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;
        event.preventDefault();
    }
}
