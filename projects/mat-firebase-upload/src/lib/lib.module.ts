import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatIconModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { NotificationService } from './utils/notification.service';
import { FormFirebaseImageComponent } from './form-firebase-image/form-firebase-image.component';
import { ForFirebaseFilesComponent } from './form-firebase-files/form-firebase-files.component';
import { FormFileUploadedFileListComponent } from './form-firebase-files/form-file-uploader-list.component';
import { LibPreviewImagesModule } from './preview-images/lib-preview-images.module';

const shared = [FormFirebaseImageComponent, ForFirebaseFilesComponent];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,
    LibPreviewImagesModule
  ],
  exports: [...shared],
  declarations: [FormFileUploadedFileListComponent, ...shared],
  providers: [NotificationService]
})
export class MatFirebaseUploadModule {}
