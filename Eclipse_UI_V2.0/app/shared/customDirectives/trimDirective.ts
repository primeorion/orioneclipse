import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";


@Directive({
  selector: '[trimText]'
})

export class TrimDirective implements OnInit{
    
  private el: HTMLInputElement;
  
  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }
  
  ngOnInit() {
    if(this.el.value != undefined){
      this.el.value = this.el.value.trim();  
    }
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    if(value != undefined){
      this.el.value = this.el.value.trim();  
    }
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    if(value != undefined){
      this.el.value = this.el.value.trim();  
    }
  }
  
  @HostListener("change", ["$event.target.value"])
  onChange(value) {
    if(value != undefined){
      this.el.value = this.el.value.trim();  
    }
  }
}