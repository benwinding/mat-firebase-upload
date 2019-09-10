import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewImageComponent } from './components/preview-image.component';
import { PreviewGalleryComponent } from './components/preview-gallery.component';
import {
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { PreviewImagePopupComponent } from './components/preview-image-popup.component';
import { LibImgWithLoaderComponent } from './components/img-with-loader.component';

const exportedComponents = [
  PreviewImageComponent,
  PreviewGalleryComponent,
  LibImgWithLoaderComponent
];

@NgModule({
  entryComponents: [PreviewImagePopupComponent],
  declarations: [...exportedComponents, PreviewImagePopupComponent],
  exports: [...exportedComponents],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class LibPreviewImagesModule {}
