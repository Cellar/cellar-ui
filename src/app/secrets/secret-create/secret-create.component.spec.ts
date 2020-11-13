import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MatToolbarModule} from '@angular/material/toolbar';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {SecretCreateComponent} from './secret-create.component';
import {AMPM, ExpirationMethod, TimeMeasurement} from './expiration';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {SharedModule} from '../../shared/shared.module';

describe('SecretCreateComponent', () => {
  let component: SecretCreateComponent;
  let fixture: ComponentFixture<SecretCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecretCreateComponent ],
      imports: [
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatGridListModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when calculating expiration', () => {

    describe('and method is absolute', () => {
      let expectedDate: Date;

      beforeEach(() => {
        component.expirationMethod.setValue(ExpirationMethod.Absolute);
        expectedDate = new Date();
        expectedDate.setHours(27, 30);

        component.absoluteExpirationControls
          .date
          .setValue(new Date(expectedDate));

        component.absoluteExpirationControls
          .time
          .setValue('3:30');
      });

      it('should return correct date', () => {
        const actualDate = component.calculateExpiration();
        actualDate.setTime(0);
        expectedDate.setTime(0);
        const expected = expectedDate.getTime();
        const actual = actualDate.getTime();
        expect(actual).toBe(expected);
      });

      it('should return correct am hour', () => {
        component.absoluteExpirationControls
          .ampm
          .setValue(AMPM.AM);

        const expected = expectedDate.getHours();
        const actual = component.calculateExpiration().getHours();
        expect(actual).toBe(expected);
      });

      it('should return correct pm hour', () => {
        component.absoluteExpirationControls
          .ampm
          .setValue(AMPM.PM);

        const actualDate = component.calculateExpiration();
        const expected = expectedDate.getHours() + 12;
        const actual = actualDate.getHours();
        expect(actual).toBe(expected);
      });

      it('should return correct minutes', () => {
        const expected = expectedDate.getMinutes();
        const actual = component.calculateExpiration().getMinutes();
        expect(actual).toBe(expected);
      });
    });

    describe('and method is relative', () => {
      let expectedDate: Date;
      let actualDate: Date;

      beforeEach(() => {
        component.expirationMethod.setValue(ExpirationMethod.Relative);

        component.relativeExpirationControls
          .value
          .setValue(36);

        component.relativeExpirationControls
          .measurement
          .setValue(TimeMeasurement.Hours);

        expectedDate = new Date();
        expectedDate.setHours(expectedDate.getHours() + 36);

        actualDate = component.calculateExpiration();
      });

      it('should return correct date', () => {
        actualDate.setTime(0);
        expectedDate.setTime(0);
        const expected = expectedDate.getTime();
        const actual = actualDate.getTime();
        expect(actual).toBe(expected);
      });

      it('should return correct', () => {
        const expected = expectedDate.getHours();
        const actual = component.calculateExpiration().getHours();
        expect(actual).toBe(expected);
      });

      it('should return correct minutes', () => {
        const expected = expectedDate.getMinutes();
        const actual = component.calculateExpiration().getMinutes();
        expect(actual).toBe(expected);
      });
    });

  });
});
