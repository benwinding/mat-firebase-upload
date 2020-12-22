import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {
  TestFormFileComponent,
  TestFormFilesComponent,
  TestFormImageComponent,
  TestFormViewersComponent,
} from "./components";

export const allRoutes: Routes = [
  { path: "form-firebase-file", component: TestFormFileComponent },
  { path: "form-firebase-files", component: TestFormFilesComponent },
  { path: "form-firebase-image", component: TestFormImageComponent },
  { path: "form-firebase-viewers", component: TestFormViewersComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: "",
        children: allRoutes,
      },
      { path: "**", redirectTo: "form-firebase-file" },
    ]),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
