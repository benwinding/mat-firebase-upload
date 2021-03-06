import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'preview-image-popup',
  template: `
    <div class="relative">
      <button class="absolute z1 btn-close" mat-mini-fab (click)="onCancel()">
        <mat-icon>clear</mat-icon>
      </button>
      <a
        class="absolute z1 btn-download"
        mat-mini-fab
        target="_blank"
        [href]="imageSrc"
      >
        <mat-icon>open_in_new</mat-icon>
      </a>
      <div
        class="justify bg-grey"
        *ngIf="!img.hasLoaded && !img.hasError"
      >
        <div class="margin10">
          <mat-progress-spinner [diameter]="90" mode="indeterminate">
          </mat-progress-spinner>
        </div>
      </div>
      <img
        #img
        class="fill smart-rotate"
        [src]="imageSrc"
        [hidden]="!img.hasLoaded && !img.hasError"
        (load)="img.hasLoaded = true"
        (error)="img.hasError = true"
      />
    </div>
  `,
  styles: [
    `
      .smart-rotate {
        image-orientation: from-image;
      }
      .z1 {
        z-index: 1;
      }
      .relative {
        position: relative;
      }
      .absolute {
        position: absolute;
      }
      .btn-close {
        right: 10px;
        top: 10px;
      }
      .btn-download {
        right: 10px;
        bottom: 10px;
      }
      .bg-grey {
        background-color: #dddddd78;
      }
      .margin10 {
        margin: 70px;
      }
      .justify {
        display: flex;
        justify-content: center;
      }
      .fill {
        max-height: 90vh;
        max-width: 100%;
      }
    `
  ]
})
export class PreviewImagePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<PreviewImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public imageSrc: string
  ) {}

  onCancel() {
    this.dialogRef.close();
  }
}
