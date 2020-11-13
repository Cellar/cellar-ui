import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {SecretsModule} from './secrets/secrets.module';
import {SharedModule} from './shared/shared.module';
import {MatButtonModule} from '@angular/material/button';

const routes: Routes = [
  {path: '', redirectTo: 'secret/create', pathMatch: 'full'},
  {path: '**', redirectTo: 'error/404', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        LayoutModule,
        MatToolbarModule,
        MatIconModule,
        SecretsModule,
        SharedModule,
        MatButtonModule,
    ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
