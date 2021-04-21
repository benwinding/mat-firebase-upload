import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "preview-rename-image-popup",
  template: `
    <form [formGroup]="renameFileForm">
      <h2>Update the File Name</h2>
      <div>
        <mat-form-field appearance="fill">
          <mat-label>Old Name</mat-label>
          <input formControlName="oldFileName" matInput />
        </mat-form-field>
      </div>
      <mat-form-field appearance="fill">
        <mat-label>New Name</mat-label>
        <input formControlName="newFileName" matInput />
        <mat-error *ngIf="!isValid()">Enter a Valid File Name</mat-error>
      </mat-form-field>
      <div>
        <button
          mat-flat-button
          color="warn"
          (click)="onCancel()"
          style="margin-right:30px"
        >
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!isValid()"
          style="margin-left:30px"
          (click)="onSubmit()"
        >
          Save
        </button>
      </div>
    </form>
  `,
})
export class RenameImagePopupComponent implements OnInit {
  renameFileForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<RenameImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public currentFileName: string
  ) {}

  ngOnInit() {
    this.renameFileForm = new FormGroup({
      oldFileName: new FormControl(""),
      newFileName: new FormControl("", [
        Validators.required,
        this.noWhitespaceValidator,
      ]),
    });
    this.renameFileForm.controls["oldFileName"].disable();
    this.renameFileForm.get("oldFileName").patchValue(this.currentFileName);
  }
  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.renameFileForm.valid) {
      console.log("not form valid");
      return;
    }
    this.dialogRef.close(this.renameFileForm.value["newFileName"]);
  }

  //no whitespace validator for the new file name
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValidEntry = !isWhitespace;
    return isValidEntry ? null : { whitespace: true };
  }
  isValid() {
    if (
      this.renameFileForm.get("newFileName").invalid ||
      this.renameFileForm.get("newFileName").hasError("whitespace")
    ) {
      return false;
    }
    return true;
  }
}
