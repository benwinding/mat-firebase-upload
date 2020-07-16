import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatIconModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatTooltipModule
} from '../material-imports';
import { CommonModule } from '@angular/common';
import { NotificationService } from './utils/notification.service';
import { FormFileUploadedFileListComponent } from './subcomponents/form-file-uploader-list.component';
import { FormFirebaseImageComponent } from './form-controls/form-firebase-image.component';
import { FormFirebaseFilesComponent } from './form-controls/form-firebase-files.component';
import { FormFirebaseFilesViewerComponent } from './subcomponents/form-firebase-files-viewer.component';
import { FormFirebaseFileComponent } from './form-controls/form-firebase-file.component';
import { LibPreviewImagesModule } from './subcomponents/preview-images/lib-preview-images.module';

const shared = [
  FormFirebaseFilesComponent,
  FormFirebaseFileComponent,
  FormFirebaseImageComponent,
  FormFirebaseFilesViewerComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,
    LibPreviewImagesModule
  ],
  exports: [...shared, LibPreviewImagesModule],
  declarations: [FormFileUploadedFileListComponent, ...shared],
  providers: [NotificationService]
})
export class MatFirebaseUploadModule {}
