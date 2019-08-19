
// **blob to dataURL**
export async function blobToDataURL(blob): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = function(e: any) {
      resolve(e.target.result as string);
    };
    reader.onerror = function(error: any) {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

// Dataurl to blob
export function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

// Take an image URL, downscale it to the given width, and return a new image URL.
export async function downscaleImage(
  dataUrl: string,
  newWidth: number,
  imageQuality: number,
  imageType: string,
  debug?: boolean
) {
  // Provide default values
  imageType = imageType || 'image/jpeg';
  imageQuality = imageQuality || 0.7;

  // Create a temporary image so that we can compute the height of the downscaled image.
  const image = new Image();
  image.src = dataUrl;
  await new Promise(resolve => {
    image.onload = () => {
      resolve();
    };
  });
  const oldWidth = image.width;
  const oldHeight = image.height;
  const newHeight = Math.floor((oldHeight / oldWidth) * newWidth);

  // Create a temporary canvas to draw the downscaled image on.
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw the downscaled image on the canvas and return the new data URL.
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, newWidth, newHeight);
  const newDataUrl = canvas.toDataURL(imageType, imageQuality);
  if (debug) {
    console.log('quill.imageCompressor: downscaling image...', {
      args: {
        dataUrl,
        newWidth,
        imageType,
        imageQuality
      },
      image,
      oldWidth,
      oldHeight,
      newHeight,
      canvas,
      ctx,
      newDataUrl
    });
  }
  return newDataUrl;
}
