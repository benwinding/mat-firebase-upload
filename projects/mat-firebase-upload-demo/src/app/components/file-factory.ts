
import { environment } from '../../environments/environment';
import { FormFileObject, FormFirebaseConfigurationBase } from '../from-lib';

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
    await delay(ms);
  }
  const config: FormFirebaseConfigurationBase = {
    directory: `audits/somelocation`,
    firebaseConfig: environment.firebaseConfig,
    useUuidName: true,
    acceptedFiles: 'application/pdf,image/*',
    imageCompressionMaxSize: 1600,
    imageCompressionQuality: 0.9
  };
  return config;
}

export async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}
