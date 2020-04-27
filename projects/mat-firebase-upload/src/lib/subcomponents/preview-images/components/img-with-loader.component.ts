import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PreviewImagePopupComponent } from './preview-image-popup.component';

@Component({
  selector: 'img-with-loader',
  template: `
    <div
      class="container"
      [ngStyle]="{ 'padding-bottom': aspectRatio * 100 + '%' }"
      [class.height-auto]="!hasLoaded"
    >
      <div class="full-width justify bg-grey" *ngIf="!hasLoaded">
        <div class="margin10">
          <mat-progress-spinner [diameter]="80" mode="indeterminate">
          </mat-progress-spinner>
        </div>
      </div>
      <img
        image
        #img
        class="image-fit has-pointer smart-rotate"
        [hidden]="!hasLoaded && !hasError"
        (click)="clickedImage(src)"
        [src]="src"
        (load)="onLoaded(img); hasLoaded = true"
        (error)="hasError = true"
      />
    </div>
  `,
  styles: [
    `
      .smart-rotate {
        image-orientation: from-image;
      }
      .bg-grey {
        background-color: #dddddd78;
      }
      .justify {
        display: flex;
        justify-content: center;
      }
      .full-width {
        width: 100%;
      }
      .margin10 {
        margin: 50px;
      }
      .container {
        position: relative;
        height: 0;
      }
      .image-fit {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
        object-position: center center;
      }
      .height-auto {
        height: auto;
      }
      .has-pointer {
        cursor: pointer;
      }
      :host {
        display: block;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `
  ]
})
export class LibImgWithLoaderComponent {
  hasLoaded = false;
  hasError = false;

  aspectRatio = 0;

  // tslint:disable-next-line: variable-name
  private _src: string;
  @Input()
  set src(src: string) {
    this.hasError = false;
    this.hasLoaded = false;
    this._src = src;
  }
  get src() {
    return this._src;
  }

  constructor(private dialog: MatDialog) {}

  clickedImage(imageurl: string) {
    this.dialog.open(PreviewImagePopupComponent, {
      data: imageurl,
      hasBackdrop: true,
      disableClose: false
    });
  }

  onLoaded(img: HTMLImageElement) {
    console.log({ img });
    const { naturalHeight, naturalWidth } = img;
    this.aspectRatio = naturalHeight / naturalWidth;
  }
}
