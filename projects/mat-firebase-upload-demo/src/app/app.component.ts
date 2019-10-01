import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from 'projects/mat-firebase-upload/src/public-api';
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
    <div class="container-2cols">
      <form-firebase-files [formControl]="controlFiles" [config]="config">
      </form-firebase-files>
      <pre>{{ controlFiles?.value | json }}</pre>
    </div>
    <h2>File Uploader/Viewer Control</h2>
    <div class="container-2cols">
      <form-firebase-file [formControl]="controlFile" [config]="config">
      </form-firebase-file>
      <pre>{{ controlFile?.value | json }}</pre>
    </div>
    <h2>Files Viewer Only</h2>
    <div class="container-2cols">
      <form-firebase-files-viewer [value]="controlFiles.value">
      </form-firebase-files-viewer>
      <pre>{{ controlFiles?.value | json }}</pre>
    </div>
    <h2>Image Uploader/Viewer Control</h2>
    <div class="container-2cols">
      <form-firebase-image [formControl]="controlImage" [config]="config">
      </form-firebase-image>
      <pre>{{ controlImage?.value | json }}</pre>
    </div>
    <h2>Image Uploader/Viewer Control2</h2>
    <div class="container-2cols">
      <form-firebase-image [formControl]="controlImage2" [config]="config">
      </form-firebase-image>
      <pre>{{ controlImage2?.value | json }}</pre>
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
  `,
  styles: [
    `
      .container-2cols {
        display: grid;
        grid-template-columns: 50% 50%;
        overflow: hidden;
      }
      pre {
        overflow: auto;
        width: 100%;
      }
    `
  ]
})
export class AppComponent {
  controlFiles = new FormControl([
    blankFile('https://i.imgur.com/uUL3zYD.jpg'),
    blankFile('https://i.imgur.com/HSdYMMN.jpg')
  ]);
  controlFile = new FormControl(blankFile('https://i.imgur.com/uUL3zYD.jpg'));
  controlImage = new FormControl(blankFile('https://i.imgur.com/uUL3zYD.jpg'));
  controlImage2 = new FormControl(blankFile('https://i.imgur.com/HSdYMMN.jpg'));

  enabledControl = new FormControl(true);

  config: FormFirebaseFilesConfiguration;

  imgUrl = 'https://i.imgur.com/uUL3zYD.jpg';
  imgUrls = ['https://i.imgur.com/uUL3zYD.jpg', 'https://i.imgur.com/HSdYMMN.jpg'];

  constructor() {
    this.config = {
      directory: `audits/somelocation`,
      firebaseConfig: environment.firebaseConfig,
      useUuidName: true,
      acceptedFiles: 'application/pdf,image/*'
    };
    this.enabledControl.valueChanges.subscribe(isEnabled => {
      if (isEnabled) {
        this.controlFile.enable();
        this.controlFiles.enable();
        this.controlImage.enable();
        this.controlImage2.enable();
      } else {
        this.controlFile.disable();
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
