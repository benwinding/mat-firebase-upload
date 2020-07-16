import { Component, OnInit } from '@angular/core';
import { blankFile, makeConfig } from './file-factory';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from '../from-lib';

@Component({
  template: `
    <h2>File Uploader/Viewer Control</h2>
    <div>
      <h5>Control Enabled({{ enabledControl.value | json }})</h5>
      <mat-slide-toggle [formControl]="enabledControl"> </mat-slide-toggle>
    </div>
    <h2>Files Viewer Only</h2>
    <div class="container-2cols">
      <form-firebase-files-viewer [value]="controlFiles.value">
      </form-firebase-files-viewer>
      <pre>{{ controlFiles?.value | json }}</pre>
    </div>
    <h2>Image With Loader</h2>
    <div class="container-2cols">
      <img-with-loader [src]="imgUrl"></img-with-loader>
      <pre>{{ imgUrl | json }}</pre>
    </div>
    <h2>Image Gallery</h2>
    <div class="container-2cols">
      <preview-gallery [imageUrls]="imgUrls"> </preview-gallery>
      <pre>{{ imgUrls | json }}</pre>
    </div>

  `
})
export class TestFormViewersComponent implements OnInit {
  enabledControl = new FormControl(true);
  config: FormFirebaseFilesConfiguration;

  controlFiles = new FormControl([
    blankFile('https://i.imgur.com/uUL3zYD.jpg'),
    blankFile('https://i.imgur.com/HSdYMMN.jpg')
  ]);
  imgUrl = 'https://i.imgur.com/uUL3zYD.jpg';
  imgUrls = [
    'https://i.imgur.com/uUL3zYD.jpg',
    'https://i.imgur.com/HSdYMMN.jpg'
  ];

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
    this.config = await makeConfig();
  }
}
