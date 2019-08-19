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
import { dataURItoBlob, blobToDataURL, downscaleImage } from '../utils/img-helpers';

export interface FormFirebaseImageConfiguration {
  directory: string;
  bucketname?: string;
  firebaseConfig: {};
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
          type="file"
          [disabled]="disabled"
          (change)="onFileInputChange($event)"
          accept="image/*"
        />
        Drop/Click to Add Image
        <div
          class="img-preview"
          *ngIf="value?.id"
          [ngStyle]="{ backgroundImage: 'url(' + value?.id + ')' }"
        >
          <mat-icon class="remove-btn" (click)="clickRemoveTag(value)">
            clear
          </mat-icon>
        </div>
        <div
          class="full-width"
          *ngIf="(this.uploadStatusChanged | async) == true"
        >
          <mat-progress-bar
            class="progress"
            mode="determinate"
            [value]="value?.value?.props?.progress"
          ></mat-progress-bar>
        </div>
      </label>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
      }
      .placeholder {
        color: grey;
        margin-bottom: 5px;
      }
      .remove-btn {
        position: absolute;
        right: 0px;
        top: 0px;
      }
      .custom-file-upload {
        border: 4px dashed #ccc;
        display: inline-block;
        padding: 35px 0px;
        cursor: pointer;
        width: calc(100% - 8px);
        text-align: center;
        font-size: 1.5em;
        color: #777;
      }
      .dragover {
        background: #ddd;
      }
      .hidden {
        display: none;
      }
      .img-preview {
        position: relative;
        width: 100%;
        height: 200px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
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
  placeholder = 'upload here';
  @Input()
  config: FormFirebaseImageConfiguration = {} as any;
  // tslint:disable-next-line: no-output-on-prefix
  @Output()
  uploadStatusChanged = new EventEmitter<boolean>();

  destroyed = new Subject();
  storage: firebase.storage.Storage;

  isDraggingOnTop = false;

  constructor(public ns: NotificationService) {
    super();
  }

  writeValue(value) {
    this.value = value;
  }

  ngOnInit() {
    let app;
    if (firebase.apps.length) {
      app = firebase.apps[0];
    } else {
      app = firebase.initializeApp(this.config.firebaseConfig);
    }
    this.storage = app.storage(this.currentBucketName());
    timer(0, 1000)
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.checkAllUploadsAreDone();
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
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
