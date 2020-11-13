import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SecretCreateComponent} from './secret-create/secret-create.component';
import {RouterModule} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import {SecretMetadataComponent} from './secret-metadata/secret-metadata.component';
import {SecretMetadataResolverService} from './secret-metadata-resolver.service';
import {SecretsService} from './secrets.service';
import {MatCardModule} from '@angular/material/card';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {SecretAccessComponent} from './secret-access/secret-access.component';
import {SharedModule} from '../shared/shared.module';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {DeleteSecretDialogComponent} from './secret-metadata/delete-secret-dialog/delete-secret-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';


@NgModule({
  declarations: [
    SecretCreateComponent,
    SecretMetadataComponent,
    SecretAccessComponent,
    DeleteSecretDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'secret/create', component: SecretCreateComponent,
      }, {
        path: 'secret/:id', component: SecretMetadataComponent,
        resolve: {
          resolvedMetadata: SecretMetadataResolverService,
        },
      }, {
        path: 'secret/:id/access', component: SecretAccessComponent,
      }
    ]),
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatCardModule,
    ClipboardModule,
    SharedModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    RouterModule,
  ],
  providers: [
    SecretsService,
    SecretMetadataResolverService,
  ],
})
export class SecretsModule {
}
