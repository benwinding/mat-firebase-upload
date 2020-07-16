import { AppRoutingModule } from './app.routing';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

import { MatFirebaseUploadModule } from './from-lib';

import {
  TestFormFilesComponent,
  TestFormFileComponent,
  TestFormImageComponent,
  TestFormViewersComponent,
} from "./components";

const entryComponents = [
  TestFormFilesComponent,
  TestFormFileComponent,
  TestFormImageComponent,
  TestFormViewersComponent,
];

@NgModule({
  declarations: [AppComponent, ...entryComponents],
  entryComponents: [...entryComponents],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFirebaseUploadModule,
    MatTabsModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
