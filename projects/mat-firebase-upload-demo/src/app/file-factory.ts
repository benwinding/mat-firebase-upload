import {
  FormFirebaseConfigurationBase,
  FormFileObject
} from 'mat-firebase-upload/public-api';
import { environment } from '../environments/environment';

export function blankFile(url: string): FormFileObject {
  return {
    id: url,
    fileicon: '/assets/fileicons/image.svg',
    imageurl: url,
    bucket_path: '',
    value: {
      name:
        'imageimageimageimageimageimageimageimageimageimageimageimageimage.jpeg',
      props: {
        thumb: '',
        fileicon: '',
        progress: 100,
        completed: true
      }
    }
  };
}

export function blankFile2(): FormFileObject {
  return blankFile('https://i.imgur.com/HSdYMMN.jpg');
}

export async function makeConfig(ms?: number) {
  if (ms) {
    await new Promise(resolve => setTimeout(() => resolve(), ms));
  }
  const config: FormFirebaseConfigurationBase = {
    directory: `audits/somelocation`,
    firebaseConfig: environment.firebaseConfig,
    useUuidName: true,
    acceptedFiles: 'application/pdf,image/*'
  };
  return config;
}
