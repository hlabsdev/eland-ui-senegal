import { Component, Input, OnInit } from '@angular/core';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { SelectItem } from 'primeng/api';
import { WarningResult } from '@app/core/utils/models/warningResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { RegistryService } from '@app/core/services/registry.service';
import * as _ from 'lodash';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';

@Component({
    selector: 'app-baunit-create',
    templateUrl: 'createBaunit.component.html',
})
export class CreateBaunitComponent implements OnInit {
    // add title to the form
    selectedValue;
    formVariables = {};
    @Input() baUnit: BAUnit = new BAUnit();
    baUnitDistricts = [];
    baUnitTypes;
    caveatWarningMessage;

    constructor(
        private utilService: UtilService,
        private codeListService: CodeListService,
        private registryService: RegistryService,
    ) {}

    ngOnInit(): void {
        this.utilService
            .mapToSelectItems(
                this.codeListService.getCodeLists({ type: CodeListTypes.BA_UNIT_TYPE }),
                'CODELIST.VALUES',
                'value.value',
            )
            .subscribe((baUnitTypes: SelectItem[]) => {
                this.baUnitTypes = baUnitTypes;
            });

        this.utilService
            .mapToSelectItems(this.registryService.getRegistries(), '', 'value.code')
            .subscribe((registries: SelectItem[]) => {
                this.baUnitDistricts = registries;
            });

        if (this.baUnit && this.baUnit.registryRecord) {
            this.validateTitleNumber();
        }
        this.caveatWarningMessage = new WarningResult('MESSAGES.BA_UNIT_HAS_CAVEATS_WARNING').toMessage();
    }

    validateTitleNumber() {
        // if (this.baUnit.registry.titleId) {
        //   _.delay(() => {
        //     if (this.baUnit.registry.titleId.length < 6) {
        //       this.baUnit.registry.titleId = this.baUnit.registry.titleId.padStart(6, '0');
        //     }
        //   }, 200);
        // }
        // if (this.baUnit.registry.oldTitleId) {
        //   _.delay(() => {
        //     if (this.baUnit.registry.oldTitleId.length < 6) {
        //       this.baUnit.registry.oldTitleId = this.baUnit.registry.oldTitleId.padStart(6, '0');
        //     }
        //   }, 200);
        // }
    }
}
