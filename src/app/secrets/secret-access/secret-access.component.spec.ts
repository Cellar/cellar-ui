import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretAccessComponent } from './secret-access.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatCardModule} from '@angular/material/card';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatInputModule} from '@angular/material/input';
import {SharedModule} from '../../shared/shared.module';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {SecretsService} from '../secrets.service';
import {of, throwError} from 'rxjs';
import {ISecret} from '../secret';

describe('SecretAccessComponent', () => {
  describe('When secret is found', () => {
    let component: SecretAccessComponent;
    let fixture: ComponentFixture<SecretAccessComponent>;
    let mockSecretsService;
    const secret: ISecret = {
      id: '248',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin arcu risus, sagittis ornare massa nec, ' +
        'facilisis suscipit elit. Etiam sagittis urna diam. Duis id cursus augue. Donec iaculis lacus a eros convallis, vel pellentesque ' +
        'ligula rhoncus. Proin congue interdum nisl eu consequat. Vivamus laoreet ex vel porta semper. Morbi tempus metus eget felis ' +
        'semper, at fermentum erat finibus. Etiam tincidunt ligula vulputate imperdiet commodo. Nunc eu tempus mauris. Mauris feugiat in ' +
        'turpis eget ultricies.'
    };

    beforeEach(async(() => {
      mockSecretsService = jasmine.createSpyObj(['accessSecret']);
      mockSecretsService.accessSecret.and.returnValue(of(secret));

      TestBed.configureTestingModule({
        declarations: [SecretAccessComponent],
        imports: [
          RouterTestingModule,
          MatCardModule,
          MatInputModule,
          MatSnackBarModule,
          MatToolbarModule,
          ClipboardModule,
          SharedModule,
          HttpClientTestingModule,
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {snapshot: {paramMap: convertToParamMap({id: secret.id})}},
          },
          {
            provide: SecretsService,
            useValue: mockSecretsService,
          }
        ],
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SecretAccessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should render secret content in text area in card', () =>
      expect(fixture.nativeElement.querySelector('mat-card-content textarea#secret-content').textContent).toContain(secret.content));
  });

  describe('when secret is not found', () => {
    let component: SecretAccessComponent;
    let fixture: ComponentFixture<SecretAccessComponent>;
    let mockSecretsService;
    let mockRouter;

    beforeEach(async(() => {
      mockSecretsService = jasmine.createSpyObj(['accessSecret']);
      mockSecretsService.accessSecret.and.returnValue(throwError({status: 404}));

      mockRouter = jasmine.createSpyObj(['navigate']);

      TestBed.configureTestingModule({
        declarations: [SecretAccessComponent],
        imports: [
          RouterTestingModule,
          MatCardModule,
          MatInputModule,
          MatSnackBarModule,
          MatToolbarModule,
          ClipboardModule,
          SharedModule,
          HttpClientTestingModule,
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {snapshot: {paramMap: convertToParamMap({id: 691})}},
          },
          {
            provide: SecretsService,
            useValue: mockSecretsService,
          },
          {
            provide: Router,
            useValue: mockRouter,
          }
        ],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SecretAccessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should redirect to error page', () => {
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/error', 404]);
    });
  });
});
