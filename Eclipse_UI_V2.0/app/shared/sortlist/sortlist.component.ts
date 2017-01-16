import { Component, Input } from '@angular/core';

@Component({
    selector: 'sortlist-component',   
    templateUrl: './app/shared/sortlist/sortlist.component.html',
})

export class SortListComponent {
    @Input() model: Array<string>;
}
