import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';
import {Time} from './expiration';
import {TimeMeasurement} from './expiration';
import {debounceTime} from 'rxjs/operators';

export function expirationValidator(type: (new (g: FormGroup) => ExpirationControls)): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    const controls = new type(c as FormGroup);
    if (controls.pristine) {
      return null;
    }

    const now = new Date();
    now.setSeconds(0, 0);
    const selected = controls.getDate();
    if (selected == null) {
      return {required: true};
    }

    const difference = selected.getTime() - now.getTime();

    if (now >= selected) {
      return {past: true};
    } else if (difference < (Time.Minute * 15)) {
      return {short: true};
    }

    return null;
  };
}

abstract class ExpirationControls {
  abstract pristine: boolean;
  formGroup: FormGroup;

  errors: string;

  validationMessages = {
    required: 'Expiration is required',
    past: 'Expiration must be at least 15 minutes in the future.',
    short: 'Expiration must be at least 15 minutes in the future.',
  };

  public get invalid(): boolean {
    return this.formGroup.invalid;
  }

  protected constructor(formGroup: FormGroup) {
    this.formGroup = formGroup;
  }

  protected setMessage(c: AbstractControl): void {
    this.errors = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.errors = Object.keys(c.errors).map(key =>
        this.validationMessages[key]).join(' ');
    }
  }

  abstract enable(): void;
  abstract disable(): void;

  abstract getDate(): Date | null;
}

export class RelativeExpirationControls extends ExpirationControls {
  value: AbstractControl;
  measurement: AbstractControl;

  constructor(group: FormGroup) {
    super(group);
    this.value = group.get('value');
    this.measurement = group.get('measurement');

    this.value.valueChanges.pipe(debounceTime(Time.Second / 2)).subscribe(_ => this.setMessage(this.formGroup));
    this.measurement.valueChanges.pipe(debounceTime(Time.Second / 2)).subscribe(_ => this.setMessage(this.formGroup));
  }

  public getDate(): Date | null {
    const date = new Date();
    if (this.value.value == null) {
      return null;
    }
    switch (this.measurement.value) {
      case TimeMeasurement.Hours:
        date.setHours(date.getHours() + this.value.value, date.getMinutes(), 0);
        break;
      case TimeMeasurement.Minutes:
        date.setHours(date.getHours(), date.getMinutes() + this.value.value, 0);
        break;
      default:
        console.log(new Error(`Unknown expiration method ${this.measurement.value}`));
    }

    return date;
  }

  public get pristine(): boolean {
    return this.value.pristine && this.measurement.pristine;
  }

  public enable(): void {
    this.measurement.enable();
    this.value.enable();
  }

  public disable(): void {
    this.measurement.disable();
    this.value.disable();
  }
}

export class AbsoluteExpirationControls extends ExpirationControls {
  date: AbstractControl;
  time: AbstractControl;
  ampm: AbstractControl;

  constructor(group: FormGroup) {
    super(group);
    this.date = group.get('date');
    this.time = group.get('time');
    this.ampm = group.get('ampm');

    this.date.valueChanges.pipe(debounceTime(Time.Second / 2)).subscribe(_ => this.setMessage(this.formGroup));
    this.time.valueChanges.pipe(debounceTime(Time.Second / 2)).subscribe(_ => this.setMessage(this.formGroup));
    this.ampm.valueChanges.pipe(debounceTime(Time.Second / 2)).subscribe(_ => this.setMessage(this.formGroup));
  }

  public getDate(): Date | null {
    const date = this.date.value;
    if (date == null) {
      return null;
    }
    const [hour, minute] = Time.fromString(this.time.value);

    if (this.ampm.value === 'PM') {
      date.setHours(hour + 12, minute, 0);
    } else {
      date.setHours(hour, minute, 0);
    }
    return date;
  }

  public get pristine(): boolean {
    return this.date.pristine && (this.time.pristine && this.ampm.pristine);
  }

  public enable(): void {
    this.date.enable();
    this.time.enable();
    this.ampm.enable();
  }

  public disable(): void {
    this.date.disable();
    this.time.disable();
    this.ampm.disable();
  }
}

