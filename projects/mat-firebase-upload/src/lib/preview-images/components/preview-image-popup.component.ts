import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-preview-image-popup',
  template: `
    <div class="container">
      <button class="btn-close" mat-mini-fab (click)="onCancel()">
        <mat-icon>clear</mat-icon>
      </button>
      <a class="btn-download" mat-mini-fab target="_blank" [href]="imageSrc">
        <mat-icon>open_in_new</mat-icon>
      </a>
      <div class="image-loader" *ngIf="loadingImage">
        <mat-progress-spinner [diameter]="120" mode="indeterminate">
        </mat-progress-spinner>
      </div>
      <img [hidden]="loadingImage" [src]="imageSrc" (load)="onLoad()" />
    </div>
  `,
  styles: [
    `
      .container {
        position: relative;
      }
      .btn-close {
        position: absolute;
        right: 10px;
        top: 10px;
      }
      .btn-download {
        position: absolute;
        right: 10px;
        bottom: 10px;
      }
      img {
        max-height: 80vh;
        max-width: 80vw;
      }
      .image-loader {
        padding: 100px;
      }
    `
  ]
})
export class PreviewImagePopupComponent {
  loadingImage = true;

  constructor(
    public dialogRef: MatDialogRef<PreviewImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public imageSrc: string
  ) {}

  onCancel() {
    this.dialogRef.close();
  }

  onLoad() {
    this.loadingImage = false;
  }
}
