import { Component, OnInit } from '@angular/core';
import { blankFile, makeConfig } from './file-factory';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from '../../../mat-firebase-upload/src/public-api';

@Component({
  template: `
    <h2>File Uploader/Viewer Control</h2>
    <div>
      <h5>Control Enabled({{ enabledControl.value | json }})</h5>
      <mat-slide-toggle [formControl]="enabledControl"> </mat-slide-toggle>
    </div>
    <h2>Image Uploader/Viewer Control</h2>
    <div class="container-2cols">
      <form-firebase-image
        [formControl]="controlImage"
        [config]="config"
        debug="true"
      >
      </form-firebase-image>
      <pre>{{ controlImage?.value | json }}</pre>
    </div>
    <h2>Image Uploader/Viewer Control2</h2>
    <div class="container-2cols">
      <form-firebase-image
        [formControl]="controlImage2"
        [config]="config"
        debug="true"
      >
      </form-firebase-image>
      <pre>{{ controlImage2?.value | json }}</pre>
    </div>
  `
})
export class TestFormImageComponent implements OnInit {
  enabledControl = new FormControl(true);
  controlImage = new FormControl(blankFile('https://i.imgur.com/uUL3zYD.jpg'));
  controlImage2 = new FormControl(blankFile('https://i.imgur.com/HSdYMMN.jpg'));
  config: FormFirebaseFilesConfiguration;

  constructor() {
    this.enabledControl.valueChanges.subscribe(isEnabled => {
      if (isEnabled) {
        this.controlImage.enable();
        this.controlImage2.enable();
      } else {
        this.controlImage.disable();
        this.controlImage2.disable();
      }
    });
  }

  async ngOnInit() {
    this.config = await makeConfig();
  }
}
