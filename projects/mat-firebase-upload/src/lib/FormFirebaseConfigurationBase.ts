export interface FormFirebaseConfigurationBase {
  directory: string;
  bucketname?: string;
  firebaseConfig?: {};
  firebaseApp?: firebase.app.App;
  imageCompressionQuality?: number;
  imageCompressionMaxSize?: number;
  acceptedFiles?: 'image/*' | 'application/pdf' | 'image/*,application/*' |  string;
}
