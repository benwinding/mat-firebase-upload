import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-preview-image-popup',
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
      <img-with-loader class="fill fill-min" [src]="imageSrc"></img-with-loader>
    </div>
  `,
  styles: [
    `
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
      .fill {
        max-height: 90vh;
        max-width: 90vw;
      }
      .fill-min {
        min-width: 250px;
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
