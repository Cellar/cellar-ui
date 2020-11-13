import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import {MatToolbarModule} from '@angular/material/toolbar';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  const leftText = 'left text ' + Math.random().toString(36).substr(2, 5);
  const rightText = Math.random().toString(36).substr(2, 8).repeat(8);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      imports: [MatToolbarModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    component.leftText = leftText;
    component.rightText = rightText;
    (window as any).innerWidth = 1920;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render left text', () => {
    const actual = fixture.nativeElement.querySelector('#left-text').textContent;
    expect(actual).toContain(leftText);
  });

  it('should render right text', () => {
    const actual = fixture.nativeElement.querySelector('#right-text').textContent;
    expect(actual).toContain(rightText);
  });

  describe('when setting right text to display', () => {

    const digitTest = (width, digits) => {
      let expected = rightText.substr(0, digits);
      if (digits < rightText.length) {
        expected += '...';
      }
      component.setRightText(width);
      expect(component.rightTextDisplay).toBe(expected);
    };

    it('should set no digits for width less than 300', () => digitTest(299, 0));
    it('should set 8 digits for width of 300', () => digitTest(300, 8));
    it('should set 16 digits for width of 400', () => digitTest(400, 16));
    it('should set 24 digits for width of 500', () => digitTest(500, 24));
    it('should set 32 digits for width of 600', () => digitTest(600, 32));
    it('should set 40 digits for width of 700', () => digitTest(700, 40));
    it('should set 48 digits for width of 800', () => digitTest(800, 48));
    it('should set 56 digits for width of 900', () => digitTest(900, 56));
    it('should set 64 digits for width of 1000', () => digitTest(1000, 64));
    it('should set 64 digits for width greater than 1000', () => digitTest(1800, 64));
  });
});
