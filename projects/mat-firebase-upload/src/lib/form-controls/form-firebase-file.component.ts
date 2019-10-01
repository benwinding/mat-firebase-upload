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
import { Subject } from 'rxjs';
import { FormBase } from '../form-base-class';
import { NotificationService } from '../utils/notification.service';
import { MatDialog } from '@angular/material';
import { UploadsManager } from '../firebase/uploads-manager';
import { takeUntil, map } from 'rxjs/operators';
import { FormFirebaseFileConfiguration } from '../FormFirebaseFileConfiguration';
import { PreviewImagePopupComponent } from '../subcomponents/preview-images/components/preview-image-popup.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'form-firebase-file',
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
          [placeholder]="placeholder"
          type="file"
          [disabled]="disabled"
          (change)="onFileInputChange($event)"
          [accept]="config?.acceptedFiles || 'image/*'"
        />
        <p class="upload-message">{{ uploadMessage }}</p>
      </label>
      <div class="relative" *ngIf="value?.id">
        <lib-uploaded-files-list
          placeholder="Uploaded:"
          [disabled]="disabled"
          [uploadedFiles]="[value]"
          (clickRemoveTag)="this.clickRemoveTag($event)"
        >
        </lib-uploaded-files-list>
      </div>
    </div>
  `,
  styles: [
    `
      .margin10 {
        margin: 10px;
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
        padding: 50px 0px;
        cursor: pointer;
        width: calc(100% - 8px - 20px);
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
      useExisting: forwardRef(() => FormFirebaseFileComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormFirebaseFileComponent),
      multi: true
    }
  ]
})
export class FormFirebaseFileComponent extends FormBase<FormFileObject>
  implements OnInit, OnDestroy {
  @Input()
  placeholder = 'Uploaded File';
  @Input()
  uploadMessage = 'Upload a File Here';

  private _config: FormFirebaseFileConfiguration;
  @Input()
  set config(config: FormFirebaseFileConfiguration) {
    this._config = config || ({} as any);
    this.initUploadManager();
  }
  get config() {
    return this._config;
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
  }

  ngOnInit() {}
  ngOnDestroy() {
    if (this.um) {
      this.um.onDestroy();
    }
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

  initUploadManager() {
    this.ngOnDestroy();
    const $internalChangesTap = this.internalControl.valueChanges.pipe(
      takeUntil(this.destroyed),
      map(file => [file])
    );
    this.um = new UploadsManager(
      this.config,
      this.ns,
      this.uploadStatusChanged,
      $internalChangesTap
    );
    this.um.$currentFiles.pipe(takeUntil(this.destroyed)).subscribe(vals => {
      if (Array.isArray(vals)) {
        this.value = vals[0];
      }
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
