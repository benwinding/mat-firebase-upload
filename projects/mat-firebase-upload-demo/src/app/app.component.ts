import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from 'projects/mat-firebase-upload/src/lib/form-firebase-files/form-firebase-files.component';
import { environment } from '../environments/environment';
import { FormFileObject } from 'mat-firebase-upload/public-api';

function blankFile(url: string): FormFileObject {
  return {
    id: url,
    fileicon: '/assets/fileicons/image.svg',
    imageurl: url,
    bucket_path: '',
    value: {
      name:
        'imageimageimageimageimageimageimageimageimageimageimageimageimage.jpeg',
      props: {
        thumb: '',
        fileicon: '',
        progress: 100,
        completed: true
      }
    }
  };
}

function blankFile2(): FormFileObject {
  return blankFile('https://i.imgur.com/HSdYMMN.jpg');
}

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h5>Controls Enabled({{ enabledControl.value | json }})</h5>
      <mat-slide-toggle [formControl]="enabledControl"> </mat-slide-toggle>
    </div>
    <h2>Files Uploader/Viewer Control</h2>
    <form-firebase-files [formControl]="controlFiles" [config]="config">
    </form-firebase-files>
    <h2>Files Viewer Only</h2>
    <form-firebase-files-viewer [value]="controlFiles.value">
    </form-firebase-files-viewer>
    <h2>Image Uploader/Viewer Control</h2>
    <form-firebase-image [formControl]="controlImage" [config]="config">
    </form-firebase-image>
    <h2>Image Uploader/Viewer Control2</h2>
    <form-firebase-image [formControl]="controlImage2" [config]="config">
    </form-firebase-image>
    <h5>Value</h5>
    <pre>
      {{ controlImage2.value | json }}
    </pre
    >
    <h2>Image With Loader</h2>
    <img-with-loader [src]="imgUrl"></img-with-loader>
    <h2>Image Gallery</h2>
    <preview-gallery [imageUrls]="[imgUrl]"> </preview-gallery>
  `
})
export class AppComponent {
  controlFiles = new FormControl([
    blankFile('https://i.imgur.com/uUL3zYD.jpg'),
    blankFile('https://i.imgur.com/HSdYMMN.jpg')
  ]);
  controlImage = new FormControl(blankFile('https://i.imgur.com/uUL3zYD.jpg'));
  controlImage2 = new FormControl(blankFile('https://i.imgur.com/HSdYMMN.jpg'));

  enabledControl = new FormControl(true);

  config: FormFirebaseFilesConfiguration;

  imgUrl = 'https://i.imgur.com/uUL3zYD.jpg';

  constructor() {
    this.config = {
      directory: `audits/somelocation`,
      firebaseConfig: environment.firebaseConfig,
      useUuidName: true
    };
    this.enabledControl.valueChanges.subscribe(isEnabled => {
      if (isEnabled) {
        this.controlFiles.enable();
        this.controlImage.enable();
        this.controlImage2.enable();
      } else {
        this.controlFiles.disable();
        this.controlImage.disable();
        this.controlImage2.disable();
      }
    });
    this.controlImage2.setValue(null);
    setTimeout(() => {
      this.controlImage2.patchValue(blankFile2());
    }, 1000);
  }
}
