import { Component, Input } from '@angular/core';

@Component({
  selector: 'img-with-loader',
  template: `
    <div class="container">
      <div class="full-width justify bg-grey" *ngIf="!hasLoaded">
        <div class="margin10">
          <mat-progress-spinner [diameter]="80" mode="indeterminate">
          </mat-progress-spinner>
        </div>
      </div>
      <img
        class="full-width"
        [hidden]="!hasLoaded && !hasError"
        [src]="src"
        (load)="hasLoaded = true"
        (error)="hasError = true"
      />
    </div>
  `,
  styles: [
    `
      .bg-grey {
        background-color: #dddddd78;
      }
      .justify {
        display: flex;
        justify-content: center;
      }
      .container {
        position: relative;
      }
      .full-width {
        width: 100%;
      }
      .margin10 {
        margin: 10%;
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
}
