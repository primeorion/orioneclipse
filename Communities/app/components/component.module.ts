import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import{componentRouting} from './component.routing'
import { FormsModule } from '@angular/forms';
@NgModule({ 
  imports :[FormsModule,CommonModule,componentRouting],
})

export class ComponentModule { }