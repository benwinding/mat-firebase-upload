export interface FormFirebaseConfigurationBase {
  directory: string;
  bucketname?: string;
  firebaseConfig?: {};
  firebaseApp?: firebase.app.App;
  imageCompressionQuality?: number;
  imageCompressionMaxSize?: number;
  acceptedFiles?: 'image/*' | 'application/pdf' | 'image/*,application/*' |  string;
  useUuidName?: boolean;
  deleteOnStorage?: boolean;
  canEditFileNames?: boolean;
}

export type FormFirebaseImageConfiguration = FormFirebaseConfigurationBase;
export type FormFirebaseFileConfiguration = FormFirebaseConfigurationBase;

export interface FormFirebaseFilesConfiguration extends FormFirebaseConfigurationBase {
  maxFiles?: number;
}
