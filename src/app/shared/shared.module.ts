import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error/error.component';
import {RouterModule} from '@angular/router';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { CopyButtonComponent } from './copy-button/copy-button.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';



@NgModule({
  declarations: [
    ErrorComponent,
    ToolbarComponent,
    CopyButtonComponent,
  ],
  exports: [
    CopyButtonComponent,
    ToolbarComponent,
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSnackBarModule,
    RouterModule.forChild([
      {path: 'error/:errorId', component: ErrorComponent},
    ]),
    ClipboardModule,
  ]
})
export class SharedModule { }
