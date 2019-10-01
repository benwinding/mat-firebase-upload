import { Component, Input } from '@angular/core';

@Component({
  selector: 'preview-gallery',
  template: `
    <div class="gallery">
      <div class="gallery-item" *ngFor="let url of imageUrls">
        <preview-image [src]="url" [aspectRatio]="1"> </preview-image>
      </div>
    </div>
  `,
  styles: [
    `
      .gallery {
        display: flex;
      }
      .gallery-item {
        margin-right: 15px;
        margin-top: 15px;
        width: 100px;
      }
    `
  ]
})
export class PreviewGalleryComponent {
  _imageUrls: string[];
  @Input()
  set imageUrls(imageUrls: string[]) {
    if (imageUrls) {
      this._imageUrls = imageUrls;
    } else {
      this._imageUrls = ['https://via.placeholder.com/100x100'];
    }
  }
  get imageUrls() {
    return this._imageUrls;
  }
  @Input()
  aspectRatio = 1;
}
