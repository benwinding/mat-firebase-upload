import { ControlValueAccessor, FormControl, Validator } from '@angular/forms';
import { Subject } from 'rxjs';
import { OnDestroy, OnInit, Input } from '@angular/core';
import { takeUntil, auditTime } from 'rxjs/operators';
import { ConvertToTitleCase } from './utils/case-helper';
import { v4 as uuidv4 } from 'uuid';
import { SimpleLogger } from './utils/simple-logger';

export class FormBase<T>
  implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  internalControl: FormControl = new FormControl();
  autoCompleteObscureName: string;
  _destroyed = new Subject();

  disabled = false;
  validationError: string;

  _value: T;

  @Input()
  formControlName: string;
  @Input()
  placeholder: string;
  @Input()
  debug: boolean;

  logger: SimpleLogger;

  constructor() {
    // Garrentee that init and destroy are called
    // even if ngOnInit() or ngOnDestroy() are overriden
    const originalOnDestroy = this.ngOnDestroy;
    this.ngOnDestroy = () => {
      this.destroy();
      originalOnDestroy.apply(this);
    };
    const originalOnInit = this.ngOnInit;
    this.ngOnInit = () => {
      this.init();
      originalOnInit.apply(this);
    };
  }

  // These will most likely be overriden
  ngOnInit() {}
  ngOnDestroy() {}

  init() {
    this.logger = new SimpleLogger(this.debug, '[form-base-class]');
    this._destroyed.next();
    this.autoCompleteObscureName = uuidv4();
    this.internalControl.valueChanges
      .pipe(takeUntil(this._destroyed))
      .pipe(auditTime(100))
      .subscribe((value) => {
        this._value = value;
        console.log('internalControl.valueChanges()', {value});
        this.onChange(this._value);
        this.onTouched();
        // console.log('form-base-class: valueChanges', {val: this._value});
      });

    if (!this.placeholder) {
      const nameParsed = ConvertToTitleCase(this.formControlName + '');
      this.placeholder = nameParsed;
    }
  }

  destroy() {
    this._destroyed.next();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (this.debug) {
      console.log('this.set value()', {value});
    }
    this._value = value;
    this.internalControl.setValue(value, { emitEvent: true });
  }

  writeValue(value: any): void {
    this.value = value;
  }

  propagateOnChange: any = () => {};
  registerOnChange(fn: any): void {
    this.propagateOnChange = fn;
  }

  onTouched: any = () => {};
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    setTimeout(() => {
      if (isDisabled) {
        this.internalControl.disable();
      } else {
        this.internalControl.enable();
      }
    });
  }

  public validate(c: FormControl) {
    const errors = c.errors;
    const value = c.value;
    // console.log('form-base-class: validate()', { errors, value });
    this.internalControl.setValidators(c.validator);
    return !this.validationError
      ? null
      : {
          validationError: {
            valid: false
          }
        };
  }

  private onChange(inputValue) {
    this.validationError = this.CheckValueIsValid();
    if (this.validationError) {
      this.propagateOnChange(this.value);
    } else {
      this.propagateOnChange(inputValue);
    }
  }

  CheckValueIsValid(): string {
    return null;
  }
}
