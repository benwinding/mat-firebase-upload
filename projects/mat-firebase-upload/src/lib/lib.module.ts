import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatIconModule, MatProgressBarModule } from '@angular/material';
import { FormFileUploadedFileListComponent } from './form-file-firebase/form-file-uploader-list.component';
import { CommonModule } from '@angular/common';
import { NotificationService } from './utils/notification.service';
import { FormImageFirebaseComponent } from './form-image-firebase/form-image-firebase.component';
import { FormFileFirebaseComponent } from './form-file-firebase/form-files-firebase.component';

const shared = [FormImageFirebaseComponent, FormFileFirebaseComponent];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [...shared],
  declarations: [FormFileUploadedFileListComponent, ...shared],
  providers: [NotificationService]
})
export class MatFirebaseUploadModule {}
