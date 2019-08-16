export interface FormFileObject {
  id: string;
  fileicon?: string;
  imageurl?: string;
  bucket_path?: string;
  value: {
    name: string;
    props?: {
      thumb?: string;
      fileicon?: string;
      progress?: number;
      completed?: boolean;
    };
  };
}
