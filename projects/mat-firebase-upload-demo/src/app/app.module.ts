import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  MatTabsModule,
  MatIconModule,
  MatButtonModule,
  MatSlideToggleModule
} from '@angular/material';
import { MatFirebaseUploadModule } from '../../../mat-firebase-upload/src/public-api';
import { TestFormFilesComponent } from './test-form-files.component';
import { TestFormFileComponent } from './test-form-file.component';
import { TestFormImageComponent } from './test-form-image.component';
import { TestFormViewersComponent } from './test-form-viewers.component';

const entryComponents = [
  TestFormFilesComponent,
  TestFormFileComponent,
  TestFormImageComponent,
  TestFormViewersComponent
];

const allRoutes: Routes = [
  { path: 'form-firebase-file', component: TestFormFileComponent },
  { path: 'form-firebase-files', component: TestFormFilesComponent },
  { path: 'form-firebase-image', component: TestFormImageComponent },
  { path: 'form-firebase-viewers', component: TestFormViewersComponent }
];

@NgModule({
  declarations: [AppComponent, ...entryComponents],
  entryComponents: [...entryComponents],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFirebaseUploadModule,
    RouterModule.forRoot(allRoutes),

    MatTabsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
