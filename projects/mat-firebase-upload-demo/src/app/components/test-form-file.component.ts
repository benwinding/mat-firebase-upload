import { Component, OnInit } from "@angular/core";
import { blankFile, makeConfig, delay } from "./file-factory";
import { FormControl } from "@angular/forms";
import { FormFirebaseFilesConfiguration } from '../from-lib';

@Component({
  template: `
    <h2>File Uploader/Viewer Control</h2>
    <div>
      <h5>Control Enabled({{ enabledControl.value | json }})</h5>
      <mat-slide-toggle [formControl]="enabledControl"> </mat-slide-toggle>
    </div>
    <div class="container-2cols">
      <form-firebase-file
        *ngIf="controlFile"
        [config]="config"
        [formControl]="controlFile"
        debug="true"
      >
      </form-firebase-file>
      <pre>{{ controlFile?.value | json }}</pre>
    </div>
  `
})
export class TestFormFileComponent implements OnInit {
  enabledControl = new FormControl(true);
  controlFile = new FormControl(blankFile("https://i.imgur.com/uUL3zYD.jpg"));
  config: FormFirebaseFilesConfiguration;

  constructor() {
    this.enabledControl.valueChanges.subscribe(isEnabled => {
      if (isEnabled) {
        this.controlFile.enable();
      } else {
        this.controlFile.disable();
      }
    });
  }

  async ngOnInit() {
    await delay(1000);
    this.controlFile.setValue(blankFile("https://i.imgur.com/ioqsdHZ.jpeg"))
    this.config = await makeConfig(3000);
  }
}
