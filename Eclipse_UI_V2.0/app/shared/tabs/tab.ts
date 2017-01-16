import { Component } from '@angular/core';
import {TabSet} from './tabset'

@Component({
    selector: 'tab',
    inputs: ['name:tabName', 'title:tabTitle', 'active', 'className','displaytabdiv'],
    styles: [`.pane{padding: 1em;}
    .hide-tab  {visibility: hidden;}
    .show-tab {visibility: visible;}`],
    template: `
    <div [hidden]="!active" [ngClass]="displaytabdiv">
      <ng-content></ng-content>
    </div>
  `
})

export class Tab {
    title: string;
    active = this.active || false;
    name: string;
    displaytabdiv: string;
    className: string;

    constructor(_tabset: TabSet) {
        _tabset.addTab(this);
    }
}