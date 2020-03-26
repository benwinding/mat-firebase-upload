import { Component, OnInit } from '@angular/core';
import { blankFile, makeConfig } from './file-factory';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from '../../../mat-firebase-upload/src/public-api';
import { delay } from 'rxjs/operators';

@Component({
  template: `
    <h2>Files Uploader/Viewer Control</h2>
    <div>
      <h5>Control Enabled({{ enabledControl.value | json }})</h5>
      <mat-slide-toggle [formControl]="enabledControl"> </mat-slide-toggle>
    </div>
    <div class="container-2cols">
      <form-firebase-files
        [formControl]="controlFiles"
        [config]="config"
        debug="true"
      >
      </form-firebase-files>
      <pre>{{ controlFiles?.value | json }}</pre>
    </div>
  `
})
export class TestFormFilesComponent implements OnInit {
  enabledControl = new FormControl(true);
  controlFiles = new FormControl([
    blankFile('https://i.imgur.com/uUL3zYD.jpg'),
    blankFile('https://i.imgur.com/HSdYMMN.jpg')
  ]);
  config: FormFirebaseFilesConfiguration;

  constructor() {
    this.enabledControl.valueChanges.subscribe(isEnabled => {
      if (isEnabled) {
        this.controlFiles.enable();
      } else {
        this.controlFiles.disable();
      }
    });
  }

  async ngOnInit() {
    await delay(1000);
    this.config = await makeConfig(2000);
  }
}
