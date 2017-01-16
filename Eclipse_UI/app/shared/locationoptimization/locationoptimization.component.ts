import { Component, Input } from '@angular/core';
import { ILocationOptimization, ILocationSettings } from '../../models/Preferences/locationOptimization';
import { ISubClass } from '../../models/subClass';
import { SecurityService } from '../../services/security.service';
import { Response } from '@angular/http';

@Component({
    selector: 'location-optimization',
    templateUrl: './app/shared/locationoptimization/locationoptimization.component.html',
    providers: [SecurityService]
})

export class LocationOptimizationComponent {
    @Input() displaypermission: string;
    @Input() dataSource: any[] = [];
    subClassesData: ISubClass[];
    selectedModel: ILocationOptimization;
    optimizations: any[] = [{ "id": 1, "value": "1" }, { "id": 2, "value": "2" }, { "id": 3, "value": "3" }, { "id": 4, "value": "Never" }];
    errMesage: boolean = false;
    errorMessage: string = '';

    constructor(private _securityService: SecurityService) {
        this.intilizeProperties();
    }

    /**Intilize properties */
    intilizeProperties() {
        this.selectedModel = <ILocationOptimization>{};
        this.selectedModel.buySetting = <ILocationSettings>{};
        this.selectedModel.sellSetting = <ILocationSettings>{};
        this.selectedModel.id = 0;
    }


    ngOnInit() {
        this.loadSubClasses();
    }


    /**Load SubClass DropDown */
    loadSubClasses() {        
        this._securityService.getSubClassData()
            .map((response: Response) => response.json())
            .subscribe(model => {
                this.subClassesData = model.filter(a => a.isDeleted == 0);
                this.refreshControls();
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**Add Optimizations into the datasource container */
    addOptimizations() {
        if (this.selectedModel.id != undefined && this.selectedModel.id != 0 && this.selectedModel.buySetting.T != undefined && this.selectedModel.buySetting.TD != undefined && this.selectedModel.buySetting.TE != undefined && this.selectedModel.sellSetting.T != undefined && this.selectedModel.sellSetting.TD != undefined && this.selectedModel.sellSetting.TE != undefined) {
            this.selectedModel.name = this.subClassesData.filter(a => a.id == this.selectedModel.id)[0].name;
            this.dataSource.push(this.selectedModel);
            this.refreshControls();

        } else { this.errMesage = true }
    }

    /**clear records after add and also filter records */
    refreshControls() {
        if (this.dataSource != null) {
            this.dataSource.forEach(element => {
                this.subClassesData = this.subClassesData.filter(record => record.id != parseInt(element.id));
            });
        }
        this.intilizeProperties();
    }

    rebindControls(dataSourceObject) {
        this.dataSource = Object.values(dataSourceObject);
        if (this.dataSource != null) {
            this.dataSource.forEach(element => {
                this.subClassesData = this.subClassesData.filter(record => record.id != parseInt(element.id));
            });
        }
        this.intilizeProperties();
    }
    /**delete optimizations and loads the subclasses dropdown */
    deleteOptimizations(selectedItem) {
        this.dataSource.splice(this.dataSource.findIndex(x => x.id == selectedItem), 1);
        this.loadSubClasses();
    }

    /**show/hide error message flag */
    toggleFlag() {
        this.errMesage = false;
    }

    getSelectValue(id: number) {
        let filtlerdList = this.optimizations.find(x => x.id == id);
        return filtlerdList.value;
    }
}
