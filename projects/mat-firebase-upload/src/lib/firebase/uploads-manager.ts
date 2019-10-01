import { timer, Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, take, tap, filter, delay } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { FormFirebaseConfigurationBase } from '../FormFirebaseFileConfiguration';
import { FormFileObject } from '../FormFileObject';
import {
  NotificationService,
  TrimSlashes,
  blobToDataURL,
  downscaleImage,
  dataURItoBlob,
  isFileImage,
  getFileIcon
} from '../utils';
import { EventEmitter } from '@angular/core';

export interface IUploadsManager {
  $currentFiles: Observable<FormFileObject[]>;
  onDestroy();
  clickRemoveTag(fileObject: FormFileObject): Promise<void>;
  onFileInputChange(event);
  onFileDrop(event);
}

export class UploadsManager implements IUploadsManager {
  private _$files = new BehaviorSubject<FormFileObject[]>(null);
  public get $currentFiles() {
    return this._$files.asObservable();
  }

  private _$trackedFiles = new BehaviorSubject<FormFileObject[]>(null);
  private storage: firebase.storage.Storage;
  private destroyed = new Subject();

  constructor(
    private config: FormFirebaseConfigurationBase,
    private ns: NotificationService,
    private uploadStatusChanged: EventEmitter<boolean>,
    private $formChanges: Observable<FormFileObject[]>
  ) {
    this.initFirebase();
    // Update tracked files from form changes
    let updateLock = false;
    $formChanges
      .pipe(
        takeUntil(this.destroyed),
        tap(() => (updateLock = true)),
        tap(files => this._$trackedFiles.next(files)),
        delay(1),
        tap(() => (updateLock = false))
      )
      .subscribe();
    // Update external from tracked files
    this._$trackedFiles
      .pipe(
        takeUntil(this.destroyed),
        filter(() => !updateLock),
        tap(files => this._$files.next(files))
      )
      .subscribe();
  }

  public onDestroy() {
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

  private getFirebaseApp(
    config: FormFirebaseConfigurationBase
  ): firebase.app.App {
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

  private checkAllUploadsAreDone() {
    const currentFiles = this.getCurrentFiles();
    const completeArray = currentFiles
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

  private currentBucketName() {
    return (
      this.config.bucketname ||
      // tslint:disable-next-line: no-string-literal
      this.config.firebaseConfig['storageBucket']
    );
  }

  public async clickRemoveTag(fileObject: FormFileObject) {
    const currentFiles = this.getCurrentFiles();
    const filteredFiles = currentFiles.filter(f => f.id !== fileObject.id);
    console.log('form-files: clickRemoveTag', { currentFiles, filteredFiles });
    this._$trackedFiles.next(filteredFiles);
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

  public onFileInputChange(files: File[]) {
    if (files && files.length) {
      const filesList = files;
      const fileArray = Array.from(filesList);
      fileArray.map((file: File) => this.beginUploadTask(file));
    }
  }

  public onFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length) {
      const filesList = files;
      const fileArray = Array.from(filesList);
      fileArray.map((file: File) => this.beginUploadTask(file));
    }
  }

  private async beginUploadTask(file: File) {
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

  private async parseAndCompress(file): Promise<File> {
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

  private getFileSizeKiloBytes(dataURL) {
    const head = 'data:image/*;base64,';
    const fileSizeBytes = Math.round(((dataURL.length - head.length) * 3) / 4);
    const fileSizeKiloBytes = (fileSizeBytes / 1024).toFixed(0);
    return fileSizeKiloBytes;
  }

  private async onNext(
    snapshot: firebase.storage.UploadTaskSnapshot,
    fullPath: string
  ) {
    switch (snapshot.state) {
      case firebase.storage.TaskState.RUNNING: // or 'running'
        const file = this.getCurrentFiles().find(
          f => f.bucket_path === fullPath
        );
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

  private onError(error) {
    this.ns.notify(error.message, 'Error Uploading', true);
    console.error('onError(error)', { error }, error);
  }

  private async onComplete(fullPath, uniqueFileName, originalFileName) {
    console.log('onComplete()', {
      fullPath,
      uniqueFileName,
      originalFileName
    });
    const ref = this.storage.refFromURL(fullPath);
    const url = await ref.getDownloadURL();
    const isImage = isFileImage(originalFileName);
    const currentFiles = this.getCurrentFiles();
    const file = currentFiles.find(f => f.id === uniqueFileName);
    if (!file || !file.value || !file.value.props) {
      return;
    }
    file.id = url;
    if (isImage) {
      file.imageurl = url;
    }
    file.value.props.completed = true;
    this._$trackedFiles.next(currentFiles);
  }

  private addFile(
    uniqueFileName: string,
    originalFileName: string,
    fullPath: string
  ) {
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
    const currentFiles = this.getCurrentFiles();
    currentFiles.push(newFile);
    this._$trackedFiles.next(currentFiles);
  }

  getCurrentFiles(): FormFileObject[] {
    let allFiles = this._$trackedFiles.getValue();
    if (!Array.isArray(allFiles)) {
      allFiles = [];
    }
    return allFiles;
  }
}
