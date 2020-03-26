(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "../mat-firebase-upload/src/lib/firebase/uploads-manager.ts":
/*!******************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/firebase/uploads-manager.ts ***!
  \******************************************************************/
/*! exports provided: UploadsManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UploadsManager", function() { return UploadsManager; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/app */ "../../node_modules/firebase/app/dist/index.cjs.js");
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(firebase_app__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var firebase_storage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/storage */ "../../node_modules/firebase/storage/dist/index.esm.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils */ "../mat-firebase-upload/src/lib/utils/index.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! uuid */ "../../node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_6__);







var UploadsManager = /** @class */ (function () {
    function UploadsManager(config, ns, uploadStatusChanged, $incomingChanges, initialFiles, logger) {
        var _this = this;
        this.config = config;
        this.ns = ns;
        this.uploadStatusChanged = uploadStatusChanged;
        this.logger = logger;
        this.$currentFiles = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](null);
        this.trackedFiles = [];
        this.destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.initFirebase();
        this.updatesFromInternal(initialFiles, true);
        // Update tracked files from form changes
        $incomingChanges
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["takeUntil"])(this.destroyed), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(function (files) { return _this.updatesFromExternal(files); }))
            .subscribe();
    }
    UploadsManager.prototype.onDestroy = function () {
        this.destroyed.next();
    };
    UploadsManager.prototype.updatesFromExternal = function (files) {
        this.logger.log('um: updatesFromExternal', { files: files });
        this.trackedFiles = files;
    };
    UploadsManager.prototype.updatesFromInternal = function (files, sendUpdate) {
        this.logger.log('um: updatesFromInternal', { files: files });
        if (!Array.isArray(files)) {
            this.trackedFiles = [];
            return;
        }
        this.trackedFiles = files;
        if (sendUpdate) {
            this.$currentFiles.next(this.trackedFiles);
        }
    };
    UploadsManager.prototype.initFirebase = function () {
        var _this = this;
        var app = this.getFirebaseApp(this.config);
        if (!app) {
            return;
        }
        this.storage = app.storage(this.currentBucketName());
        Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["timer"])(0, 1000)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["takeUntil"])(this.destroyed))
            .subscribe(function () {
            _this.checkAllUploadsAreDone();
        });
    };
    UploadsManager.prototype.getFirebaseApp = function (config) {
        if (config.firebaseApp) {
            return config.firebaseApp;
        }
        if (!config.firebaseConfig) {
            return null;
        }
        var firebaseConfig = this.config.firebaseConfig;
        if (firebase_app__WEBPACK_IMPORTED_MODULE_3__["apps"].length) {
            return firebase_app__WEBPACK_IMPORTED_MODULE_3__["apps"][0];
        }
        else {
            return firebase_app__WEBPACK_IMPORTED_MODULE_3__["initializeApp"](firebaseConfig);
        }
    };
    UploadsManager.prototype.checkAllUploadsAreDone = function () {
        var currentFiles = this.getCurrentFiles();
        var completeArray = currentFiles
            .filter(function (f) { return !!f.value; })
            .filter(function (f) { return !!f.value.props; })
            .map(function (f) { return f.value.props.completed; });
        var haveAllFilesComplete = completeArray.reduce(function (previous, currentComplete) { return previous && currentComplete; }, true);
        var isStillUploading = !haveAllFilesComplete;
        this.uploadStatusChanged.emit(isStillUploading);
    };
    UploadsManager.prototype.currentBucketName = function () {
        return (this.config.bucketname ||
            // tslint:disable-next-line: no-string-literal
            this.config.firebaseConfig['storageBucket']);
    };
    UploadsManager.prototype.clickRemoveTag = function (fileObject) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var currentFiles, filteredFiles, error_1;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentFiles = this.getCurrentFiles();
                        filteredFiles = currentFiles.filter(function (f) { return f.id !== fileObject.id; });
                        this.logger.log('form-files: clickRemoveTag', { currentFiles: currentFiles, filteredFiles: filteredFiles });
                        this.updatesFromInternal(filteredFiles, true);
                        if (!this.config.deleteOnStorage) {
                            return [2 /*return*/];
                        }
                        if (!fileObject.bucket_path) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.storage.refFromURL(fileObject.bucket_path).delete()];
                    case 2:
                        _a.sent();
                        this.logger.log('form-files: clickRemoveTag() file deleted from storage', {
                            fileObject: fileObject
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.log('form-files: clickRemoveTag() problem deleting file', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UploadsManager.prototype.onFileInputChange = function (files) {
        var _this = this;
        if (files && files.length) {
            var filesList = files;
            var fileArray = Array.from(filesList);
            fileArray.map(function (file) { return _this.beginUploadTask(file); });
        }
    };
    UploadsManager.prototype.beginUploadTask = function (file) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var bucketPath, uniqueFileName, originalFileName, dir, dirPath, fullPath, fileParsed, uploadTask;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bucketPath = 'gs://' + this.currentBucketName();
                        if (this.config.useUuidName) {
                            uniqueFileName = Object(uuid__WEBPACK_IMPORTED_MODULE_6__["v4"])() + '.' + file.name.split('.').pop();
                        }
                        else {
                            uniqueFileName = file.name;
                        }
                        originalFileName = file.name;
                        dir = this.config.directory;
                        dirPath = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["TrimSlashes"])(bucketPath) + "/" + Object(_utils__WEBPACK_IMPORTED_MODULE_5__["TrimSlashes"])(dir);
                        fullPath = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["TrimSlashes"])(dirPath) + "/" + uniqueFileName;
                        this.logger.log('beginUploadTask()', { fileData: file, bucketPath: bucketPath, fullPath: fullPath });
                        if (!file.type.includes('image/')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.parseAndCompress(file)];
                    case 1:
                        fileParsed = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        fileParsed = file;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.addFile(uniqueFileName, originalFileName, fullPath)];
                    case 4:
                        _a.sent();
                        uploadTask = this.storage.refFromURL(fullPath).put(fileParsed);
                        uploadTask.on(firebase_app__WEBPACK_IMPORTED_MODULE_3__["storage"].TaskEvent.STATE_CHANGED, {
                            next: function (snap) { return _this.onNext(snap, fullPath); },
                            error: function (error) { return _this.onError(error); },
                            complete: function () {
                                return _this.onComplete(fullPath, uniqueFileName, originalFileName);
                            }
                        });
                        this.destroyed.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["take"])(1)).subscribe(function () {
                            uploadTask.cancel();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    UploadsManager.prototype.addFile = function (uniqueFileName, originalFileName, fullPath) {
        var fileIcon = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["getFileIcon"])(originalFileName);
        var newFile = {
            id: uniqueFileName,
            fileicon: fileIcon,
            imageurl: null,
            bucket_path: fullPath,
            value: {
                name: originalFileName,
                props: {
                    thumb: null,
                    fileicon: fileIcon,
                    progress: 0,
                    completed: false
                }
            }
        };
        var currentFiles = this.getCurrentFiles();
        currentFiles.push(newFile);
        this.updatesFromInternal(currentFiles, true);
    };
    UploadsManager.prototype.parseAndCompress = function (file) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var maxWidth, maxQuality, dataURL, newDataURL, oldKb, newKb, fileNew;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.imageCompressionMaxSize &&
                            !this.config.imageCompressionQuality) {
                            return [2 /*return*/, file];
                        }
                        maxWidth = this.config.imageCompressionMaxSize || 1800;
                        maxQuality = this.config.imageCompressionQuality || 0.6;
                        return [4 /*yield*/, Object(_utils__WEBPACK_IMPORTED_MODULE_5__["blobToDataURL"])(file)];
                    case 1:
                        dataURL = _a.sent();
                        return [4 /*yield*/, Object(_utils__WEBPACK_IMPORTED_MODULE_5__["downscaleImage"])(dataURL, maxWidth, maxQuality, 'image/jpeg')];
                    case 2:
                        newDataURL = _a.sent();
                        oldKb = this.getFileSizeKiloBytes(dataURL);
                        newKb = this.getFileSizeKiloBytes(newDataURL);
                        fileNew = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["dataURItoBlob"])(newDataURL);
                        this.logger.log("app-tags-files.component: optimized image...\n  --> old=" + oldKb + " kb\n  --> new=" + newKb + " kb");
                        return [2 /*return*/, fileNew];
                }
            });
        });
    };
    UploadsManager.prototype.getFileSizeKiloBytes = function (dataURL) {
        var head = 'data:image/*;base64,';
        var fileSizeBytes = Math.round(((dataURL.length - head.length) * 3) / 4);
        var fileSizeKiloBytes = (fileSizeBytes / 1024).toFixed(0);
        return fileSizeKiloBytes;
    };
    UploadsManager.prototype.onNext = function (snapshot, fullPath) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var progress, file;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (snapshot.state) {
                    case firebase_app__WEBPACK_IMPORTED_MODULE_3__["storage"].TaskState.RUNNING: // or 'running'
                        progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        file = this.getCurrentFiles().find(function (f) { return f.bucket_path === fullPath; });
                        if (!file) {
                            this.logger.warn('onNext: Cannot find matching file', {
                                fullPath: fullPath,
                                progress: progress,
                                snapshot: snapshot
                            });
                            return [2 /*return*/];
                        }
                        this.logger.log('onNext: Upload is running', {
                            file: file,
                            fullPath: fullPath,
                            progress: progress,
                            snapshot: snapshot
                        });
                        file.value.props.progress = progress;
                        break;
                }
                return [2 /*return*/];
            });
        });
    };
    UploadsManager.prototype.onError = function (error) {
        this.ns.notify(error.message, 'Error Uploading', true);
        this.logger.error('onError(error)', { error: error }, error);
    };
    UploadsManager.prototype.onComplete = function (fullPath, uniqueFileName, originalFileName) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var ref, url, isImage, currentFiles, file;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log('onComplete()', {
                            fullPath: fullPath,
                            uniqueFileName: uniqueFileName,
                            originalFileName: originalFileName
                        });
                        ref = this.storage.refFromURL(fullPath);
                        return [4 /*yield*/, ref.getDownloadURL()];
                    case 1:
                        url = _a.sent();
                        isImage = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["isFileImage"])(originalFileName);
                        currentFiles = this.getCurrentFiles();
                        file = currentFiles.find(function (f) { return f.id === uniqueFileName; });
                        if (!file || !file.value || !file.value.props) {
                            return [2 /*return*/];
                        }
                        file.id = url;
                        if (isImage) {
                            file.imageurl = url;
                        }
                        file.value.props.completed = true;
                        this.updatesFromInternal(currentFiles, true);
                        return [2 /*return*/];
                }
            });
        });
    };
    UploadsManager.prototype.getCurrentFiles = function () {
        var allFiles = this.trackedFiles;
        if (!Array.isArray(allFiles)) {
            allFiles = [];
        }
        return allFiles.filter(function (f) { return !!f; });
    };
    return UploadsManager;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/form-base-class.ts":
/*!*********************************************************!*\
  !*** ../mat-firebase-upload/src/lib/form-base-class.ts ***!
  \*********************************************************/
/*! exports provided: FormBase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormBase", function() { return FormBase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _utils_case_helper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/case-helper */ "../mat-firebase-upload/src/lib/utils/case-helper.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! uuid */ "../../node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _utils_simple_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/simple-logger */ "../mat-firebase-upload/src/lib/utils/simple-logger.ts");








var FormBase = /** @class */ (function () {
    function FormBase() {
        var _this = this;
        this.internalControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]();
        this._destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
        this.disabled = false;
        this.propagateOnChange = function () { };
        this.onTouched = function () { };
        // Garrentee that init and destroy are called
        // even if ngOnInit() or ngOnDestroy() are overriden
        var originalOnDestroy = this.ngOnDestroy;
        this.ngOnDestroy = function () {
            _this.destroy();
            originalOnDestroy.apply(_this);
        };
        var originalOnInit = this.ngOnInit;
        this.ngOnInit = function () {
            _this.init();
            originalOnInit.apply(_this);
        };
    }
    // These will most likely be overriden
    FormBase.prototype.ngOnInit = function () { };
    FormBase.prototype.ngOnDestroy = function () { };
    FormBase.prototype.init = function () {
        var _this = this;
        this.logger = new _utils_simple_logger__WEBPACK_IMPORTED_MODULE_7__["SimpleLogger"](this.debug, '[form-base-class]');
        this._destroyed.next();
        this.autoCompleteObscureName = Object(uuid__WEBPACK_IMPORTED_MODULE_6__["v4"])();
        this.internalControl.valueChanges
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["takeUntil"])(this._destroyed))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["auditTime"])(100))
            .subscribe(function (value) {
            _this._value = value;
            _this.logger.log('internalControl.valueChanges()', { value: value });
            _this.onChange(_this._value);
            _this.onTouched();
        });
        if (!this.placeholder) {
            var nameParsed = Object(_utils_case_helper__WEBPACK_IMPORTED_MODULE_5__["ConvertToTitleCase"])(this.formControlName + '');
            this.placeholder = nameParsed;
        }
    };
    FormBase.prototype.destroy = function () {
        this._destroyed.next();
    };
    Object.defineProperty(FormBase.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this.logger.log('this.set value()', { value: value });
            this._value = value;
            this.internalControl.setValue(value, { emitEvent: true });
        },
        enumerable: true,
        configurable: true
    });
    FormBase.prototype.writeValue = function (value) {
        this.value = value;
    };
    FormBase.prototype.registerOnChange = function (fn) {
        this.propagateOnChange = fn;
    };
    FormBase.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    FormBase.prototype.setDisabledState = function (isDisabled) {
        var _this = this;
        this.disabled = isDisabled;
        setTimeout(function () {
            if (isDisabled) {
                _this.internalControl.disable();
            }
            else {
                _this.internalControl.enable();
            }
        });
    };
    FormBase.prototype.validate = function (c) {
        var errors = c.errors;
        var value = c.value;
        this.logger.log('form-base-class: validate()', { errors: errors, value: value });
        this.internalControl.setValidators(c.validator);
        return !this.validationError
            ? null
            : {
                validationError: {
                    valid: false
                }
            };
    };
    FormBase.prototype.onChange = function (inputValue) {
        this.validationError = this.CheckValueIsValid();
        if (this.validationError) {
            this.propagateOnChange(this.value);
        }
        else {
            this.propagateOnChange(inputValue);
        }
    };
    FormBase.prototype.CheckValueIsValid = function () {
        return null;
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", String)
    ], FormBase.prototype, "formControlName", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", String)
    ], FormBase.prototype, "placeholder", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Boolean)
    ], FormBase.prototype, "debug", void 0);
    return FormBase;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/form-controls/form-firebase-file.component.ts":
/*!************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/form-controls/form-firebase-file.component.ts ***!
  \************************************************************************************/
/*! exports provided: FormFirebaseFileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseFileComponent", function() { return FormFirebaseFileComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _form_base_class__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../form-base-class */ "../mat-firebase-upload/src/lib/form-base-class.ts");
/* harmony import */ var _utils_notification_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/notification.service */ "../mat-firebase-upload/src/lib/utils/notification.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../firebase/uploads-manager */ "../mat-firebase-upload/src/lib/firebase/uploads-manager.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _subcomponents_preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../subcomponents/preview-images/components/preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");
/* harmony import */ var _utils_simple_logger__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/simple-logger */ "../mat-firebase-upload/src/lib/utils/simple-logger.ts");











var FormFirebaseFileComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](FormFirebaseFileComponent, _super);
    function FormFirebaseFileComponent(ns, dialog) {
        var _this = _super.call(this) || this;
        _this.ns = ns;
        _this.dialog = dialog;
        _this.placeholder = 'Uploaded File';
        _this.uploadMessage = 'Upload a File Here';
        // tslint:disable-next-line: no-output-on-prefix
        _this.uploadStatusChanged = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        _this.destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_3__["Subject"]();
        _this.isDraggingOnTop = false;
        _this.hasLoaded = false;
        _this.hasError = false;
        return _this;
    }
    FormFirebaseFileComponent_1 = FormFirebaseFileComponent;
    Object.defineProperty(FormFirebaseFileComponent.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (config) {
            this._config = config || {};
            this.initUploadManager();
        },
        enumerable: true,
        configurable: true
    });
    FormFirebaseFileComponent.prototype.ngOnInit = function () { };
    FormFirebaseFileComponent.prototype.ngOnDestroy = function () {
        this.destroyUploadManager();
    };
    FormFirebaseFileComponent.prototype.destroyUploadManager = function () {
        this.destroyed.next();
        if (this.um) {
            this.um.onDestroy();
        }
    };
    FormFirebaseFileComponent.prototype.initUploadManager = function () {
        var _this = this;
        this.logger = new _utils_simple_logger__WEBPACK_IMPORTED_MODULE_10__["SimpleLogger"](this.debug, '[form-firebase-file]');
        this.destroyUploadManager();
        var $internalChangesTap = this.internalControl.valueChanges.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["takeUntil"])(this.destroyed), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["map"])(function (file) { return [file]; }));
        this.um = new _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_7__["UploadsManager"](this.config, this.ns, this.uploadStatusChanged, $internalChangesTap, [this.value], this.logger);
        this.um.$currentFiles.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["takeUntil"])(this.destroyed)).subscribe(function (vals) {
            if (Array.isArray(vals)) {
                _this.value = vals.slice().pop();
            }
        });
    };
    FormFirebaseFileComponent.prototype.writeValue = function (value) {
        if (typeof value === 'object') {
            this.value = value;
        }
        else {
            this.value = null;
        }
    };
    FormFirebaseFileComponent.prototype.onImageClicked = function ($event, imageurl) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dialog.open(_subcomponents_preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_9__["PreviewImagePopupComponent"], {
            data: imageurl,
            hasBackdrop: true,
            disableClose: false
        });
    };
    FormFirebaseFileComponent.prototype.clickRemoveTag = function (fileObject) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                this.value = null;
                this.hasError = false;
                this.hasLoaded = false;
                this.um.clickRemoveTag(fileObject);
                return [2 /*return*/];
            });
        });
    };
    FormFirebaseFileComponent.prototype.onFileInputChange = function (event) {
        var files = event.target.files;
        this.hasLoaded = false;
        this.hasError = false;
        this.um.onFileInputChange(files);
    };
    FormFirebaseFileComponent.prototype.onFileDrop = function (event) {
        event.preventDefault();
        if (this.disabled) {
            return;
        }
        var files = event.dataTransfer.files;
        this.hasLoaded = false;
        this.hasError = false;
        this.um.onFileInputChange(files);
    };
    var FormFirebaseFileComponent_1;
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFileComponent.prototype, "placeholder", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFileComponent.prototype, "uploadMessage", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object])
    ], FormFirebaseFileComponent.prototype, "config", null);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFileComponent.prototype, "uploadStatusChanged", void 0);
    FormFirebaseFileComponent = FormFirebaseFileComponent_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            // tslint:disable-next-line: component-selector
            selector: 'form-firebase-file',
            template: "\n    <div class=\"container\">\n      <span class=\"placeholder\">{{ placeholder }}</span>\n      <label\n        class=\"custom-file-upload\"\n        [class.dragover]=\"!disabled && isDraggingOnTop\"\n        (dragover)=\"isDraggingOnTop = true; $event.preventDefault()\"\n        (dragleave)=\"isDraggingOnTop = false\"\n        (drop)=\"isDraggingOnTop = false; onFileDrop($event)\"\n      >\n        <input\n          [hidden]=\"true\"\n          [placeholder]=\"placeholder\"\n          type=\"file\"\n          [disabled]=\"disabled\"\n          (change)=\"onFileInputChange($event)\"\n          [accept]=\"config?.acceptedFiles || 'image/*'\"\n        />\n        <p class=\"upload-message\">{{ uploadMessage }}</p>\n      </label>\n      <div class=\"relative\" *ngIf=\"value?.id\">\n        <lib-uploaded-files-list\n          placeholder=\"Uploaded:\"\n          [disabled]=\"disabled\"\n          [uploadedFiles]=\"[value]\"\n          (clickRemoveTag)=\"this.clickRemoveTag($event)\"\n        >\n        </lib-uploaded-files-list>\n      </div>\n    </div>\n  ",
            providers: [
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseFileComponent_1; }),
                    multi: true
                },
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALIDATORS"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseFileComponent_1; }),
                    multi: true
                }
            ],
            styles: ["\n      .margin10 {\n        margin: 10px;\n      }\n      .relative {\n        position: relative;\n      }\n      .container {\n        display: flex;\n        flex-direction: column;\n        position: relative;\n      }\n      .placeholder {\n        color: grey;\n        margin-bottom: 5px;\n      }\n      .upload-message {\n        font-size: 1.5em;\n        margin-top: 0;\n        margin-bottom: 10px;\n        text-align: center;\n        color: #777;\n        cursor: pointer;\n      }\n      .remove-btn {\n        position: absolute;\n        right: 5px;\n        top: 5px;\n      }\n      .custom-file-upload {\n        display: inline-block;\n        border: 4px dashed #ccc;\n        background: transparent;\n        padding: 50px 0px;\n        cursor: pointer;\n        width: calc(100% - 8px - 20px);\n      }\n      .dragover {\n        background: #ddd;\n      }\n      .justify-around {\n        justify-content: space-around;\n      }\n      .flex-h {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n      }\n      .has-pointer {\n        cursor: pointer;\n      }\n      .file-thumb {\n        width: auto;\n        max-height: 250px;\n        max-width: 100%;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_utils_notification_service__WEBPACK_IMPORTED_MODULE_5__["NotificationService"], _angular_material__WEBPACK_IMPORTED_MODULE_6__["MatDialog"]])
    ], FormFirebaseFileComponent);
    return FormFirebaseFileComponent;
}(_form_base_class__WEBPACK_IMPORTED_MODULE_4__["FormBase"]));



/***/ }),

/***/ "../mat-firebase-upload/src/lib/form-controls/form-firebase-files.component.ts":
/*!*************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/form-controls/form-firebase-files.component.ts ***!
  \*************************************************************************************/
/*! exports provided: FormFirebaseFilesComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseFilesComponent", function() { return FormFirebaseFilesComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var firebase_storage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/storage */ "../../node_modules/firebase/storage/dist/index.esm.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _form_base_class__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../form-base-class */ "../mat-firebase-upload/src/lib/form-base-class.ts");
/* harmony import */ var _utils_notification_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/notification.service */ "../mat-firebase-upload/src/lib/utils/notification.service.ts");
/* harmony import */ var _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../firebase/uploads-manager */ "../mat-firebase-upload/src/lib/firebase/uploads-manager.ts");
/* harmony import */ var _utils_simple_logger__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/simple-logger */ "../mat-firebase-upload/src/lib/utils/simple-logger.ts");










var FormFirebaseFilesComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](FormFirebaseFilesComponent, _super);
    function FormFirebaseFilesComponent(ns) {
        var _this = _super.call(this) || this;
        _this.ns = ns;
        _this.placeholder = "upload here";
        // tslint:disable-next-line: no-output-on-prefix
        _this.uploadStatusChanged = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        _this.destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_4__["Subject"]();
        _this.isDraggingOnTop = false;
        return _this;
    }
    FormFirebaseFilesComponent_1 = FormFirebaseFilesComponent;
    Object.defineProperty(FormFirebaseFilesComponent.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (config) {
            this._config = config || {};
            this.initUploadManager();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFirebaseFilesComponent.prototype, "isConfigLoaded", {
        get: function () {
            var c = this.config;
            return !!c && !!c.directory && (!!c.firebaseApp || !!c.firebaseConfig);
        },
        enumerable: true,
        configurable: true
    });
    FormFirebaseFilesComponent.prototype.writeValue = function (value) {
        if (!Array.isArray(value)) {
            value = [];
        }
        this.value = value;
    };
    FormFirebaseFilesComponent.prototype.ngOnInit = function () { };
    FormFirebaseFilesComponent.prototype.ngOnDestroy = function () {
        this.destroyUploadManager();
    };
    FormFirebaseFilesComponent.prototype.destroyUploadManager = function () {
        this.destroyed.next();
        if (this.um) {
            this.um.onDestroy();
        }
    };
    FormFirebaseFilesComponent.prototype.initUploadManager = function () {
        var _this = this;
        this.logger = new _utils_simple_logger__WEBPACK_IMPORTED_MODULE_9__["SimpleLogger"](this.debug, "[form-firebase-files]");
        this.$formChanges = this.internalControl.valueChanges.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["tap"])(function (values) {
            return _this.logger.log("files.valueChanges", { values: values, thisValue: _this.value });
        }));
        this.destroyUploadManager();
        this.logger.log("before new UploadsManager()", { value: this.value });
        this.um = new _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_8__["UploadsManager"](this.config, this.ns, this.uploadStatusChanged, this.$formChanges, this.value, this.logger);
        this.um.$currentFiles.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["takeUntil"])(this.destroyed)).subscribe(function (value) {
            _this.logger.log("um.$currentFiles", { value: value });
            _this.writeValue(value);
        });
    };
    Object.defineProperty(FormFirebaseFilesComponent.prototype, "isMultiple", {
        get: function () {
            return this.config && this.config.maxFiles !== 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFirebaseFilesComponent.prototype, "maxReached", {
        get: function () {
            return (this.config &&
                this.config.maxFiles &&
                this.value &&
                this.config.maxFiles === this.value.length);
        },
        enumerable: true,
        configurable: true
    });
    FormFirebaseFilesComponent.prototype.clickRemoveTag = function (fileObject) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                this.um.clickRemoveTag(fileObject);
                return [2 /*return*/];
            });
        });
    };
    FormFirebaseFilesComponent.prototype.onFileInputChange = function (event) {
        var files = event.target.files;
        this.um.onFileInputChange(files);
    };
    FormFirebaseFilesComponent.prototype.onFileDrop = function (event) {
        event.preventDefault();
        if (this.maxReached || this.disabled) {
            return;
        }
        var files = event.dataTransfer.files;
        this.um.onFileInputChange(files);
    };
    var FormFirebaseFilesComponent_1;
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFilesComponent.prototype, "placeholder", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object])
    ], FormFirebaseFilesComponent.prototype, "config", null);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFilesComponent.prototype, "uploadStatusChanged", void 0);
    FormFirebaseFilesComponent = FormFirebaseFilesComponent_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            // tslint:disable-next-line: component-selector
            selector: "form-firebase-files",
            template: "\n    <div>\n      <label\n        class=\"custom-file-upload\"\n        [class.dragover]=\"!maxReached && !disabled && isDraggingOnTop\"\n        (dragover)=\"isDraggingOnTop = true; $event.preventDefault()\"\n        (dragleave)=\"isDraggingOnTop = false\"\n        (drop)=\"isDraggingOnTop = false; onFileDrop($event)\"\n      >\n        <input\n          *ngIf=\"isMultiple\"\n          [hidden]=\"true\"\n          type=\"file\"\n          multiple\n          [disabled]=\"disabled || maxReached\"\n          (change)=\"onFileInputChange($event)\"\n          [accept]=\"config.acceptedFiles || '*'\"\n        />\n        <input\n          *ngIf=\"!isMultiple\"\n          [hidden]=\"true\"\n          type=\"file\"\n          [disabled]=\"disabled || maxReached\"\n          (change)=\"onFileInputChange($event)\"\n          [accept]=\"config.acceptedFiles || '*'\"\n        />\n        <div class=\"flex-v\">\n          <span *ngIf=\"isConfigLoaded\">\n            {{ placeholder }}\n          </span>\n          <i *ngIf=\"disabled\">\n            (disabled)\n          </i>\n        </div>\n        <span *ngIf=\"!isConfigLoaded\">\n          [config] is waiting for variable config:\n          FormFirebaseFilesConfiguration to resolve\n        </span>\n        <div class=\"max-files\" *ngIf=\"maxReached && !disabled\">\n          Max Uploaded - Limit of {{ config.maxFiles }} file(s) reached. Remove\n          files to change uploads\n        </div>\n      </label>\n      <lib-uploaded-files-list\n        [disabled]=\"disabled\"\n        [uploadedFiles]=\"this.value\"\n        (clickRemoveTag)=\"this.clickRemoveTag($event)\"\n      >\n      </lib-uploaded-files-list>\n    </div>\n  ",
            providers: [
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseFilesComponent_1; }),
                    multi: true
                },
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALIDATORS"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseFilesComponent_1; }),
                    multi: true
                }
            ],
            styles: ["\n      .custom-file-upload {\n        border: 4px dashed #ccc;\n        display: inline-block;\n        padding: 35px 0px;\n        cursor: pointer;\n        width: calc(100% - 8px);\n        text-align: center;\n        font-size: 1.5em;\n        color: #777;\n      }\n      .dragover {\n        background: #ddd;\n      }\n      .max-files {\n        font-size: 0.9em;\n        color: orange;\n        font-style: italic;\n      }\n      .flex-v {\n        display: flex;\n        align-items: center;\n        flex-direction: column;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_utils_notification_service__WEBPACK_IMPORTED_MODULE_7__["NotificationService"]])
    ], FormFirebaseFilesComponent);
    return FormFirebaseFilesComponent;
}(_form_base_class__WEBPACK_IMPORTED_MODULE_6__["FormBase"]));



/***/ }),

/***/ "../mat-firebase-upload/src/lib/form-controls/form-firebase-image.component.ts":
/*!*************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/form-controls/form-firebase-image.component.ts ***!
  \*************************************************************************************/
/*! exports provided: FormFirebaseImageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseImageComponent", function() { return FormFirebaseImageComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _form_base_class__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../form-base-class */ "../mat-firebase-upload/src/lib/form-base-class.ts");
/* harmony import */ var _utils_notification_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/notification.service */ "../mat-firebase-upload/src/lib/utils/notification.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _subcomponents_preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../subcomponents/preview-images/components/preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");
/* harmony import */ var _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../firebase/uploads-manager */ "../mat-firebase-upload/src/lib/firebase/uploads-manager.ts");
/* harmony import */ var _utils_simple_logger__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/simple-logger */ "../mat-firebase-upload/src/lib/utils/simple-logger.ts");











var FormFirebaseImageComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](FormFirebaseImageComponent, _super);
    function FormFirebaseImageComponent(ns, dialog) {
        var _this = _super.call(this) || this;
        _this.ns = ns;
        _this.dialog = dialog;
        _this.placeholder = 'Attached Files';
        _this.uploadMessage = 'Upload an Image Here';
        // tslint:disable-next-line: no-output-on-prefix
        _this.uploadStatusChanged = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        _this.destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_3__["Subject"]();
        _this.isDraggingOnTop = false;
        _this.hasLoaded = false;
        _this.hasError = false;
        return _this;
    }
    FormFirebaseImageComponent_1 = FormFirebaseImageComponent;
    Object.defineProperty(FormFirebaseImageComponent.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (config) {
            this._config = config || {};
            this.initUploadManager();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFirebaseImageComponent.prototype, "isConfigLoaded", {
        get: function () {
            var c = this.config;
            return !!c && !!c.directory && (!!c.firebaseApp || !!c.firebaseConfig);
        },
        enumerable: true,
        configurable: true
    });
    FormFirebaseImageComponent.prototype.writeValue = function (value) {
        if (typeof value === 'object') {
            this.value = value;
        }
        else {
            this.value = null;
        }
    };
    FormFirebaseImageComponent.prototype.ngOnInit = function () { };
    FormFirebaseImageComponent.prototype.ngOnDestroy = function () {
        this.destroyUploadManager();
    };
    FormFirebaseImageComponent.prototype.destroyUploadManager = function () {
        this.destroyed.next();
        if (this.um) {
            this.um.onDestroy();
        }
    };
    FormFirebaseImageComponent.prototype.initUploadManager = function () {
        var _this = this;
        this.logger = new _utils_simple_logger__WEBPACK_IMPORTED_MODULE_10__["SimpleLogger"](this.debug, '[form-firebase-image]');
        this.destroyUploadManager();
        var $internalChangesTap = this.internalControl.valueChanges.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["takeUntil"])(this.destroyed), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["tap"])(function (files) { return _this.logger.log('$internalChangesTap', { files: files }); }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["map"])(function (file) { return [file]; }));
        this.um = new _firebase_uploads_manager__WEBPACK_IMPORTED_MODULE_9__["UploadsManager"](this.config, this.ns, this.uploadStatusChanged, $internalChangesTap, [this.value], this.logger);
        this.um.$currentFiles.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["takeUntil"])(this.destroyed)).subscribe(function (vals) {
            if (Array.isArray(vals)) {
                _this.value = vals.slice().pop();
            }
        });
    };
    FormFirebaseImageComponent.prototype.onImageClicked = function ($event, imageurl) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dialog.open(_subcomponents_preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_8__["PreviewImagePopupComponent"], {
            data: imageurl,
            hasBackdrop: true,
            disableClose: false
        });
    };
    FormFirebaseImageComponent.prototype.clickRemoveTag = function (fileObject) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                this.value = null;
                this.hasError = false;
                this.hasLoaded = false;
                this.um.clickRemoveTag(fileObject);
                return [2 /*return*/];
            });
        });
    };
    FormFirebaseImageComponent.prototype.onFileInputChange = function (event) {
        var files = event.target.files;
        this.hasLoaded = false;
        this.hasError = false;
        this.um.onFileInputChange(files);
    };
    FormFirebaseImageComponent.prototype.onFileDrop = function (event) {
        event.preventDefault();
        if (this.disabled) {
            return;
        }
        var files = event.dataTransfer.files;
        this.hasLoaded = false;
        this.hasError = false;
        this.um.onFileInputChange(files);
    };
    var FormFirebaseImageComponent_1;
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseImageComponent.prototype, "placeholder", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseImageComponent.prototype, "uploadMessage", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object])
    ], FormFirebaseImageComponent.prototype, "config", null);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseImageComponent.prototype, "uploadStatusChanged", void 0);
    FormFirebaseImageComponent = FormFirebaseImageComponent_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            // tslint:disable-next-line: component-selector
            selector: 'form-firebase-image',
            template: "\n    <div class=\"container\">\n      <span class=\"placeholder\">{{ placeholder }}</span>\n      <label\n        class=\"custom-file-upload\"\n        [class.dragover]=\"!disabled && isDraggingOnTop\"\n        (dragover)=\"isDraggingOnTop = true; $event.preventDefault()\"\n        (dragleave)=\"isDraggingOnTop = false\"\n        (drop)=\"isDraggingOnTop = false; onFileDrop($event)\"\n      >\n        <input\n          [hidden]=\"true\"\n          placeholder=\"placeholder\"\n          type=\"file\"\n          [disabled]=\"disabled\"\n          (change)=\"onFileInputChange($event)\"\n          accept=\"image/*\"\n        />\n        <p class=\"upload-message\">{{ uploadMessage }}</p>\n        <div\n          class=\"flex-h max-width justify-around\"\n          *ngIf=\"value?.imageurl as imageurl\"\n        >\n          <div *ngIf=\"!hasLoaded && !hasError\">\n            <div class=\"margin10\">\n              <mat-progress-spinner [diameter]=\"90\" mode=\"indeterminate\">\n              </mat-progress-spinner>\n            </div>\n          </div>\n          <div class=\"relative\" [hidden]=\"!hasLoaded && !hasError\">\n            <button\n              mat-mini-fab\n              color=\"secondary\"\n              class=\"remove-btn\"\n              [disabled]=\"disabled\"\n              (click)=\"clickRemoveTag(value)\"\n              matTooltip=\"Click to replace current image\"\n            >\n              <mat-icon>\n                swap_horiz\n              </mat-icon>\n            </button>\n            <img\n              #img\n              class=\"file-thumb has-pointer\"\n              matTooltip=\"Click to preview image\"\n              (click)=\"onImageClicked($event, imageurl)\"\n              [src]=\"imageurl\"\n              (load)=\"hasLoaded = true\"\n              (error)=\"hasError = true\"\n            />\n          </div>\n        </div>\n        <div\n          class=\"full-width\"\n          *ngIf=\"(this.uploadStatusChanged | async) == true && value\"\n        >\n          <mat-progress-bar\n            class=\"progress\"\n            mode=\"determinate\"\n            [value]=\"value?.value?.props?.progress\"\n          ></mat-progress-bar>\n        </div>\n      </label>\n    </div>\n  ",
            providers: [
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseImageComponent_1; }),
                    multi: true
                },
                {
                    provide: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALIDATORS"],
                    useExisting: Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["forwardRef"])(function () { return FormFirebaseImageComponent_1; }),
                    multi: true
                }
            ],
            styles: ["\n      .relative {\n        position: relative;\n      }\n      .container {\n        display: flex;\n        flex-direction: column;\n        position: relative;\n      }\n      .placeholder {\n        color: grey;\n        margin-bottom: 5px;\n      }\n      .upload-message {\n        font-size: 1.5em;\n        margin-top: 0;\n        margin-bottom: 10px;\n        text-align: center;\n        color: #777;\n        cursor: pointer;\n      }\n      .remove-btn {\n        position: absolute;\n        right: 5px;\n        top: 5px;\n      }\n      .custom-file-upload {\n        display: inline-block;\n        border: 4px dashed #ccc;\n        background: transparent;\n        padding: 10px;\n        cursor: pointer;\n        width: calc(100% - 8px - 20px);\n        min-height: 200px;\n      }\n      .dragover {\n        background: #ddd;\n      }\n      .justify-around {\n        justify-content: space-around;\n      }\n      .flex-h {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n      }\n      .has-pointer {\n        cursor: pointer;\n      }\n      .file-thumb {\n        width: auto;\n        max-height: 250px;\n        max-width: 100%;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_utils_notification_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"], _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatDialog"]])
    ], FormFirebaseImageComponent);
    return FormFirebaseImageComponent;
}(_form_base_class__WEBPACK_IMPORTED_MODULE_5__["FormBase"]));



/***/ }),

/***/ "../mat-firebase-upload/src/lib/lib.module.ts":
/*!****************************************************!*\
  !*** ../mat-firebase-upload/src/lib/lib.module.ts ***!
  \****************************************************/
/*! exports provided: MatFirebaseUploadModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MatFirebaseUploadModule", function() { return MatFirebaseUploadModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _utils_notification_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/notification.service */ "../mat-firebase-upload/src/lib/utils/notification.service.ts");
/* harmony import */ var _subcomponents_form_file_uploader_list_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./subcomponents/form-file-uploader-list.component */ "../mat-firebase-upload/src/lib/subcomponents/form-file-uploader-list.component.ts");
/* harmony import */ var _form_controls_form_firebase_image_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./form-controls/form-firebase-image.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-image.component.ts");
/* harmony import */ var _form_controls_form_firebase_files_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./form-controls/form-firebase-files.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-files.component.ts");
/* harmony import */ var _subcomponents_form_firebase_files_viewer_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./subcomponents/form-firebase-files-viewer.component */ "../mat-firebase-upload/src/lib/subcomponents/form-firebase-files-viewer.component.ts");
/* harmony import */ var _form_controls_form_firebase_file_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./form-controls/form-firebase-file.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-file.component.ts");
/* harmony import */ var _subcomponents_preview_images_lib_preview_images_module__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./subcomponents/preview-images/lib-preview-images.module */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/lib-preview-images.module.ts");












var shared = [
    _form_controls_form_firebase_files_component__WEBPACK_IMPORTED_MODULE_8__["FormFirebaseFilesComponent"],
    _form_controls_form_firebase_file_component__WEBPACK_IMPORTED_MODULE_10__["FormFirebaseFileComponent"],
    _form_controls_form_firebase_image_component__WEBPACK_IMPORTED_MODULE_7__["FormFirebaseImageComponent"],
    _subcomponents_form_firebase_files_viewer_component__WEBPACK_IMPORTED_MODULE_9__["FormFirebaseFilesViewerComponent"],
];
var MatFirebaseUploadModule = /** @class */ (function () {
    function MatFirebaseUploadModule() {
    }
    MatFirebaseUploadModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_4__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatDialogModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatTooltipModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatProgressBarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatProgressSpinnerModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatSnackBarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatInputModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatIconModule"],
                _subcomponents_preview_images_lib_preview_images_module__WEBPACK_IMPORTED_MODULE_11__["LibPreviewImagesModule"]
            ],
            exports: shared.concat([_subcomponents_preview_images_lib_preview_images_module__WEBPACK_IMPORTED_MODULE_11__["LibPreviewImagesModule"]]),
            declarations: [_subcomponents_form_file_uploader_list_component__WEBPACK_IMPORTED_MODULE_6__["FormFileUploadedFileListComponent"]].concat(shared),
            providers: [_utils_notification_service__WEBPACK_IMPORTED_MODULE_5__["NotificationService"]]
        })
    ], MatFirebaseUploadModule);
    return MatFirebaseUploadModule;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/form-file-uploader-list.component.ts":
/*!*****************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/form-file-uploader-list.component.ts ***!
  \*****************************************************************************************/
/*! exports provided: FormFileUploadedFileListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormFileUploadedFileListComponent", function() { return FormFileUploadedFileListComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./preview-images/components/preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");




var FormFileUploadedFileListComponent = /** @class */ (function () {
    function FormFileUploadedFileListComponent(dialog) {
        this.dialog = dialog;
        this.placeholder = 'Uploaded Files:';
        this.uploadedFiles = [];
        this.clickRemoveTag = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
    }
    FormFileUploadedFileListComponent.prototype.clickedImage = function (imageurl) {
        this.dialog.open(_preview_images_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_3__["PreviewImagePopupComponent"], {
            data: imageurl,
            hasBackdrop: true,
            disableClose: false
        });
    };
    FormFileUploadedFileListComponent.prototype.getProgress = function (file) {
        var isDone = this.isDone(file);
        if (isDone) {
            return 100;
        }
        if (file && file.value && file.value.props) {
            var p = file.value.props.progress;
            return p * 0.95; // 95% until download completed
        }
        return 100;
    };
    FormFileUploadedFileListComponent.prototype.isDone = function (file) {
        if (file && file.value && file.value.props) {
            var isCompleted = file.value.props.completed || file.value.props.progress === 100;
            return isCompleted;
        }
        return false;
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFileUploadedFileListComponent.prototype, "placeholder", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Boolean)
    ], FormFileUploadedFileListComponent.prototype, "disabled", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Array)
    ], FormFileUploadedFileListComponent.prototype, "uploadedFiles", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFileUploadedFileListComponent.prototype, "clickRemoveTag", void 0);
    FormFileUploadedFileListComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'lib-uploaded-files-list',
            template: "\n    <p *ngIf=\"uploadedFiles?.length\">{{placeholder}}</p>\n    <div>\n      <div *ngFor=\"let file of uploadedFiles\">\n        <div class=\"full-width flex-h justify-between\">\n          <div class=\"flex-h has-ellipsis\">\n            <mat-icon *ngIf=\"!disabled && isDone(file)\">done</mat-icon>\n            <a class=\"flex-h has-ellipsis\" [href]=\"file.id\" target=\"_blank\">\n              <img class=\"file-icon\" image [src]=\"file['fileicon']\" />\n              <span class=\"has-ellipsis\">{{ file.value.name }}</span>\n              <mat-icon class=\"i-open\">open_in_new</mat-icon>\n            </a>\n          </div>\n          <div class=\"flex-h\">\n            <div class=\"flex-h\" *ngIf=\"file['imageurl'] as imageurl\">\n              <div\n                class=\"full-width\"\n                *ngIf=\"!img.hasLoaded && !img.hasError\"\n              >\n                <div class=\"margin10\">\n                  <mat-progress-spinner [diameter]=\"30\" mode=\"indeterminate\">\n                  </mat-progress-spinner>\n                </div>\n              </div>\n              <img\n                #img\n                class=\"file-thumb has-pointer\"\n                matTooltip=\"Click to preview image\"\n                (click)=\"clickedImage(imageurl)\"\n                [src]=\"imageurl\"\n                [hidden]=\"!img.hasLoaded && !img.hasError\"\n                (load)=\"img.hasLoaded = true\"\n                (error)=\"img.hasError = true\"\n              />\n            </div>\n            <mat-icon\n              *ngIf=\"!disabled\"\n              class=\"has-pointer\"\n              (click)=\"this.clickRemoveTag.emit(file)\"\n              >cancel</mat-icon\n            >\n          </div>\n        </div>\n        <div class=\"full-width\">\n          <mat-progress-bar\n            class=\"progress\"\n            mode=\"determinate\"\n            [value]=\"getProgress(file)\"\n          ></mat-progress-bar>\n        </div>\n      </div>\n    </div>\n  ",
            styles: ["\n      .full-width {\n        width: 100%;\n      }\n      .flex-h {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n      }\n      .justify-between {\n        justify-content: space-between;\n      }\n      .has-pointer {\n        cursor: pointer;\n      }\n      .file-link {\n        display: flex;\n        align-items: center;\n      }\n      .file-thumb,\n      .file-icon {\n        margin: 3px;\n        height: 30px;\n        width: auto;\n        max-width: 60px;\n      }\n      .file-thumb {\n        background-color: #ddd;\n      }\n      .i-open {\n        font-size: 1em;\n      }\n      .has-ellipsis {\n        text-overflow: ellipsis;\n        overflow: hidden;\n        white-space: nowrap;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialog"]])
    ], FormFileUploadedFileListComponent);
    return FormFileUploadedFileListComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/form-firebase-files-viewer.component.ts":
/*!********************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/form-firebase-files-viewer.component.ts ***!
  \********************************************************************************************/
/*! exports provided: FormFirebaseFilesViewerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseFilesViewerComponent", function() { return FormFirebaseFilesViewerComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");


var FormFirebaseFilesViewerComponent = /** @class */ (function () {
    function FormFirebaseFilesViewerComponent() {
        this.placeholder = 'No Files...';
    }
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Array)
    ], FormFirebaseFilesViewerComponent.prototype, "value", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], FormFirebaseFilesViewerComponent.prototype, "placeholder", void 0);
    FormFirebaseFilesViewerComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'form-firebase-files-viewer',
            template: "\n    <ng-template #noFiles>\n      <h4 class=\"no-files\">\n        {{ placeholder }}\n      </h4>\n    </ng-template>\n    <lib-uploaded-files-list\n      *ngIf=\"value?.length; else noFiles\"\n      [disabled]=\"true\"\n      [uploadedFiles]=\"value\"\n    >\n    </lib-uploaded-files-list>\n  ",
            styles: ["\n      .no-files {\n        color: grey;\n        text-align: center;\n      }\n    "]
        })
    ], FormFirebaseFilesViewerComponent);
    return FormFirebaseFilesViewerComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/img-with-loader.component.ts":
/*!***********************************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/preview-images/components/img-with-loader.component.ts ***!
  \***********************************************************************************************************/
/*! exports provided: LibImgWithLoaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LibImgWithLoaderComponent", function() { return LibImgWithLoaderComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "../../node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _preview_image_popup_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");




var LibImgWithLoaderComponent = /** @class */ (function () {
    function LibImgWithLoaderComponent(dialog) {
        this.dialog = dialog;
        this.hasLoaded = false;
        this.hasError = false;
        this.aspectRatio = 0;
    }
    Object.defineProperty(LibImgWithLoaderComponent.prototype, "src", {
        get: function () {
            return this._src;
        },
        set: function (src) {
            this.hasError = false;
            this.hasLoaded = false;
            this._src = src;
        },
        enumerable: true,
        configurable: true
    });
    LibImgWithLoaderComponent.prototype.clickedImage = function (imageurl) {
        this.dialog.open(_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_3__["PreviewImagePopupComponent"], {
            data: imageurl,
            hasBackdrop: true,
            disableClose: false
        });
    };
    LibImgWithLoaderComponent.prototype.onLoaded = function (img) {
        console.log({ img: img });
        var naturalHeight = img.naturalHeight, naturalWidth = img.naturalWidth;
        this.aspectRatio = naturalHeight / naturalWidth;
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", String),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [String])
    ], LibImgWithLoaderComponent.prototype, "src", null);
    LibImgWithLoaderComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'img-with-loader',
            template: "\n    <div\n      class=\"container\"\n      [ngStyle]=\"{ 'padding-bottom': aspectRatio * 100 + '%' }\"\n      [class.height-auto]=\"!hasLoaded\"\n    >\n      <div class=\"full-width justify bg-grey\" *ngIf=\"!hasLoaded\">\n        <div class=\"margin10\">\n          <mat-progress-spinner [diameter]=\"80\" mode=\"indeterminate\">\n          </mat-progress-spinner>\n        </div>\n      </div>\n      <img\n        image\n        #img\n        class=\"image-fit has-pointer\"\n        [hidden]=\"!hasLoaded && !hasError\"\n        (click)=\"clickedImage(src)\"\n        [src]=\"src\"\n        (load)=\"onLoaded(img); hasLoaded = true\"\n        (error)=\"hasError = true\"\n      />\n    </div>\n  ",
            styles: ["\n      .bg-grey {\n        background-color: #dddddd78;\n      }\n      .justify {\n        display: flex;\n        justify-content: center;\n      }\n      .full-width {\n        width: 100%;\n      }\n      .margin10 {\n        margin: 50px;\n      }\n      .container {\n        position: relative;\n        height: 0;\n      }\n      .image-fit {\n        position: absolute;\n        left: 0;\n        top: 0;\n        height: 100%;\n        width: 100%;\n        object-fit: cover;\n        object-position: center center;\n      }\n      .height-auto {\n        height: auto;\n      }\n      .has-pointer {\n        cursor: pointer;\n      }\n      :host {\n        display: block;\n        left: 0;\n        width: 100%;\n        height: 100%;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialog"]])
    ], LibImgWithLoaderComponent);
    return LibImgWithLoaderComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-gallery.component.ts":
/*!***********************************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-gallery.component.ts ***!
  \***********************************************************************************************************/
/*! exports provided: PreviewGalleryComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PreviewGalleryComponent", function() { return PreviewGalleryComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");


var PreviewGalleryComponent = /** @class */ (function () {
    function PreviewGalleryComponent() {
        this.aspectRatio = 1;
    }
    Object.defineProperty(PreviewGalleryComponent.prototype, "imageUrls", {
        get: function () {
            return this._imageUrls;
        },
        set: function (imageUrls) {
            if (imageUrls) {
                this._imageUrls = imageUrls;
            }
            else {
                this._imageUrls = ['https://via.placeholder.com/100x100'];
            }
        },
        enumerable: true,
        configurable: true
    });
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Array),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Array])
    ], PreviewGalleryComponent.prototype, "imageUrls", null);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], PreviewGalleryComponent.prototype, "aspectRatio", void 0);
    PreviewGalleryComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'preview-gallery',
            template: "\n    <div class=\"gallery\">\n      <div class=\"gallery-item\" *ngFor=\"let url of imageUrls\">\n        <preview-image [src]=\"url\" [aspectRatio]=\"1\"> </preview-image>\n      </div>\n    </div>\n  ",
            styles: ["\n      .gallery {\n        display: flex;\n      }\n      .gallery-item {\n        margin-right: 15px;\n        margin-top: 15px;\n        width: 100px;\n      }\n    "]
        })
    ], PreviewGalleryComponent);
    return PreviewGalleryComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts":
/*!***************************************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts ***!
  \***************************************************************************************************************/
/*! exports provided: PreviewImagePopupComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PreviewImagePopupComponent", function() { return PreviewImagePopupComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");



var PreviewImagePopupComponent = /** @class */ (function () {
    function PreviewImagePopupComponent(dialogRef, imageSrc) {
        this.dialogRef = dialogRef;
        this.imageSrc = imageSrc;
    }
    PreviewImagePopupComponent.prototype.onCancel = function () {
        this.dialogRef.close();
    };
    PreviewImagePopupComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'preview-image-popup',
            template: "\n    <div class=\"relative\">\n      <button class=\"absolute z1 btn-close\" mat-mini-fab (click)=\"onCancel()\">\n        <mat-icon>clear</mat-icon>\n      </button>\n      <a\n        class=\"absolute z1 btn-download\"\n        mat-mini-fab\n        target=\"_blank\"\n        [href]=\"imageSrc\"\n      >\n        <mat-icon>open_in_new</mat-icon>\n      </a>\n      <div\n        class=\"justify bg-grey\"\n        *ngIf=\"!img.hasLoaded && !img.hasError\"\n      >\n        <div class=\"margin10\">\n          <mat-progress-spinner [diameter]=\"90\" mode=\"indeterminate\">\n          </mat-progress-spinner>\n        </div>\n      </div>\n      <img\n        #img\n        class=\"fill\"\n        [src]=\"imageSrc\"\n        [hidden]=\"!img.hasLoaded && !img.hasError\"\n        (load)=\"img.hasLoaded = true\"\n        (error)=\"img.hasError = true\"\n      />\n    </div>\n  ",
            styles: ["\n      .z1 {\n        z-index: 1;\n      }\n      .relative {\n        position: relative;\n      }\n      .absolute {\n        position: absolute;\n      }\n      .btn-close {\n        right: 10px;\n        top: 10px;\n      }\n      .btn-download {\n        right: 10px;\n        bottom: 10px;\n      }\n      .bg-grey {\n        background-color: #dddddd78;\n      }\n      .margin10 {\n        margin: 70px;\n      }\n      .justify {\n        display: flex;\n        justify-content: center;\n      }\n      .fill {\n        max-height: 90vh;\n        max-width: 100%;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], String])
    ], PreviewImagePopupComponent);
    return PreviewImagePopupComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image.component.ts":
/*!*********************************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image.component.ts ***!
  \*********************************************************************************************************/
/*! exports provided: PreviewImageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PreviewImageComponent", function() { return PreviewImageComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ "../../node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _preview_image_popup_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");





var PreviewImageComponent = /** @class */ (function () {
    function PreviewImageComponent(sanitizer, dialog) {
        this.sanitizer = sanitizer;
        this.dialog = dialog;
        this.aspectRatio = 1;
    }
    Object.defineProperty(PreviewImageComponent.prototype, "src", {
        get: function () {
            return this._src;
        },
        set: function (src) {
            if (src) {
                this._src = src;
            }
            else {
                this._src = 'https://via.placeholder.com/200x100';
            }
        },
        enumerable: true,
        configurable: true
    });
    PreviewImageComponent.prototype.clickedImage = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var ref;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                ref = this.dialog.open(_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_4__["PreviewImagePopupComponent"], {
                    hasBackdrop: true,
                    data: this.src
                });
                return [2 /*return*/];
            });
        });
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", String),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [String])
    ], PreviewImageComponent.prototype, "src", null);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], PreviewImageComponent.prototype, "aspectRatio", void 0);
    PreviewImageComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'preview-image',
            template: "\n    <div class=\"outer\">\n      <div\n        class=\"outer-before\"\n        [style.paddingTop]=\"\n          sanitizer.bypassSecurityTrustStyle(\n            'calc(1/(' + aspectRatio + ') * 100%)'\n          )\n        \"\n      ></div>\n      <div\n        class=\"inner has-pointer\"\n        [style.backgroundImage]=\"'url(' + src + ')'\"\n        [style.backgroundSize]=\"'cover'\"\n        (click)=\"clickedImage()\"\n      ></div>\n    </div>\n  ",
            styles: ["\n      /* made with: https://ratiobuddy.com/ */\n      .outer {\n        position: relative;\n      }\n      .outer-before {\n        display: block;\n        content: '';\n        width: 100%;\n        padding-top: 50%; /* default aspect ratio */\n      }\n      .outer > .inner {\n        position: absolute;\n        top: 0;\n        right: 0;\n        bottom: 0;\n        left: 0;\n        overflow: hidden;\n      }\n      .has-pointer {\n        cursor: pointer;\n      }\n\n      img {\n        width: 100%;\n      }\n    "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["DomSanitizer"], _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatDialog"]])
    ], PreviewImageComponent);
    return PreviewImageComponent;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/subcomponents/preview-images/lib-preview-images.module.ts":
/*!************************************************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/subcomponents/preview-images/lib-preview-images.module.ts ***!
  \************************************************************************************************/
/*! exports provided: LibPreviewImagesModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LibPreviewImagesModule", function() { return LibPreviewImagesModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _components_preview_image_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/preview-image.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image.component.ts");
/* harmony import */ var _components_preview_gallery_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/preview-gallery.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-gallery.component.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/preview-image-popup.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/preview-image-popup.component.ts");
/* harmony import */ var _components_img_with_loader_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/img-with-loader.component */ "../mat-firebase-upload/src/lib/subcomponents/preview-images/components/img-with-loader.component.ts");








var exportedComponents = [
    _components_preview_image_component__WEBPACK_IMPORTED_MODULE_3__["PreviewImageComponent"],
    _components_preview_gallery_component__WEBPACK_IMPORTED_MODULE_4__["PreviewGalleryComponent"],
    _components_img_with_loader_component__WEBPACK_IMPORTED_MODULE_7__["LibImgWithLoaderComponent"]
];
var LibPreviewImagesModule = /** @class */ (function () {
    function LibPreviewImagesModule() {
    }
    LibPreviewImagesModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            entryComponents: [_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_6__["PreviewImagePopupComponent"]],
            declarations: exportedComponents.concat([_components_preview_image_popup_component__WEBPACK_IMPORTED_MODULE_6__["PreviewImagePopupComponent"]]),
            exports: exportedComponents.slice(),
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatDialogModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatIconModule"]
            ]
        })
    ], LibPreviewImagesModule);
    return LibPreviewImagesModule;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/case-helper.ts":
/*!***********************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/case-helper.ts ***!
  \***********************************************************/
/*! exports provided: ConvertToTitleCase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConvertToTitleCase", function() { return ConvertToTitleCase; });
function ConvertToTitleCase(input) {
    var capitalsWithSpaces = input.replace(/([A-Z])/g, ' $1').trim();
    var underscoresToSpaces = capitalsWithSpaces.replace(/_/g, ' ');
    return underscoresToSpaces
        .split(' ')
        .map(function (p) { return p.charAt(0).toUpperCase() + p.substr(1).toLowerCase(); })
        .join(' ');
}


/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/file-icon.helper.ts":
/*!****************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/file-icon.helper.ts ***!
  \****************************************************************/
/*! exports provided: FileIcons, fileIcons, getFileIconName, isFileImage, getFileExtension, getFileName, getFileIcon */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileIcons", function() { return FileIcons; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fileIcons", function() { return fileIcons; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileIconName", function() { return getFileIconName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFileImage", function() { return isFileImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileExtension", function() { return getFileExtension; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileName", function() { return getFileName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileIcon", function() { return getFileIcon; });
var FileIcons = /** @class */ (function () {
    function FileIcons() {
    }
    return FileIcons;
}());

var fileIcons = {
    defaultIcon: { name: 'file' },
    icons: [
        { name: 'word', fileExtensions: ['doc', 'docx', 'rtf'] },
        { name: 'pdf', fileExtensions: ['pdf'] },
        { name: 'table', fileExtensions: ['xlsx', 'xls', 'csv', 'tsv'] },
        {
            name: 'html',
            fileExtensions: ['html', 'htm', 'xhtml', 'html_vm', 'asp']
        },
        {
            name: 'markdown',
            fileExtensions: ['md', 'markdown', 'rst']
        },
        { name: 'yaml', fileExtensions: ['yaml', 'YAML-tmLanguage', 'yml'] },
        {
            name: 'xml',
            fileExtensions: [
                'xml',
                'plist',
                'xsd',
                'dtd',
                'xsl',
                'xslt',
                'resx',
                'iml',
                'xquery',
                'tmLanguage',
                'manifest',
                'project'
            ],
            fileNames: ['.htaccess']
        },
        {
            name: 'image',
            fileExtensions: [
                'png',
                'jpeg',
                'jpg',
                'gif',
                'svg',
                'ico',
                'tif',
                'tiff',
                'psd',
                'psb',
                'ami',
                'apx',
                'bmp',
                'bpg',
                'brk',
                'cur',
                'dds',
                'dng',
                'exr',
                'fpx',
                'gbr',
                'img',
                'jbig2',
                'jb2',
                'jng',
                'jxr',
                'pbm',
                'pgf',
                'pic',
                'raw',
                'webp',
                'eps'
            ]
        },
        { name: 'tex', fileExtensions: ['tex', 'cls', 'sty'] },
        {
            name: 'powerpoint',
            fileExtensions: [
                'pptx',
                'ppt',
                'pptm',
                'potx',
                'potm',
                'ppsx',
                'ppsm',
                'pps',
                'ppam',
                'ppa'
            ]
        },
        {
            name: 'video',
            fileExtensions: [
                'webm',
                'mkv',
                'flv',
                'vob',
                'ogv',
                'ogg',
                'gifv',
                'avi',
                'mov',
                'qt',
                'wmv',
                'yuv',
                'rm',
                'rmvb',
                'mp4',
                'm4v',
                'mpg',
                'mp2',
                'mpeg',
                'mpe',
                'mpv',
                'm2v'
            ]
        },
        { name: 'audio', fileExtensions: ['mp3', 'flac', 'm4a', 'wma', 'aiff'] },
        { name: 'document', fileExtensions: ['txt'] }
    ]
};
var getFileIconName = function (filename) {
    filename = filename.toLowerCase();
    if (!filename || !filename.includes('.')) {
        return fileIcons.defaultIcon.name;
    }
    var ext = getFileExtension(filename);
    var matchesExt = fileIcons.icons.filter(function (x) { return !!x.fileExtensions && !!x.fileExtensions.filter(function (y) { return y === ext; }).length; });
    var matchesFilename = fileIcons.icons.filter(function (x) { return !!x.fileNames && !!x.fileNames.filter(function (y) { return y === filename; }).length; });
    if (!!matchesFilename.length) {
        return matchesFilename[0].name;
    }
    else if (!!matchesExt.length) {
        return matchesExt[0].name;
    }
    return fileIcons.defaultIcon.name;
};
var isFileImage = function (filename) {
    return getFileIconName(filename) === 'image';
};
var getFileExtension = function (filename) { return filename.split('.').pop(); };
var getFileName = function (filename) {
    return filename.split('.').slice(-2, -1)[0];
};
var getFileIcon = function (filename) {
    return '/assets/fileicons/' + getFileIconName(filename) + '.svg';
};


/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/img-helpers.ts":
/*!***********************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/img-helpers.ts ***!
  \***********************************************************/
/*! exports provided: blobToDataURL, dataURItoBlob, downscaleImage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blobToDataURL", function() { return blobToDataURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dataURItoBlob", function() { return dataURItoBlob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "downscaleImage", function() { return downscaleImage; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");

// **blob to dataURL**
function blobToDataURL(blob) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
        var reader;
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
            reader = new FileReader();
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    reader.onload = function (e) {
                        resolve(e.target.result);
                    };
                    reader.onerror = function (error) {
                        reject(error);
                    };
                    reader.readAsDataURL(blob);
                })];
        });
    });
}
// Dataurl to blob
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    // create a view into the buffer
    var ia = new Uint8Array(ab);
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;
}
// Take an image URL, downscale it to the given width, and return a new image URL.
function downscaleImage(dataUrl, newWidth, imageQuality, imageType, debug) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
        var image, oldWidth, oldHeight, newHeight, canvas, ctx, newDataUrl;
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Provide default values
                    imageType = imageType || 'image/jpeg';
                    imageQuality = imageQuality || 0.7;
                    image = new Image();
                    image.src = dataUrl;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            image.onload = function () {
                                resolve();
                            };
                        })];
                case 1:
                    _a.sent();
                    oldWidth = image.width;
                    oldHeight = image.height;
                    newHeight = Math.floor((oldHeight / oldWidth) * newWidth);
                    canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, newWidth, newHeight);
                    newDataUrl = canvas.toDataURL(imageType, imageQuality);
                    if (debug) {
                        console.log('quill.imageCompressor: downscaling image...', {
                            args: {
                                dataUrl: dataUrl,
                                newWidth: newWidth,
                                imageType: imageType,
                                imageQuality: imageQuality
                            },
                            image: image,
                            oldWidth: oldWidth,
                            oldHeight: oldHeight,
                            newHeight: newHeight,
                            canvas: canvas,
                            ctx: ctx,
                            newDataUrl: newDataUrl
                        });
                    }
                    return [2 /*return*/, newDataUrl];
            }
        });
    });
}


/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/index.ts":
/*!*****************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/index.ts ***!
  \*****************************************************/
/*! exports provided: ConvertToTitleCase, NotificationService, FileIcons, fileIcons, getFileIconName, isFileImage, getFileExtension, getFileName, getFileIcon, blobToDataURL, dataURItoBlob, downscaleImage, TrimSlashes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _case_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./case-helper */ "../mat-firebase-upload/src/lib/utils/case-helper.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConvertToTitleCase", function() { return _case_helper__WEBPACK_IMPORTED_MODULE_0__["ConvertToTitleCase"]; });

/* harmony import */ var _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./file-icon.helper */ "../mat-firebase-upload/src/lib/utils/file-icon.helper.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FileIcons", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["FileIcons"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "fileIcons", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["fileIcons"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getFileIconName", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["getFileIconName"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFileImage", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["isFileImage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getFileExtension", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["getFileExtension"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getFileName", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["getFileName"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getFileIcon", function() { return _file_icon_helper__WEBPACK_IMPORTED_MODULE_1__["getFileIcon"]; });

/* harmony import */ var _img_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./img-helpers */ "../mat-firebase-upload/src/lib/utils/img-helpers.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "blobToDataURL", function() { return _img_helpers__WEBPACK_IMPORTED_MODULE_2__["blobToDataURL"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dataURItoBlob", function() { return _img_helpers__WEBPACK_IMPORTED_MODULE_2__["dataURItoBlob"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "downscaleImage", function() { return _img_helpers__WEBPACK_IMPORTED_MODULE_2__["downscaleImage"]; });

/* harmony import */ var _notification_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./notification.service */ "../mat-firebase-upload/src/lib/utils/notification.service.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NotificationService", function() { return _notification_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"]; });

/* harmony import */ var _path_helpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./path-helpers */ "../mat-firebase-upload/src/lib/utils/path-helpers.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TrimSlashes", function() { return _path_helpers__WEBPACK_IMPORTED_MODULE_4__["TrimSlashes"]; });








/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/notification.service.ts":
/*!********************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/notification.service.ts ***!
  \********************************************************************/
/*! exports provided: NotificationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotificationService", function() { return NotificationService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");



var NotificationService = /** @class */ (function () {
    function NotificationService(matSnackbar) {
        this.matSnackbar = matSnackbar;
    }
    NotificationService.prototype.notify = function (msg, title, isError) {
        return this.matSnackbar.open(msg, title, {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    };
    NotificationService.prototype.notifyCancelled = function () {
        return this.notify('Cancelled Operation');
    };
    NotificationService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSnackBar"]])
    ], NotificationService);
    return NotificationService;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/path-helpers.ts":
/*!************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/path-helpers.ts ***!
  \************************************************************/
/*! exports provided: TrimSlashes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TrimSlashes", function() { return TrimSlashes; });
function TrimSlashes(inputPath) {
    return inputPath.replace(/^\/+|\/+$/g, '');
}


/***/ }),

/***/ "../mat-firebase-upload/src/lib/utils/simple-logger.ts":
/*!*************************************************************!*\
  !*** ../mat-firebase-upload/src/lib/utils/simple-logger.ts ***!
  \*************************************************************/
/*! exports provided: SimpleLogger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SimpleLogger", function() { return SimpleLogger; });
var SimpleLogger = /** @class */ (function () {
    function SimpleLogger(debug, logPrefix) {
        if (logPrefix === void 0) { logPrefix = 'simple-logger:: '; }
        this.debug = debug;
        this.logPrefix = logPrefix;
    }
    Object.defineProperty(SimpleLogger.prototype, "log", {
        get: function () {
            if (!this.debug) {
                return function () {
                    var any = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        any[_i] = arguments[_i];
                    }
                };
            }
            var boundLogFn = console.log.bind(console, this.logPrefix);
            return boundLogFn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleLogger.prototype, "error", {
        get: function () {
            if (!this.debug) {
                return function () {
                    var any = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        any[_i] = arguments[_i];
                    }
                };
            }
            var bounderrorFn = console.error.bind(console, this.logPrefix);
            return bounderrorFn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleLogger.prototype, "warn", {
        get: function () {
            if (!this.debug) {
                return function () {
                    var any = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        any[_i] = arguments[_i];
                    }
                };
            }
            var boundLogFn = console.warn.bind(console, this.logPrefix);
            return boundLogFn;
        },
        enumerable: true,
        configurable: true
    });
    return SimpleLogger;
}());



/***/ }),

/***/ "../mat-firebase-upload/src/public-api.ts":
/*!************************************************!*\
  !*** ../mat-firebase-upload/src/public-api.ts ***!
  \************************************************/
/*! exports provided: MatFirebaseUploadModule, FormFirebaseFileComponent, FormFirebaseFilesComponent, FormFirebaseImageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_lib_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/lib.module */ "../mat-firebase-upload/src/lib/lib.module.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MatFirebaseUploadModule", function() { return _lib_lib_module__WEBPACK_IMPORTED_MODULE_0__["MatFirebaseUploadModule"]; });

/* harmony import */ var _lib_form_controls_form_firebase_file_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/form-controls/form-firebase-file.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-file.component.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseFileComponent", function() { return _lib_form_controls_form_firebase_file_component__WEBPACK_IMPORTED_MODULE_1__["FormFirebaseFileComponent"]; });

/* harmony import */ var _lib_form_controls_form_firebase_files_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/form-controls/form-firebase-files.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-files.component.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseFilesComponent", function() { return _lib_form_controls_form_firebase_files_component__WEBPACK_IMPORTED_MODULE_2__["FormFirebaseFilesComponent"]; });

/* harmony import */ var _lib_form_controls_form_firebase_image_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/form-controls/form-firebase-image.component */ "../mat-firebase-upload/src/lib/form-controls/form-firebase-image.component.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FormFirebaseImageComponent", function() { return _lib_form_controls_form_firebase_image_component__WEBPACK_IMPORTED_MODULE_3__["FormFirebaseImageComponent"]; });

/*
 * Public API Surface of mat-firebase-upload
 */






/***/ }),

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");


var AppComponent = /** @class */ (function () {
    function AppComponent() {
    }
    AppComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () { return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: "\n    <ul>\n      <h1>Mat Firebase Upload</h1>\n      <li><a routerLink=\"form-firebase-file\">form-firebase-file</a></li>\n      <li><a routerLink=\"form-firebase-files\">form-firebase-files</a></li>\n      <li><a routerLink=\"form-firebase-image\">form-firebase-image</a></li>\n      <li><a routerLink=\"form-firebase-viewers\">form-firebase-viewers</a></li>\n    </ul>\n    <router-outlet> </router-outlet>\n  "
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "../../node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser/animations */ "../../node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "../../node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material */ "../../node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _mat_firebase_upload_src_public_api__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../mat-firebase-upload/src/public-api */ "../mat-firebase-upload/src/public-api.ts");
/* harmony import */ var _test_form_files_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./test-form-files.component */ "./src/app/test-form-files.component.ts");
/* harmony import */ var _test_form_file_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./test-form-file.component */ "./src/app/test-form-file.component.ts");
/* harmony import */ var _test_form_image_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./test-form-image.component */ "./src/app/test-form-image.component.ts");
/* harmony import */ var _test_form_viewers_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./test-form-viewers.component */ "./src/app/test-form-viewers.component.ts");














var entryComponents = [
    _test_form_files_component__WEBPACK_IMPORTED_MODULE_10__["TestFormFilesComponent"],
    _test_form_file_component__WEBPACK_IMPORTED_MODULE_11__["TestFormFileComponent"],
    _test_form_image_component__WEBPACK_IMPORTED_MODULE_12__["TestFormImageComponent"],
    _test_form_viewers_component__WEBPACK_IMPORTED_MODULE_13__["TestFormViewersComponent"]
];
var allRoutes = [
    { path: 'form-firebase-file', component: _test_form_file_component__WEBPACK_IMPORTED_MODULE_11__["TestFormFileComponent"] },
    { path: 'form-firebase-files', component: _test_form_files_component__WEBPACK_IMPORTED_MODULE_10__["TestFormFilesComponent"] },
    { path: 'form-firebase-image', component: _test_form_image_component__WEBPACK_IMPORTED_MODULE_12__["TestFormImageComponent"] },
    { path: 'form-firebase-viewers', component: _test_form_viewers_component__WEBPACK_IMPORTED_MODULE_13__["TestFormViewersComponent"] }
];
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_3__["NgModule"])({
            declarations: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]].concat(entryComponents),
            entryComponents: entryComponents.slice(),
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_2__["BrowserAnimationsModule"],
                _angular_common__WEBPACK_IMPORTED_MODULE_5__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_6__["ReactiveFormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_6__["FormsModule"],
                _mat_firebase_upload_src_public_api__WEBPACK_IMPORTED_MODULE_9__["MatFirebaseUploadModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_7__["RouterModule"].forRoot(allRoutes),
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatTabsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatSlideToggleModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatIconModule"]
            ],
            providers: [],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/file-factory.ts":
/*!*********************************!*\
  !*** ./src/app/file-factory.ts ***!
  \*********************************/
/*! exports provided: blankFile, blankFile2, makeConfig, delay */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blankFile", function() { return blankFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blankFile2", function() { return blankFile2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeConfig", function() { return makeConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "delay", function() { return delay; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../environments/environment */ "./src/environments/environment.ts");


function blankFile(url) {
    return {
        id: url,
        fileicon: '/assets/fileicons/image.svg',
        imageurl: url,
        bucket_path: '',
        value: {
            name: 'imageimageimageimageimageimageimageimageimageimageimageimageimage.jpeg',
            props: {
                thumb: '',
                fileicon: '',
                progress: 100,
                completed: true
            }
        }
    };
}
function blankFile2() {
    return blankFile('https://i.imgur.com/HSdYMMN.jpg');
}
function makeConfig(ms) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
        var config;
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ms) return [3 /*break*/, 2];
                    return [4 /*yield*/, delay(ms)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    config = {
                        directory: "audits/somelocation",
                        firebaseConfig: _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].firebaseConfig,
                        useUuidName: true,
                        acceptedFiles: 'application/pdf,image/*',
                        imageCompressionMaxSize: 1600,
                        imageCompressionQuality: 0.9
                    };
                    return [2 /*return*/, config];
            }
        });
    });
}
function delay(ms) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}


/***/ }),

/***/ "./src/app/test-form-file.component.ts":
/*!*********************************************!*\
  !*** ./src/app/test-form-file.component.ts ***!
  \*********************************************/
/*! exports provided: TestFormFileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TestFormFileComponent", function() { return TestFormFileComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _file_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./file-factory */ "./src/app/file-factory.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");




var TestFormFileComponent = /** @class */ (function () {
    function TestFormFileComponent() {
        var _this = this;
        this.enabledControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](true);
        this.controlFile = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])("https://i.imgur.com/uUL3zYD.jpg"));
        this.enabledControl.valueChanges.subscribe(function (isEnabled) {
            if (isEnabled) {
                _this.controlFile.enable();
            }
            else {
                _this.controlFile.disable();
            }
        });
    }
    TestFormFileComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["delay"])(1000)];
                    case 1:
                        _b.sent();
                        this.controlFile.setValue(Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])("https://i.imgur.com/ioqsdHZ.jpeg"));
                        _a = this;
                        return [4 /*yield*/, Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["makeConfig"])(3000)];
                    case 2:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TestFormFileComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            template: "\n    <h2>File Uploader/Viewer Control</h2>\n    <div>\n      <h5>Control Enabled({{ enabledControl.value | json }})</h5>\n      <mat-slide-toggle [formControl]=\"enabledControl\"> </mat-slide-toggle>\n    </div>\n    <div class=\"container-2cols\">\n      <form-firebase-file\n        *ngIf=\"controlFile\"\n        [config]=\"config\"\n        [formControl]=\"controlFile\"\n        debug=\"true\"\n      >\n      </form-firebase-file>\n      <pre>{{ controlFile?.value | json }}</pre>\n    </div>\n  "
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], TestFormFileComponent);
    return TestFormFileComponent;
}());



/***/ }),

/***/ "./src/app/test-form-files.component.ts":
/*!**********************************************!*\
  !*** ./src/app/test-form-files.component.ts ***!
  \**********************************************/
/*! exports provided: TestFormFilesComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TestFormFilesComponent", function() { return TestFormFilesComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _file_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./file-factory */ "./src/app/file-factory.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");





var TestFormFilesComponent = /** @class */ (function () {
    function TestFormFilesComponent() {
        var _this = this;
        this.enabledControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](true);
        this.controlFiles = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"]([
            Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/uUL3zYD.jpg'),
            Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/HSdYMMN.jpg')
        ]);
        this.enabledControl.valueChanges.subscribe(function (isEnabled) {
            if (isEnabled) {
                _this.controlFiles.enable();
            }
            else {
                _this.controlFiles.disable();
            }
        });
    }
    TestFormFilesComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["delay"])(1000)];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["makeConfig"])(2000)];
                    case 2:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TestFormFilesComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            template: "\n    <h2>Files Uploader/Viewer Control</h2>\n    <div>\n      <h5>Control Enabled({{ enabledControl.value | json }})</h5>\n      <mat-slide-toggle [formControl]=\"enabledControl\"> </mat-slide-toggle>\n    </div>\n    <div class=\"container-2cols\">\n      <form-firebase-files\n        [formControl]=\"controlFiles\"\n        [config]=\"config\"\n        debug=\"true\"\n      >\n      </form-firebase-files>\n      <pre>{{ controlFiles?.value | json }}</pre>\n    </div>\n  "
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], TestFormFilesComponent);
    return TestFormFilesComponent;
}());



/***/ }),

/***/ "./src/app/test-form-image.component.ts":
/*!**********************************************!*\
  !*** ./src/app/test-form-image.component.ts ***!
  \**********************************************/
/*! exports provided: TestFormImageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TestFormImageComponent", function() { return TestFormImageComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _file_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./file-factory */ "./src/app/file-factory.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");




var TestFormImageComponent = /** @class */ (function () {
    function TestFormImageComponent() {
        var _this = this;
        this.enabledControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](true);
        this.controlImage = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/uUL3zYD.jpg'));
        this.controlImage2 = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/HSdYMMN.jpg'));
        this.enabledControl.valueChanges.subscribe(function (isEnabled) {
            if (isEnabled) {
                _this.controlImage.enable();
                _this.controlImage2.enable();
            }
            else {
                _this.controlImage.disable();
                _this.controlImage2.disable();
            }
        });
    }
    TestFormImageComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["makeConfig"])()];
                    case 1:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TestFormImageComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            template: "\n    <h2>File Uploader/Viewer Control</h2>\n    <div>\n      <h5>Control Enabled({{ enabledControl.value | json }})</h5>\n      <mat-slide-toggle [formControl]=\"enabledControl\"> </mat-slide-toggle>\n    </div>\n    <h2>Image Uploader/Viewer Control</h2>\n    <div class=\"container-2cols\">\n      <form-firebase-image\n        [formControl]=\"controlImage\"\n        [config]=\"config\"\n        debug=\"true\"\n      >\n      </form-firebase-image>\n      <pre>{{ controlImage?.value | json }}</pre>\n    </div>\n    <h2>Image Uploader/Viewer Control2</h2>\n    <div class=\"container-2cols\">\n      <form-firebase-image\n        [formControl]=\"controlImage2\"\n        [config]=\"config\"\n        debug=\"true\"\n      >\n      </form-firebase-image>\n      <pre>{{ controlImage2?.value | json }}</pre>\n    </div>\n  "
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], TestFormImageComponent);
    return TestFormImageComponent;
}());



/***/ }),

/***/ "./src/app/test-form-viewers.component.ts":
/*!************************************************!*\
  !*** ./src/app/test-form-viewers.component.ts ***!
  \************************************************/
/*! exports provided: TestFormViewersComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TestFormViewersComponent", function() { return TestFormViewersComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _file_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./file-factory */ "./src/app/file-factory.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "../../node_modules/@angular/forms/fesm5/forms.js");




var TestFormViewersComponent = /** @class */ (function () {
    function TestFormViewersComponent() {
        var _this = this;
        this.enabledControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"](true);
        this.controlFiles = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormControl"]([
            Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/uUL3zYD.jpg'),
            Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["blankFile"])('https://i.imgur.com/HSdYMMN.jpg')
        ]);
        this.imgUrl = 'https://i.imgur.com/uUL3zYD.jpg';
        this.imgUrls = [
            'https://i.imgur.com/uUL3zYD.jpg',
            'https://i.imgur.com/HSdYMMN.jpg'
        ];
        this.enabledControl.valueChanges.subscribe(function (isEnabled) {
            if (isEnabled) {
                _this.controlFiles.enable();
            }
            else {
                _this.controlFiles.disable();
            }
        });
    }
    TestFormViewersComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Object(_file_factory__WEBPACK_IMPORTED_MODULE_2__["makeConfig"])()];
                    case 1:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TestFormViewersComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            template: "\n    <h2>File Uploader/Viewer Control</h2>\n    <div>\n      <h5>Control Enabled({{ enabledControl.value | json }})</h5>\n      <mat-slide-toggle [formControl]=\"enabledControl\"> </mat-slide-toggle>\n    </div>\n    <h2>Files Viewer Only</h2>\n    <div class=\"container-2cols\">\n      <form-firebase-files-viewer [value]=\"controlFiles.value\">\n      </form-firebase-files-viewer>\n      <pre>{{ controlFiles?.value | json }}</pre>\n    </div>\n    <h2>Image With Loader</h2>\n    <div class=\"container-2cols\">\n      <img-with-loader [src]=\"imgUrl\"></img-with-loader>\n      <pre>{{ imgUrl | json }}</pre>\n    </div>\n    <h2>Image Gallery</h2>\n    <div class=\"container-2cols\">\n      <preview-gallery [imageUrls]=\"imgUrls\"> </preview-gallery>\n      <pre>{{ imgUrls | json }}</pre>\n    </div>\n\n  "
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], TestFormViewersComponent);
    return TestFormViewersComponent;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false,
    firebaseConfig: {
        apiKey: 'AIzaSyBaaNXOsruNPyDrQpKEnw-S-BnvwKlTfR4',
        authDomain: 'comm-unstable.firebaseapp.com',
        databaseURL: 'https://comm-unstable.firebaseio.com',
        projectId: 'comm-unstable',
        storageBucket: 'comm-unstable.appspot.com',
        messagingSenderId: '1061697142615',
        appId: '1:1061697142615:web:23f9c7b10d97acfe'
    }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "../../node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! hammerjs */ "../../node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_4__);





if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/runner/work/mat-firebase-upload/mat-firebase-upload/projects/mat-firebase-upload-demo/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map