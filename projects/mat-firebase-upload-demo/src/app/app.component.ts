import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from 'projects/mat-firebase-upload/src/lib/form-firebase-files/form-firebase-files.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <form-firebase-files [formControl]="controlFiles" [config]="config">
    </form-firebase-files>
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
