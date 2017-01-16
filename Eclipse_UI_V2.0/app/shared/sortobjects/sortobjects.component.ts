import { Component, Input } from '@angular/core';
import { SortPipe } from '../../pipes/FilterPipe';

@Component({
    selector: 'sortobjects-component',
    templateUrl: './app/shared/sortobjects/sortobjects.component.html'
})

export class SortObjectsComponent {
    @Input() model: any;
    @Input() displaypermission: string;
}
