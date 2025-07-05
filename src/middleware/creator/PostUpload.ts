// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../../config/cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req: any, file: any) => {
//     return {
//       folder: "festivia/event_gallery",
//       allowed_formats: ["jpg", "jpeg", "png"],
//       storage,
//       limits: { fileSize: 10 * 1024 * 1024 }, 
//     };
// },
// });


// export const PostUpload = multer({ storage });


import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary";

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "festivia/event_gallery",
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

// Set file size limit to 10MB here
export const PostUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // ✅ 10 MB limit
});
