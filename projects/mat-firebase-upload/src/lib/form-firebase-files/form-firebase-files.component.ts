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
import { v4 as uuidv4 } from 'uuid';

export interface FormFirebaseFilesConfiguration {
  directory: string;
  bucketname?: string;
  firebaseConfig?: {};
  firebaseApp?: firebase.app.App;
  maxFiles?: number;
  imageCompressionQuality?: number;
  imageCompressionMaxSize?: number;
  useUuidName?: boolean;
  acceptedFiles?: 'image/*' | 'application/pdf' | 'image/*,application/*' |  string;
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'form-firebase-files',
  template: `
    <div>
      <label
        class="custom-file-upload"
        [class.dragover]="!maxReached && !disabled && isDraggingOnTop"
        (dragover)="isDraggingOnTop = true; $event.preventDefault()"
        (dragleave)="isDraggingOnTop = false"
        (drop)="isDraggingOnTop = false; onFileDrop($event)"
      >
        <input
          *ngIf="isMultiple"
          class="hidden"
          type="file"
          multiple
          [disabled]="disabled || maxReached"
          (change)="onFileInputChange($event)"
          [accept]="config.acceptedFiles || '*'"
        />
        <input
          *ngIf="!isMultiple"
          class="hidden"
          type="file"
          [disabled]="disabled || maxReached"
          (change)="onFileInputChange($event)"
          [accept]="config.acceptedFiles || '*'"
        />
        <span *ngIf="isConfigLoaded">
          {{ placeholder }}
        </span>
        <span *ngIf="!isConfigLoaded">
          [config] is waiting for variable config:
          FormFirebaseFilesConfiguration to resolve
        </span>
        <div class="max-files" *ngIf="maxReached && !disabled">
          Max Uploaded - Limit of {{ config.maxFiles }} file(s) reached. Remove
          files to change uploads
        </div>
      </label>
      <lib-uploaded-files-list
        [disabled]="disabled"
        [uploadedFiles]="this.value"
        (clickRemoveTag)="this.clickRemoveTag($event)"
      >
      </lib-uploaded-files-list>
    </div>
  `,
  styles: [
    `
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
      .max-files {
        font-size: 0.9em;
        color: orange;
        font-style: italic;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ForFirebaseFilesComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForFirebaseFilesComponent),
      multi: true
    }
  ]
})
export class ForFirebaseFilesComponent extends FormBase<FormFileObject[]>
  implements OnInit, OnDestroy {
  @Input()
  placeholder = 'upload here';

  private _config: FormFirebaseFilesConfiguration;
  @Input()
  set config(config: FormFirebaseFilesConfiguration) {
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

  constructor(public ns: NotificationService) {
    super();
  }

  writeValue(value) {
    if (!Array.isArray(value)) {
      value = [];
    }
    this.value = value;
  }

  ngOnInit() {}
  ngOnDestroy() {
    this.destroyed.next();
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

  getFirebaseApp(config: FormFirebaseFilesConfiguration): firebase.app.App {
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
    const allFiles = this.value;
    const completeArray = allFiles
      .filter(f => !!f)
      .filter(f => !!f.value)
      .filter(f => !!f.value.props)
      .map(f => f.value.props.completed);

    const haveAllFilesComplete = completeArray.reduce(
      (previous, currentComplete) => previous && currentComplete,
      true
    );
    const isStillUploading = !haveAllFilesComplete;
    this.uploadStatusChanged.emit(isStillUploading);
  }

  get isMultiple() {
    return this.config && this.config.maxFiles !== 1;
  }

  get maxReached() {
    return (
      this.config &&
      this.config.maxFiles &&
      this.value &&
      this.config.maxFiles === this.value.length
    );
  }

  private currentBucketName() {
    return (
      this.config.bucketname ||
      // tslint:disable-next-line: no-string-literal
      this.config.firebaseConfig['storageBucket']
    );
  }

  async clickRemoveTag(fileObject: FormFileObject) {
    this.ensureValueIsArray();
    this.value = this.value.filter(f => f.id !== fileObject.id);
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
    if (this.maxReached || this.disabled) {
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
    const uniqueFileName = this.config.useUuidName ? uuidv4() : file.name;
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
    this.ensureValueIsArray();
    switch (snapshot.state) {
      case firebase.storage.TaskState.RUNNING: // or 'running'
        const file = this.value.find(f => f.bucket_path === fullPath);
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
    console.log('onComplete()', {});
    const ref = this.storage.refFromURL(fullPath);
    const url = await ref.getDownloadURL();
    const isImage = isFileImage(originalFileName);

    this.ensureValueIsArray();
    const file = this.value.find(f => f.id === uniqueFileName);
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
    this.ensureValueIsArray();
    this.value.push(newFile);
  }

  ensureValueIsArray() {
    if (!Array.isArray(this.value)) {
      this.writeValue([]);
    }
  }
}
