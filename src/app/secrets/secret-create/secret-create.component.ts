import {Component, OnInit, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SecretsService} from '../secrets.service';
import {Router} from '@angular/router';
import {AMPM, ExpirationMethod, Time, TimeMeasurement} from './expiration';
import {AbsoluteExpirationControls, expirationValidator, RelativeExpirationControls} from './expiration.controls';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'clr-secret-create',
  templateUrl: './secret-create.component.html',
  styleUrls: ['./secret-create.component.css']
})
export class SecretCreateComponent implements OnInit {
  public form: FormGroup;
  public expirationGroup: FormGroup;
  public contentControl: AbstractControl;
  public accessLimitControl: AbstractControl;
  public accessCount: number;
  public disableAccessLimitControl: AbstractControl;

  public gridListColumns: number;
  public dateSelectionColSpan: number;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  get ExpirationMethod() { return ExpirationMethod; }
  get AMPM() { return AMPM; }
  get TimeMeasurement() { return TimeMeasurement; }

  public expirationMethod: AbstractControl;
  public relativeExpirationControls: RelativeExpirationControls;
  public absoluteExpirationControls: AbsoluteExpirationControls;

  public today = new Date();

  errors = {
    access: [],
    content: [],
  };

  validationMessages = {
    content: {
      required: 'Please enter your secret here.',
    },
    method: {
      required: 'Please select a method.',
    },
    access: {
      required: 'Access limit must be greater than zero or disabled.',
      min: 'Access limit must be greater than zero or disabled.',
    },
  };

  public expirationMethods = [
    ExpirationMethod.Absolute,
    ExpirationMethod.Relative,
  ];

  public relativeTimeOptions = [
    TimeMeasurement.Minutes,
    TimeMeasurement.Hours,
  ];

  public ampmOptions = [AMPM.AM, AMPM.PM];

  public timeOptions: string[] = [
    ' 1:00', ' 1:30',
    ' 2:00', ' 2:30',
    ' 3:00', ' 3:30',
    ' 4:00', ' 4:30',
    ' 5:00', ' 5:30',
    ' 6:00', ' 6:30',
    ' 7:00', ' 7:30',
    ' 8:00', ' 8:30',
    ' 9:00', ' 9:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
  ];


  constructor(private fb: FormBuilder,
              private secretsService: SecretsService,
              private router: Router,
              private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.setColumns(window.innerWidth);

    const tomorrow = new Date();
    tomorrow.setHours(24);

    this.expirationGroup = this.fb.group({
      expirationMethod: ['', Validators.required],
      absolute: this.fb.group({
        time: [{value: '12:00', disabled: true}],
        date: [{value: tomorrow, disabled: true}],
        ampm: [{value: AMPM.AM, disabled: true}],
      }, {validators: expirationValidator(AbsoluteExpirationControls)}),
      relative: this.fb.group({
        value: [{value: 24, disabled: false}, [Validators.min(1)]],
        measurement: [{value: TimeMeasurement.Hours, disabled: true}],
      }, {validators: expirationValidator(RelativeExpirationControls)}),
    });

    this.form = this.fb.group({
      content: ['', Validators.required],
      expiration: this.expirationGroup,
      access: this.fb.group({
        accessLimit: [{value: 1, disabled: false}, Validators.min(1)],
        disableAccessLimit: [{value: false, disabled: false}],
      }),
    });

    this.contentControl = this.form.get('content');
    this.configureAccessForm();
    this.configureExpirationForm();
  }

  configureAccessForm(): void {
    this.accessCount = 1;
    this.accessLimitControl = this.form.get('access.accessLimit');
    this.accessLimitControl.valueChanges
      .pipe(debounceTime(Time.Second / 2))
      .subscribe(value => {
        if (this.disableAccessLimitControl.value === false) {
          this.accessCount = value;
          this.setMessage(this.accessLimitControl, 'access');
        }
      });
    this.disableAccessLimitControl = this.form.get('access.disableAccessLimit');
    this.disableAccessLimitControl.valueChanges.subscribe(
      value => {
        if (value === true) {
          this.accessCount = 0;
          this.accessLimitControl.disable();
        } else {
          this.accessCount = this.accessLimitControl.value;
          this.accessLimitControl.enable();
        }
        this.setMessage(this.accessLimitControl, 'access');
      }
    );
  }

  configureExpirationForm(): void {
    this.absoluteExpirationControls =  new AbsoluteExpirationControls(this.expirationGroup.get('absolute') as FormGroup);
    this.relativeExpirationControls = new RelativeExpirationControls(this.expirationGroup.get('relative') as FormGroup);

    this.expirationMethod = this.expirationGroup.get('expirationMethod');
    this.expirationMethod.valueChanges.subscribe(
      value => {
        if (value === ExpirationMethod.Relative) {
          this.absoluteExpirationControls.disable();
          this.relativeExpirationControls.enable();
        } else {
          this.absoluteExpirationControls.enable();
          this.relativeExpirationControls.disable();
        }
      }
    );
  }

  calculateExpiration() {
    switch (this.expirationMethod.value) {
      case ExpirationMethod.Absolute:
        return this.absoluteExpirationControls.getDate();
      case ExpirationMethod.Relative:
        return this.relativeExpirationControls.getDate();
      default:
        console.log(new Error(`Unknown expiration method ${this.expirationMethod}`));
        const date = new Date();
        date.setTime(date.getTime() + 24);
        return date;
    }
  }

  createSecret() {
    if (this.form.valid) {
      const expiration = this.calculateExpiration();
      const content = this.contentControl.value;

      this.secretsService.createSecret(
        content,
        expiration,
        this.accessCount,
      ).subscribe(
        response => {
          this.router.navigate([`secret/${response.id}`]);
        },
        err => {
          console.log(err);
          this.showError('Error creating secret');
        }
      );
    } else {
      this.showErrors();
    }
  }
  protected setMessage(c: AbstractControl, controlKey: string): void {
    this.errors[controlKey] = [];
    if (c.enabled && (c.touched || c.dirty) && c.errors) {
      Object.keys(c.errors).map(key => {
        this.errors[controlKey].push(this.validationMessages[controlKey][key]);
      });
    }
  }

  showErrors() {
    if (this.errors.content.length > 0) {
      this.showError(this.errors.content[0]);
    } else if (this.errors.access. length > 0) {
      this.showError(this.errors.access[0]);
    } else if (this.absoluteExpirationControls.invalid) {
      this.showError(this.absoluteExpirationControls.errors);
    } else if (this.relativeExpirationControls.invalid) {
      this.showError(this.relativeExpirationControls.errors);
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 2000,
    });
  }

  onResize(event) {
    this.setColumns(event.target.innerWidth);
  }

  setColumns(width) {
    this.gridListColumns = width <= 900 ? 2 : 4;
    this.dateSelectionColSpan = this.gridListColumns > 1 ? 2 : 1;
  }
}
