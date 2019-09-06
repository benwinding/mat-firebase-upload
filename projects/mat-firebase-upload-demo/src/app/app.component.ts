import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from 'projects/mat-firebase-upload/src/lib/form-firebase-files/form-firebase-files.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <h2>Uploader/Viewer Control</h2>
    <form-firebase-files [formControl]="controlFiles" [config]="config">
    </form-firebase-files>
    <h2>Viewer Only</h2>
    <form-firebase-files-viewer [value]="controlFiles.value">
    </form-firebase-files-viewer>
  `
})
export class AppComponent {
  controlFiles = new FormControl();
  config: FormFirebaseFilesConfiguration;

  constructor() {
    this.config = {
      directory: `audits/somelocation`,
      firebaseConfig: environment.firebaseConfig,
      useUuidName: true
    };
  }
}
