import { Component} from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'tab-set',
  template: `
 <style type="text/css">
  .hide-tab { display: none }
  .show-tab { display: inline }
</style>
    <ul class="nav nav-tabs">
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active" [ngClass]="tab.className">
        <a style="cursor:pointer" >{{tab.title}}</a>
      </li>
    </ul>
    <ng-content></ng-content>
  `,
  directives: [],
  // <button type="button" class="btn btn-info btn-raised" (click)="deactivateAllTabsandActiveSelectedTab(2)">Select third tab</button>
})

export class TabSet {
  tabs: Tab[];

  constructor() {
    this.tabs = [];
  }

  selectTab(tab) {
    _deactivateAllTabs(this.tabs);
    tab.active = true;
    function _deactivateAllTabs(tabs: Tab[]) {
      tabs.forEach(tab => tab.active = false);
    }
  }

  //navigate from create team menu to team details tab for creating.
  navigatetocreateteamtab() {
    _deactivateAllTabs(this.tabs);
    // this.tabs[1].active = 'true';
    function _deactivateAllTabs(tabs: Tab[]) {
      // tabs.forEach(tab => tab.active = false);
      tabs.forEach(tab => {
        if (tab.active == false)
          tab.active = true;
        else
          tab.active = false;
      });
    }
  }

  //Assigning the Active class for selected tabs
  deactivateAllTabsandActiveSelectedTab(tabname) {
    this.tabs.forEach(tab => {
      if (tab.name == tabname)
        tab.active = true;
      else
        tab.active = false;
    });
  }

  /**
   * function to deactive the unchecked tab 
   */
  deactiveselectedTab(tabname, tabclass) {
    this.tabs.forEach(tab => {
      if (tab.name == tabname)
        tab.className = tabclass;
      if (tab.className == tabclass) {
        tab.displaytabdiv = tabclass;
      }
    });
  }

  addTab(tab: Tab) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }
    this.tabs.push(tab);
  }

}
