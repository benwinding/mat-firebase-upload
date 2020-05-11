import {
  Component,
  forwardRef,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from "@angular/forms";
import { FormFileObject } from "../FormFileObject";
import * as firebase from "firebase/app";
import "firebase/storage";
import { Subject, Observable } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { FormBase } from "../form-base-class";
import { NotificationService } from "../utils/notification.service";
import { UploadsManager } from "../firebase/uploads-manager";
import { FormFirebaseFilesConfiguration } from "../FormFirebaseFileConfiguration";
import { SimpleLogger } from "../utils/simple-logger";

@Component({
  // tslint:disable-next-line: component-selector
  selector: "form-firebase-files",
  template: `
    <div>
      <label
        class="custom-file-upload"
        [class.dragover]="!maxReached && !disabled && isDraggingOnTop"
        [class.disabled]="disabled"
        (dragover)="isDraggingOnTop = true; $event.preventDefault()"
        (dragleave)="isDraggingOnTop = false"
        (drop)="isDraggingOnTop = false; onFileDrop($event)"
      >
        <input
          *ngIf="isMultiple"
          [hidden]="true"
          type="file"
          multiple
          [disabled]="disabled || maxReached"
          (change)="onFileInputChange($event)"
          [accept]="config.acceptedFiles || '*'"
        />
        <input
          *ngIf="!isMultiple"
          [hidden]="true"
          type="file"
          [disabled]="disabled || maxReached"
          (change)="onFileInputChange($event)"
          [accept]="config.acceptedFiles || '*'"
        />
        <div class="flex-v">
          <span *ngIf="isConfigLoaded">
            {{ placeholder }}
          </span>
          <i *ngIf="disabled">
            (disabled)
          </i>
        </div>
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
        border: 4px dashed #eee;
        display: inline-block;
        padding: 35px 0px;
        cursor: pointer;
        width: calc(100% - 8px);
        text-align: center;
        font-size: 1.5em;
        color: #777;
      }
      .custom-file-upload.disabled {
        background: #eee;
      }
      .dragover {
        background: #ddd;
      }
      .max-files {
        font-size: 0.9em;
        color: orange;
        font-style: italic;
      }
      .flex-v {
        display: flex;
        align-items: center;
        flex-direction: column;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFirebaseFilesComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormFirebaseFilesComponent),
      multi: true
    }
  ]
})
export class FormFirebaseFilesComponent extends FormBase<FormFileObject[]>
  implements OnInit, OnDestroy {
  @Input()
  placeholder = "upload here";

  private _config: FormFirebaseFilesConfiguration;
  @Input()
  set config(config: FormFirebaseFilesConfiguration) {
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
  storage: firebase.storage.Storage;

  isDraggingOnTop = false;
  private um: UploadsManager;

  $formChanges: Observable<FormFileObject[]>;

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
    this.destroyUploadManager();
  }

  destroyUploadManager() {
    this.destroyed.next();
    if (this.um) {
      this.um.onDestroy();
    }
  }

  initUploadManager() {
    this.logger = new SimpleLogger(this.debug, "[form-firebase-files]");
    this.$formChanges = this.internalControl.valueChanges.pipe(
      tap(values =>
        this.logger.log("files.valueChanges", { values, thisValue: this.value })
      )
    );
    this.destroyUploadManager();
    this.logger.log("before new UploadsManager()", { value: this.value });
    this.um = new UploadsManager(
      this.config,
      this.ns,
      this.uploadStatusChanged,
      this.$formChanges,
      this.value,
      this.logger
    );
    this.um.$currentFiles.pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.logger.log("um.$currentFiles", { value });
      this.writeValue(value);
    });
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

  async clickRemoveTag(fileObject: FormFileObject) {
    this.um.clickRemoveTag(fileObject);
  }

  onFileInputChange(event) {
    const files = event.target.files;
    this.um.onFileInputChange(files);
  }

  onFileDrop(event) {
    event.preventDefault();
    if (this.maxReached || this.disabled) {
      return;
    }
    const files = event.dataTransfer.files;
    this.um.onFileInputChange(files);
  }
}
