import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSecretDialogComponent } from './delete-secret-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {MatDialogModule} from '@angular/material/dialog';

describe('DeleteSecretDialogComponent', () => {
  let component: DeleteSecretDialogComponent;
  let fixture: ComponentFixture<DeleteSecretDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSecretDialogComponent ],
      imports: [
        MatDialogModule,
        SharedModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSecretDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
