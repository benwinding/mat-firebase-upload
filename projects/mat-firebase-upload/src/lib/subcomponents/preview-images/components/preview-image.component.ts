import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PreviewImagePopupComponent } from './preview-image-popup.component';

@Component({
  selector: 'preview-image',
  template: `
    <div class="outer">
      <div
        class="outer-before"
        [style.paddingTop]="
          sanitizer.bypassSecurityTrustStyle(
            'calc(1/(' + aspectRatio + ') * 100%)'
          )
        "
      ></div>
      <div
        class="inner has-pointer"
        [style.backgroundImage]="'url(' + src + ')'"
        [style.backgroundSize]="'cover'"
        (click)="clickedImage()"
      ></div>
    </div>
  `,
  styles: [
    `
      /* made with: https://ratiobuddy.com/ */
      .outer {
        position: relative;
      }
      .outer-before {
        display: block;
        content: '';
        width: 100%;
        padding-top: 50%; /* default aspect ratio */
      }
      .outer > .inner {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
      }
      .has-pointer {
        cursor: pointer;
      }

      img {
        width: 100%;
      }
    `
  ]
})
export class PreviewImageComponent {
  _src: string;
  @Input()
  set src(src: string) {
    if (src) {
      this._src = src;
    } else {
      this._src = 'https://via.placeholder.com/200x100';
    }
  }
  get src() {
    return this._src;
  }
  @Input()
  aspectRatio = 1;

  constructor(public sanitizer: DomSanitizer, private dialog: MatDialog) {}

  async clickedImage() {
    const ref = this.dialog.open(PreviewImagePopupComponent, {
      hasBackdrop: true,
      data: this.src
    });
  }
}
