import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import { AppComponent } from './app.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterTestingModule} from '@angular/router/testing';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        RouterTestingModule,
        MatToolbarModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  it('should create the app', () => expect(app).toBeTruthy());

  it(`should have as title 'cellar-ui'`, () => expect(app.title).toEqual('cellar-ui'));

  it('should render title on nav bar', () =>
    expect(fixture.nativeElement.querySelector('#nav-bar>#title').textContent).toContain('Cellar'));

  it('should render logo on nav bar', () =>
    expect(fixture.nativeElement.querySelector('#nav-bar>#logo').textContent).not.toBeNull());

  it('should render create button on nav bar', () =>
    expect(fixture.nativeElement.querySelector('#nav-bar>button#new-secret').textContent).not.toBeNull());
});
