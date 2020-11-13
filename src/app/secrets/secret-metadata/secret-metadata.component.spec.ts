import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SecretMetadataComponent} from './secret-metadata.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {RouterTestingModule} from '@angular/router/testing';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from '../../shared/shared.module';

describe('SecretMetadataComponent', () => {
  let component: SecretMetadataComponent;
  let fixture: ComponentFixture<SecretMetadataComponent>;

  beforeEach(async(() => {
    const secretMetadata = {
      id: 1234,
      access_count: 1,
      access_limit: 10,
      expiration: new Date(),
    };
    TestBed.configureTestingModule({
      declarations: [
        SecretMetadataComponent
      ],
      imports: [
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule,
        MatToolbarModule,
        ClipboardModule,
        HttpClientModule,
        SharedModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({resolvedMetadata: secretMetadata})
          },
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
