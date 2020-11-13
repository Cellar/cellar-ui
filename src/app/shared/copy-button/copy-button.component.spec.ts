import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyButtonComponent } from './copy-button.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ClipboardModule} from '@angular/cdk/clipboard';

describe('CopyButtonComponent', () => {
  let component: CopyButtonComponent;
  let fixture: ComponentFixture<CopyButtonComponent>;
  let mockSnackBar;
  const copyValue = 'copy value' +  Math.random().toString(36).substr(2, 8);
  const buttonText = 'button' +  Math.random().toString(36).substr(2, 8);
  const alertText = 'alert' +  Math.random().toString(36).substr(2, 8);

  beforeEach(async(() => {
    mockSnackBar = jasmine.createSpyObj(['open']);
    TestBed.configureTestingModule({
      declarations: [ CopyButtonComponent ],
      imports: [
        MatSnackBarModule,
        ClipboardModule,
      ],
      providers: [
        {
          provide: MatSnackBar,
          useValue: mockSnackBar,
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyButtonComponent);
    component = fixture.componentInstance;
    component.copyButtonText = buttonText;
    component.copyAlertText = alertText;
    component.copyValue = copyValue;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render button', () => {
    const btn = fixture.nativeElement.querySelector('#copy-button');
    const actual = btn.textContent;
    expect(actual).toContain(buttonText);
  });

  describe('when clicking the button', () => {
    it('should open a snackbar', () => {
      const btn = fixture.nativeElement.querySelector('#copy-button');
      btn.click();
      expect(mockSnackBar.open).toHaveBeenCalledTimes(1);
    });
    it('should call correct message', () => {
      const btn = fixture.nativeElement.querySelector('#copy-button');
      btn.click();
      expect(mockSnackBar.open).toHaveBeenCalledWith(alertText, jasmine.any(String), jasmine.anything());
    });
  });
});
