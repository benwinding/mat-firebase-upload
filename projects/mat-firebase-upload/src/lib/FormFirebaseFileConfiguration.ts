import { FormFirebaseConfigurationBase } from './FormFirebaseConfigurationBase';

export interface FormFirebaseFileConfiguration extends FormFirebaseConfigurationBase {
  acceptedFiles?: 'image/*' | 'application/pdf' | 'image/*,application/*' | string;
}
