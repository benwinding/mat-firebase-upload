import {
  Component,
  forwardRef,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { FormFileObject } from '../FormFileObject';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Subject, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { getFileIcon, isFileImage } from '../utils/file-icon.helper';
import { FormBase } from '../form-base-class';
import { TrimSlashes } from '../utils/path-helpers';
import { NotificationService } from '../utils/notification.service';
import {
  dataURItoBlob,
  blobToDataURL,
  downscaleImage
} from '../utils/img-helpers';
import { MatDialog } from '@angular/material';
import { PreviewImagePopupComponent } from '../preview-images/components/preview-image-popup.component';

export interface FormFirebaseImageConfiguration {
  directory: string;
  bucketname?: string;
  firebaseConfig?: {};
  firebaseApp?: firebase.app.App;
  imageCompressionQuality?: number;
  imageCompressionMaxSize?: number;
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'form-firebase-image',
  template: `
    <div class="container">
      <span class="placeholder">{{ placeholder }}</span>
      <label
        class="custom-file-upload"
        [class.dragover]="!disabled && isDraggingOnTop"
        (dragover)="isDraggingOnTop = true; $event.preventDefault()"
        (dragleave)="isDraggingOnTop = false"
        (drop)="isDraggingOnTop = false; onFileDrop($event)"
      >
        <input
          class="hidden"
          placeholder="placeholder"
          type="file"
          [disabled]="disabled"
          (change)="onFileInputChange($event)"
          accept="image/*"
        />
        <p class="upload-message">{{ uploadMessage }}</p>
        <div
          class="flex-h max-width justify-around"
          *ngIf="value?.imageurl as imageurl"
        >
          <div *ngIf="!hasLoaded && !hasError">
            <div class="margin10">
              <mat-progress-spinner [diameter]="90" mode="indeterminate">
              </mat-progress-spinner>
            </div>
          </div>
          <div class="relative" [hidden]="!hasLoaded && !hasError">
            <button
              mat-mini-fab
              color="secondary"
              class="remove-btn"
              [disabled]="disabled"
              (click)="clickRemoveTag(value)"
              matTooltip="Click to replace current image"
            >
              <mat-icon>
                swap_horiz
              </mat-icon>
            </button>
            <img
              #img
              class="file-thumb has-pointer"
              matTooltip="Click to preview image"
              (click)="onImageClicked($event, imageurl)"
              [src]="imageurl"
              (load)="hasLoaded = true"
              (error)="hasError = true"
            />
          </div>
        </div>
        <div
          class="full-width"
          *ngIf="(this.uploadStatusChanged | async) == true && value"
        >
          <mat-progress-bar
            class="progress"
            mode="determinate"
            [value]="value?.value?.props?.progress"
          ></mat-progress-bar>
        </div>
      </label>
    </div>
    <pre>
  </pre
    >
  `,
  styles: [
    `
      .relative {
        position: relative;
      }
      .container {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .placeholder {
        color: grey;
        margin-bottom: 5px;
      }
      .upload-message {
        font-size: 1.5em;
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        color: #777;
        cursor: pointer;
      }
      .remove-btn {
        position: absolute;
        right: 5px;
        top: 5px;
      }
      .custom-file-upload {
        display: inline-block;
        border: 4px dashed #ccc;
        background: transparent;
        padding: 10px;
        cursor: pointer;
        width: calc(100% - 8px - 20px);
        min-height: 200px;
      }
      .dragover {
        background: #ddd;
      }
      .hidden {
        display: none;
      }
      .justify-around {
        justify-content: space-around;
      }
      .flex-h {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .has-pointer {
        cursor: pointer;
      }
      .file-thumb {
        width: auto;
        max-height: 250px;
        max-width: 100%;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFirebaseImageComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormFirebaseImageComponent),
      multi: true
    }
  ]
})
export class FormFirebaseImageComponent extends FormBase<FormFileObject>
  implements OnInit, OnDestroy {
  @Input()
  placeholder = 'Attached Files';
  @Input()
  uploadMessage = 'Upload an Image Here';
  private _config: FormFirebaseImageConfiguration;
  @Input()
  set config(config: FormFirebaseImageConfiguration) {
    this._config = config || ({} as any);
    this.initFirebase();
  }
  get config() {
    return this._config;
  }
  get isConfigLoaded(): boolean {
    const c = this.config;
    return !!c && !!c.directory && (!!c.firebaseApp || !!c.firebaseConfig);
  }

  // tslint:disable-next-line: no-output-on-prefix
  @Output()
  uploadStatusChanged = new EventEmitter<boolean>();

  destroyed = new Subject();
  storage: firebase.storage.Storage;

  isDraggingOnTop = false;

  hasLoaded = false;
  hasError = false;

  constructor(public ns: NotificationService, private dialog: MatDialog) {
    super();
  }

  writeValue(value) {
    this.value = value;
  }

  ngOnInit() {}
  ngOnDestroy() {
    this.destroyed.next();
  }

  onImageClicked($event, imageurl: string) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dialog.open(PreviewImagePopupComponent, {
      data: imageurl,
      hasBackdrop: true,
      disableClose: false
    });
  }

  initFirebase() {
    const app = this.getFirebaseApp(this.config);
    if (!app) {
      return;
    }
    this.storage = app.storage(this.currentBucketName());
    timer(0, 1000)
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.checkAllUploadsAreDone();
      });
  }

  getFirebaseApp(config: FormFirebaseImageConfiguration): firebase.app.App {
    if (config.firebaseApp) {
      return config.firebaseApp;
    }
    if (!config.firebaseConfig) {
      return null;
    }
    const firebaseConfig = this.config.firebaseConfig;
    if (firebase.apps.length) {
      return firebase.apps[0];
    } else {
      return firebase.initializeApp(firebaseConfig);
    }
  }

  checkAllUploadsAreDone() {
    const file = this.value;
    if (!file || !file.value || !file.value.props) {
      this.uploadStatusChanged.emit(true);
      return;
    }
    const isCompleted = this.value.value.props.completed;
    const isStillUploading = !isCompleted;
    this.uploadStatusChanged.emit(isStillUploading);
  }

  private currentBucketName() {
    return (
      this.config.bucketname ||
      // tslint:disable-next-line: no-string-literal
      this.config.firebaseConfig['storageBucket']
    );
  }

  async clickRemoveTag(fileObject: FormFileObject) {
    this.value = null;
    this.hasError = false;
    this.hasLoaded = false;
    if (fileObject.bucket_path) {
      try {
        await this.storage.refFromURL(fileObject.bucket_path).delete();
        console.log('form-files: clickRemoveTag() file deleted from storage', {
          fileObject
        });
      } catch (error) {
        console.log(
          'form-files: clickRemoveTag() problem deleting file',
          error
        );
      }
    }
  }

  onFileInputChange(event) {
    const files = event.target.files;
    if (files && files.length) {
      const filesList = files;
      const fileArray = Array.from(filesList);
      fileArray.map((file: File) => this.beginUploadTask(file));
    }
  }

  onFileDrop(event) {
    event.preventDefault();
    if (this.disabled) {
      return;
    }
    const files = event.dataTransfer.files;
    if (files && files.length) {
      const filesList = files;
      const fileArray = Array.from(filesList);
      fileArray.map((file: File) => this.beginUploadTask(file));
    }
  }

  async beginUploadTask(file: File) {
    this.hasLoaded = false;
    this.hasError = false;
    const bucketPath = 'gs://' + this.currentBucketName();
    const uniqueFileName = file.name;
    const originalFileName = file.name;
    const dir = this.config.directory;
    const dirPath = `${TrimSlashes(bucketPath)}/${TrimSlashes(dir)}`;
    const fullPath = `${TrimSlashes(dirPath)}/${uniqueFileName}`;
    console.log('beginUploadTask()', { fileData: file, bucketPath, fullPath });
    let fileParsed;
    if (file.type === 'image/*') {
      fileParsed = await this.parseAndCompress(file);
    } else {
      fileParsed = file;
    }
    await this.addFile(uniqueFileName, originalFileName, fullPath);
    const uploadTask = this.storage.refFromURL(fullPath).put(fileParsed);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
      next: snap => this.onNext(snap, fullPath),
      error: error => this.onError(error),
      complete: () =>
        this.onComplete(fullPath, uniqueFileName, originalFileName)
    });

    this.destroyed.pipe(take(1)).subscribe(() => {
      uploadTask.cancel();
    });
  }

  async parseAndCompress(file) {
    if (
      !this.config.imageCompressionMaxSize &&
      !this.config.imageCompressionQuality
    ) {
      return file;
    }
    const maxWidth = this.config.imageCompressionMaxSize || 1800;
    const maxQuality = this.config.imageCompressionQuality || 0.6;
    const dataURL = await blobToDataURL(file);
    const newDataURL = await downscaleImage(
      dataURL,
      maxWidth,
      maxQuality,
      'image/jpeg'
    );
    const oldKb = this.getFileSizeKiloBytes(dataURL);
    const newKb = this.getFileSizeKiloBytes(newDataURL);
    const fileNew = dataURItoBlob(newDataURL) as File;
    console.log(`app-tags-files.component: optimized image...
  --> old=${oldKb} kb
  --> new=${newKb} kb`);
    return fileNew;
  }

  getFileSizeKiloBytes(dataURL) {
    const head = 'data:image/*;base64,';
    const fileSizeBytes = Math.round(((dataURL.length - head.length) * 3) / 4);
    const fileSizeKiloBytes = (fileSizeBytes / 1024).toFixed(0);
    return fileSizeKiloBytes;
  }

  async onNext(
    snapshot: firebase.storage.UploadTaskSnapshot,
    fullPath: string
  ) {
    switch (snapshot.state) {
      case firebase.storage.TaskState.RUNNING: // or 'running'
        const file = this.value;
        if (!file || !file.value || !file.value.props) {
          return;
        }
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is running', {
          file,
          fullPath,
          progress,
          snapshot
        });
        file.value.props.progress = progress;
        break;
    }
  }

  onError(error) {
    this.ns.notify(error.message, 'Error Uploading', true);
    console.error('onError(error)', { error }, error);
  }

  async onComplete(fullPath, uniqueFileName, originalFileName) {
    console.log('onComplete()', {
      fullPath,
      uniqueFileName,
      originalFileName,
      thisValue: this.value
    });
    const ref = this.storage.refFromURL(fullPath);
    const url = await ref.getDownloadURL();
    const isImage = isFileImage(originalFileName);

    const file = this.value;
    if (!file || !file.value || !file.value.props) {
      return;
    }
    file.id = url;
    if (isImage) {
      file.imageurl = url;
    }
    file.value.props.completed = true;
    this.writeValue(this.value);
  }

  addFile(uniqueFileName: string, originalFileName: string, fullPath: string) {
    const fileIcon = getFileIcon(originalFileName);
    const newFile: FormFileObject = {
      id: uniqueFileName,
      fileicon: fileIcon,
      imageurl: null,
      bucket_path: fullPath,
      value: {
        name: originalFileName,
        props: {
          thumb: null,
          fileicon: fileIcon,
          progress: 0,
          completed: false
        }
      }
    };
    this.value = newFile;
  }
}
