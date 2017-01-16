import { Component, HostBinding, Input, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm } from '@angular/forms';
import { isBlank } from '@angular/common/src/facade/lang';

const KEYS = {
  backspace: 8,
  comma: 188,
  enter: 13,
  space: 32
};

@Component({
  selector: 'rl-tag-input',
  templateUrl: './app/shared/tags/tag-input.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagInputComponent), multi: true },
  ]
})
export class TagInputComponent implements ControlValueAccessor, OnInit {
  @Input() addOnBlur: boolean = true;
  @Input() addOnComma: boolean = true;
  @Input() addOnEnter: boolean = true;
  @Input() addOnPaste: boolean = true;
  @Input() addOnSpace: boolean = false;
  @Input() allowedTagsPattern: RegExp = /.+/;
  @Input() ngModel: any[] = [];
  @Input() pasteSplitPattern: string = ',';
  @Input() placeholder: string = 'Add a tag';
  @HostBinding('class.ng2-tag-input-focus') isFocused;
  @ViewChild('tagInputForm') tagInputForm: NgForm;

  public tagsList: string[] = [];
  public inputValue: string = '';
  public selectedTag: number;
  private splitRegExp: RegExp;

  constructor() { }

  ngOnInit() {
    if (this.ngModel.length > 0) { this.tagsList = this.ngModel; }
    this.onChange(this.tagsList);
    this.splitRegExp = new RegExp(this.pasteSplitPattern);
  }

  inputChanged(event: KeyboardEvent): void {
    let key = event.keyCode;
    switch (key) {
      case KEYS.backspace:
        this._handleBackspace();
        break;

      case KEYS.enter:
        if (this.addOnEnter) {
          if (this.inputValue.trim().length > 0) {
            this._addTags([this.inputValue]);
            event.preventDefault();
          }
        }
        break;

      case KEYS.comma:
        if (this.addOnComma) {
          if (this.inputValue.trim().length > 0) {
            this._addTags([this.inputValue]);
            event.preventDefault();
          }
        }
        break;

      case KEYS.space:
        if (this.addOnSpace) {
          if (this.inputValue.trim().length > 0) {
            this._addTags([this.inputValue]);
            event.preventDefault();
          }
        }
        break;

      default:
        break;
    }
  }

  inputBlurred(event): void {
    if (this.addOnBlur) { this._addTags([this.inputValue]); }
    this.isFocused = false;
  }

  inputFocused(event): void {
    this.isFocused = true;
  }

  inputPaste(event): void {
    let clipboardData = event.clipboardData || (event.originalEvent && event.originalEvent.clipboardData);
    let pastedString = clipboardData.getData('text/plain');
    let tags = this._splitString(pastedString);
    let tagsToAdd = tags.filter((tag) => this._isTagValid(tag));
    this._addTags(tagsToAdd);
    setTimeout(() => this._resetInput());
  }

  private _splitString(tagString: string): string[] {
    tagString = tagString.trim();
    let tags = tagString.split(this.splitRegExp);
    return tags.filter((tag) => !!tag);
  }

  private _isTagValid(tagString: string): boolean {
    return this.allowedTagsPattern.test(tagString);
  }

  private _addTags(tags: string[]): void {
    let validTags = tags.filter((tag) => this._isTagValid(tag));
    this.tagsList = this.tagsList.concat(validTags.map(tag => tag.trim()));
    this._resetSelected();
    this._resetInput();
    this.onChange(this.tagsList);
  }

  private _removeTag(tagIndexToRemove: number): void {
    this.tagsList.splice(tagIndexToRemove, 1);
    this._resetSelected();
    this.onChange(this.tagsList);
  }

  private _handleBackspace(): void {
    if (!this.inputValue.length && this.tagsList.length) {
      //if (!isBlank(this.selectedTag)) {
      if (this.selectedTag) {
        this._removeTag(this.selectedTag);
      } else {
        this.selectedTag = this.tagsList.length - 1;
      }
    }
  }

  private _resetSelected(): void {
    this.selectedTag = null;
  }

  private _resetInput(): void {
    this.tagInputForm.controls['tagInputField'].setValue('');
  }

  /** Implemented as part of ControlValueAccessor. */
  onChange: (value) => any = () => {
  };

  onTouched: () => any = () => { };

  writeValue(value: any) { }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
  setTagList(tagObj: any[]) {
    this.ngModel = tagObj;
    this.tagsList = this.ngModel;
    this.onChange(this.tagsList);
    this.splitRegExp = new RegExp(this.pasteSplitPattern);
  }
}