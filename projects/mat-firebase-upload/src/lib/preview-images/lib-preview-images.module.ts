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

const exportedComponents = [PreviewImageComponent, PreviewGalleryComponent];

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
