import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <ul>
      <h1>Mat Firebase Upload</h1>
      <li><a routerLink="form-firebase-file">form-firebase-file</a></li>
      <li><a routerLink="form-firebase-files">form-firebase-files</a></li>
      <li><a routerLink="form-firebase-image">form-firebase-image</a></li>
      <li><a routerLink="form-firebase-viewers">form-firebase-viewers</a></li>
    </ul>
    <router-outlet> </router-outlet>
  `
})
export class AppComponent implements OnInit {
  constructor() {}

  async ngOnInit() {}
}
