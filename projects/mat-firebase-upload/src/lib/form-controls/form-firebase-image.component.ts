import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { FormFileObject } from '../FormFileObject';
import { Subject } from 'rxjs';
import { takeUntil, map, tap } from 'rxjs/operators';
import { FormBase } from '../form-base-class';
import { NotificationService } from '../utils/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { PreviewImagePopupComponent } from '../subcomponents/preview-images/components/preview-image-popup.component';
import { UploadsManager } from '../firebase/uploads-manager';
import { FormFirebaseImageConfiguration } from '../FormFirebaseFileConfiguration';
import { SimpleLogger } from '../utils/simple-logger';

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
          [hidden]="true"
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
              class="file-thumb has-pointer smart-rotate"
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
  `,
  styles: [
    `
      .smart-rotate {
        image-orientation: from-image;
      }
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
export class FormFirebaseImageComponent extends FormBase<FormFileObject> {
  @Input()
  placeholder = 'Attached Files';
  @Input()
  uploadMessage = 'Upload an Image Here';
  private _config: FormFirebaseImageConfiguration;
  @Input()
  set config(config: FormFirebaseImageConfiguration) {
    this._config = config || ({} as any);
    this.initUploadManager();
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

  isDraggingOnTop = false;

  hasLoaded = false;
  hasError = false;
  private um: UploadsManager;

  constructor(public ns: NotificationService, private dialog: MatDialog) {
    super();
    this.$ngdestroy.subscribe(() => this.destroyUploadManager());
  }

  writeValue(value) {
    if (typeof value === 'object') {
      this.value = value;
    } else {
      this.value = null;
    }
  }

  destroyUploadManager() {
    this.destroyed.next();
    if (this.um) {
      this.um.onDestroy();
    }
  }

  initUploadManager() {
    this.logger = new SimpleLogger(this.debug, '[form-firebase-image]');
    this.destroyUploadManager();
    const $internalChangesTap = this.internalControl.valueChanges.pipe(
      takeUntil(this.destroyed),
      tap(files => this.logger.log('$internalChangesTap', {files})),
      map(file => [file])
    );
    this.um = new UploadsManager(
      this.config,
      this.ns,
      this.uploadStatusChanged,
      $internalChangesTap,
      [this.value],
      this.logger
    );
    this.um.$currentFiles.pipe(takeUntil(this.destroyed)).subscribe(vals => {
      if (Array.isArray(vals)) {
        this.value = [...vals].pop();
      }
    });
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

  async clickRemoveTag(fileObject: FormFileObject) {
    this.value = null;
    this.hasError = false;
    this.hasLoaded = false;
    this.um.clickRemoveTag(fileObject);
  }

  onFileInputChange(event) {
    const files = event.target.files;
    this.hasLoaded = false;
    this.hasError = false;
    this.um.onFileInputChange(files);
  }

  onFileDrop(event) {
    event.preventDefault();
    if (this.disabled) {
      return;
    }
    const files = event.dataTransfer.files;
    this.hasLoaded = false;
    this.hasError = false;
    this.um.onFileInputChange(files);
  }
}
