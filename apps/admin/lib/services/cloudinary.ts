// apps/admin/lib/services/cloudinary.ts
import { IUploadImageToCloudinary } from '../utils/interfaces/services.interface';
import imageCompression from 'browser-image-compression';

// 🔐 your Cloudinary public config (safe on frontend because it's unsigned)
const CLOUDINARY_UPLOAD_URL =
  'https://api.cloudinary.com/v1_1/dwoubledv/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'noodles_unsigned';

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const uploadImageToCloudinary: IUploadImageToCloudinary = async (
  file,
  url = CLOUDINARY_UPLOAD_URL,
  preset = CLOUDINARY_UPLOAD_PRESET
) => {
  if (!file) return;

  const isImage = file.startsWith('data:image/');
  const isVideo = file.startsWith('data:video/');
  const _file = base64ToFile(file, 'upload.jpg');

  // 🖼 IMAGES
  if (isImage) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(_file, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', preset);

      const result = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const imageData = await result.json();

      // just in case
      if (!imageData.secure_url) {
        console.warn('Cloudinary upload returned no secure_url', imageData);
        return;
      }

      // optional transform (you already had this)
      const originalUrl = imageData.secure_url;
      const transformedUrl = originalUrl.replace(
        '/upload/',
        '/upload/q_80/f_auto/c_scale/'
      );

      return transformedUrl;
    } catch (e) {
      console.error('Error uploading image to Cloudinary', e);
      throw new Error('Error uploading image to Cloudinary');
    }
  }

  // 🎥 VIDEOS
  if (isVideo) {
    const formData = new FormData();
    formData.append('file', _file);
    formData.append('upload_preset', preset);

    const result = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const videoData = await result.json();

    if (!videoData.secure_url) {
      console.warn('Cloudinary video upload returned no secure_url', videoData);
      return;
    }

    const originalUrl = videoData.secure_url;
    const transformedUrl = originalUrl.replace(
      '/upload/',
      '/upload/f_auto,q_auto:eco,w_1080/'
    );

    return transformedUrl;
  }
};