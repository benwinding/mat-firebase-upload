import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatInputModule
} from '../../../material-imports';

import { RenameImagePopupComponent } from './components/rename-image-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  entryComponents: [ RenameImagePopupComponent],
  declarations: [RenameImagePopupComponent],
  exports: [RenameImagePopupComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class LibRenameImagesModule {}
