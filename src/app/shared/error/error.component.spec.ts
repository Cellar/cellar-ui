import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';

describe('When rendering error page', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  const configureTestingModule = (errorCode) => async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {paramMap: convertToParamMap({errorId: errorCode})}},
        }
      ],
    }).compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('and error code is 404', () => {
    beforeEach(configureTestingModule('404'));
    beforeEach(createComponent);

    it('header message should display no secrets here', () =>
      expect(fixture.nativeElement.querySelector('#header-message').textContent.toLowerCase()).toContain('no secrets here'));

    it('message should display not found', () =>
      expect(fixture.nativeElement.querySelector('#message').textContent.toLowerCase()).toContain('could not be found'));
  });

  describe('and error code is 500', () => {
    beforeEach(configureTestingModule('500'));
    beforeEach(createComponent);

    it('header message should display server error', () =>
      expect(fixture.nativeElement.querySelector('#header-message').textContent.toLowerCase()).toContain('server error'));

    it('message should request contacting site admin', () =>
      expect(fixture.nativeElement.querySelector('#message').textContent.toLowerCase()).toContain('contact a site administrator'));
  });

  describe('and error code is 401', () => {
    beforeEach(configureTestingModule('401'));
    beforeEach(createComponent);

    it('header message should display authentication error', () =>
      expect(fixture.nativeElement.querySelector('#header-message').textContent.toLowerCase()).toContain('authentication error'));

    it('message show not authorized', () =>
      expect(fixture.nativeElement.querySelector('#message').textContent.toLowerCase()).toContain('not authorized'));
  });

  describe('and error code is 403', () => {
    beforeEach(configureTestingModule('403'));
    beforeEach(createComponent);

    it('header message should display authentication error', () =>
      expect(fixture.nativeElement.querySelector('#header-message').textContent.toLowerCase()).toContain('authentication error'));

    it('message show not authorized', () =>
      expect(fixture.nativeElement.querySelector('#message').textContent.toLowerCase()).toContain('not authorized'));
  });

  describe('and error code is unknown', () => {
    beforeEach(configureTestingModule('999'));
    beforeEach(createComponent);

    it('header message should display unexpected error', () =>
      expect(fixture.nativeElement.querySelector('#header-message').textContent.toLowerCase()).toContain('unexpected error'));

    it('message show unexpected error', () =>
      expect(fixture.nativeElement.querySelector('#message').textContent.toLowerCase()).toContain('unexpected error'));
  });
});
