import { EventEmitter, Component, Input, Output } from '@angular/core';
import { FormFileObject } from '../FormFileObject';
import { MatDialog } from '@angular/material';
import { PreviewImagePopupComponent } from '../preview-images/components/preview-image-popup.component';

@Component({
  selector: 'lib-uploaded-files-list',
  template: `
    <p *ngIf="uploadedFiles?.length">Uploaded files:</p>
    <div>
      <div *ngFor="let file of uploadedFiles">
        <div class="full-width flex-h justify-between">
          <div class="flex-h has-ellipsis">
            <mat-icon *ngIf="!disabled && isDone(file)">done</mat-icon>
            <a class="flex-h has-ellipsis" [href]="file.id" target="_blank">
              <img class="file-icon" image [src]="file['fileicon']" />
              <span class="has-ellipsis">{{ file.value.name }}</span>
              <mat-icon class="i-open">open_in_new</mat-icon>
            </a>
          </div>
          <div class="flex-h">
            <div class="flex-h" *ngIf="file['imageurl'] as imageurl">
              <div
                class="full-width"
                *ngIf="!img.hasLoaded && !img.hasError"
              >
                <div class="margin10">
                  <mat-progress-spinner [diameter]="30" mode="indeterminate">
                  </mat-progress-spinner>
                </div>
              </div>
              <img
                #img
                class="file-thumb has-pointer"
                (click)="clickedImage(imageurl)"
                [src]="imageurl"
                [hidden]="!img.hasLoaded && !img.hasError"
                (load)="img.hasLoaded = true"
                (error)="img.hasError = true"
              />
            </div>
            <mat-icon
              *ngIf="!disabled"
              class="has-pointer"
              (click)="this.clickRemoveTag.emit(file)"
              >cancel</mat-icon
            >
          </div>
        </div>
        <div class="full-width">
          <mat-progress-bar
            class="progress"
            mode="determinate"
            [value]="getProgress(file)"
          ></mat-progress-bar>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      .flex-h {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .justify-between {
        justify-content: space-between;
      }
      .has-pointer {
        cursor: pointer;
      }
      .file-link {
        display: flex;
        align-items: center;
      }
      .file-thumb,
      .file-icon {
        margin: 3px;
        height: 30px;
        width: auto;
      }
      .file-thumb {
        background-color: #ddd;
      }
      .i-open {
        font-size: 1em;
      }
      .has-ellipsis {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    `
  ]
})
export class FormFileUploadedFileListComponent {
  @Input()
  disabled: boolean;
  @Input()
  uploadedFiles: FormFileObject[] = [];
  @Output()
  clickRemoveTag = new EventEmitter<FormFileObject>();

  constructor(private dialog: MatDialog) {}

  clickedImage(imageurl: string) {
    this.dialog.open(PreviewImagePopupComponent, {
      data: imageurl,
      hasBackdrop: true,
      disableClose: false
    });
  }

  getProgress(file: FormFileObject) {
    const isDone = this.isDone(file);
    if (isDone) {
      return 100;
    }
    if (file && file.value && file.value.props) {
      const p = file.value.props.progress;
      return p * 0.95; // 95% until download completed
    }
    return 100;
  }

  isDone(file: FormFileObject): boolean {
    if (file && file.value && file.value.props) {
      const isCompleted =
        file.value.props.completed || file.value.props.progress === 100;
      return isCompleted;
    }
    return false;
  }
}
