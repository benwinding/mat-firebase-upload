import { Component, Input } from '@angular/core';
import { FormFileObject } from '../FormFileObject';

@Component({
  selector: 'form-firebase-files-viewer',
  template: `
    <ng-template #noFiles>
      <h4 class="no-files">
        {{ placeholder }}
      </h4>
    </ng-template>
    <lib-uploaded-files-list
      *ngIf="value?.length; else noFiles"
      [disabled]="true"
      [uploadedFiles]="value"
    >
    </lib-uploaded-files-list>
  `,
  styles: [
    `
      .no-files {
        color: grey;
        text-align: center;
      }
    `
  ]
})
export class FormFirebaseFilesViewerComponent {
  @Input()
  value: FormFileObject[];
  @Input()
  placeholder = 'No Files...';
}
