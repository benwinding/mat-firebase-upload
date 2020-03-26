# mat-firebase-upload

<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/mat-firebase-upload.svg)](https://www.npmjs.com/package/mat-firebase-upload) 
[![License](https://img.shields.io/npm/l/mat-firebase-upload.svg)](https://github.com/benwinding/mat-firebase-upload/blob/master/LICENSE) 
[![Downloads/week](https://img.shields.io/npm/dm/mat-firebase-upload.svg)](https://www.npmjs.com/package/mat-firebase-upload) 
[![Github Issues](https://img.shields.io/github/issues/benwinding/mat-firebase-upload.svg)](https://github.com/benwinding/mat-firebase-upload)
<!-- [END badges] -->

An easy to use upload dropzone.

<img src="https://i.imgur.com/bIy6Bzy.png" style="max-width: 100%;" alt="demo" />

- Angular 2+
- Material themed
- Firebase storage

## Basic Example

_Component HTML_
``` html
<form-firebase-file 
  [formControl]="controlFile" 
  [config]="config"
>
</form-firebase-file>
```
_Component Typescript_

``` ts
...
  controlFile = new FormControl();
  config = {
    directory: `path/to/upload/to`,
    firebaseConfig: environment.firebaseConfig,
  };
...
```
_angular.json_
``` json
"my-project": {
  ...,
  "architect": {
    "build": {
      ...,
      "options": {
        ...,
        "assets": [
          ...,
          {
            "glob": "**/*",
            "input": "node_modules/mat-firebase-upload/assets",
            "output": "./assets/fileicons"
          }
```

## Advanced Options

_Component HTML_
``` html
<form-firebase-file 
  [formControl]="controlFile" 
  [config]="config"
  placeholder="Drop files here!"
>
</form-firebase-file>
```
_Component Typescript_

``` ts
...
  controlFile = new FormControl();
  config: FormFirebaseFilesConfiguration = {
    directory: `audits/somelocation`,
    firebaseConfig: environment.firebaseConfig,

    bucketname: 'my-other-bucket-name.appspot.com',
    firebaseApp: app,
    imageCompressionQuality: 0.8,
    imageCompressionMaxSize: 2000,
    acceptedFiles: 'image/*',
    useUuidName: true,
    deleteOnStorage: true
  };
...
```
More details in the [Type definitions](https://github.com/benwinding/mat-firebase-upload)!
