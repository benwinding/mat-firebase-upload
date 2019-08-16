import { Component } from '@angular/core';
import { ActivatedRoute, Router, Event, RouterEvent, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div style="text-align:center">
      <h1><a routerLink="/">Welcome to {{ title }}!</a></h1>
    </div>
    <ul *ngIf="currentUrl == '/'">
      <li><a routerLink="test-text">test-text</a></li>
      <li><a routerLink="test-select">test-select</a></li>
      <li><a routerLink="test-tags">test-tags</a></li>
      <li><a routerLink="test-formgroup">test-formgroup</a></li>
      <li><a routerLink="test-color">test-color</a></li>
      <li><a routerLink="test-assignee">test-assignee</a></li>
    </ul>
    <router-outlet>
    </router-outlet>
  `
})
export class AppComponent {
  title = 'mat-wrapped';
  currentUrl = '';

  constructor(private router: Router) {
    this.router.events.subscribe((e: Event) => {
      if (!(e instanceof NavigationEnd)) {
        return;
      }
      this.currentUrl = e.url;
    })
  }
}
