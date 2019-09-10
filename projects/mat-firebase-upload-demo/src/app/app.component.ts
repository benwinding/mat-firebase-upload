import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFirebaseFilesConfiguration } from 'projects/mat-firebase-upload/src/lib/form-firebase-files/form-firebase-files.component';
import { environment } from '../environments/environment';
import { FormFileObject } from 'mat-firebase-upload/public-api';

function blankFile(url: string): FormFileObject {
  return {
    id: url,
    fileicon: null,
    imageurl: url,
    bucket_path: '',
    value: {
      name: 'image.jpeg',
      props: {
        thumb: '',
        fileicon: '',
        progress: 100,
        completed: true
      }
    }
  };
}

@Component({
  selector: 'app-root',
  template: `
    <h2>Uploader/Viewer Control</h2>
    <form-firebase-files [formControl]="controlFiles" [config]="config">
    </form-firebase-files>
    <h2>Viewer Only</h2>
    <form-firebase-files-viewer [value]="controlFiles.value">
    </form-firebase-files-viewer>
    <h2>Image With Loader</h2>
    <img-with-loader [src]="imgUrl"></img-with-loader>
    <h2>Image Gallery</h2>
    <app-preview-gallery [imageUrls]="[imgUrl]"> </app-preview-gallery>
  `
})
export class AppComponent {
  controlFiles = new FormControl([
    blankFile('https://i.imgur.com/uUL3zYD.jpg')
  ]);
  config: FormFirebaseFilesConfiguration;

  imgUrl = 'https://i.imgur.com/uUL3zYD.jpg';

  constructor() {
    this.config = {
      directory: `audits/somelocation`,
      firebaseConfig: environment.firebaseConfig,
      useUuidName: true
    };
  }
}
