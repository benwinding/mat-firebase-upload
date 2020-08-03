import { ControlValueAccessor, FormControl, Validator } from "@angular/forms";
import { Subject } from "rxjs";
import { OnDestroy, OnInit, Input } from "@angular/core";
import { takeUntil, auditTime, take } from "rxjs/operators";
import { ConvertToTitleCase } from "./utils/case-helper";
import { v4 as uuidv4 } from "uuid";
import { SimpleLogger } from "./utils/simple-logger";

export class FormBase<T>
  implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  internalControl: FormControl = new FormControl();
  autoCompleteObscureName: string;

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

  $nginit = new Subject();
  $ngdestroy = new Subject();
  _destroyed = new Subject();

  constructor() {
    this.$nginit.pipe(take(1)).subscribe(() => this._init());
    this.$ngdestroy.pipe(take(1)).subscribe(() => this._destroy());
  }

  ngOnInit() {
    this.$nginit.next();
  }

  ngOnDestroy() {
    this.$ngdestroy.next();
  }

  private _init() {
    this.logger = new SimpleLogger(this.debug, "[form-base-class]");
    this.autoCompleteObscureName = uuidv4();
    this.internalControl.valueChanges
      .pipe(takeUntil(this._destroyed))
      .pipe(auditTime(100))
      .subscribe((value) => {
        this._value = value;
        this.logger.log("internalControl.valueChanges()", { value });
        this.onChange(this._value);
        this.onTouched();
      });

    if (!this.placeholder) {
      const nameParsed = ConvertToTitleCase(this.formControlName + "");
      this.placeholder = nameParsed;
    }
  }

  private _destroy() {
    this._destroyed.next();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this.logger.log("this.set value()", { value });
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
    this.logger.log("form-base-class: validate()", { errors, value });
    this.internalControl.setValidators(c.validator);
    return !this.validationError
      ? null
      : {
          validationError: {
            valid: false,
          },
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
