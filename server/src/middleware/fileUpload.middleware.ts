import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";

import { storageRepository } from "../modules/storage/storage.repository.js";
import { storageFactory } from "../modules/storage/storage.factory.js";
import { StorageService } from "../modules/storage/storage.service.js";

/* -------------------------------------------------------------------------- */
/*                                MULTER SETUP                                */
/* -------------------------------------------------------------------------- */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime"];

    const allowedDocumentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedTypes = [
      ...allowedImageTypes,
      ...allowedVideoTypes,
      ...allowedDocumentTypes,
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

/* -------------------------------------------------------------------------- */
/*                          HELPER: UPLOAD TO STORAGE                         */
/* -------------------------------------------------------------------------- */

async function uploadToStorage(
  organizationId: number,
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const integration =
    await storageRepository.getActiveIntegration(organizationId);

  if (!integration) {
    throw new Error("No active storage integration found");
  }

  const ext = path.extname(file.originalname);

  const filename = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}${ext}`;

  const adapter = storageFactory(integration as any);

  const storage = new StorageService(adapter as any);

  const fileUrl = await storage.uploadFile(
    file.buffer,
    filename,
    file.mimetype,
  );

  return fileUrl;
}

/* -------------------------------------------------------------------------- */
/*                        COURSE THUMBNAIL UPLOAD                             */
/* -------------------------------------------------------------------------- */

export const uploadCourseThumbnail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const multerMiddleware = upload.single("thumbnail");

  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (req.file) {
        const fileUrl = await uploadToStorage(
          req.user.organizationId,
          req.file,
          "courses/thumbnails",
        );

        req.body.thumbnail = fileUrl;
      }

      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Failed to upload thumbnail",
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                            DEMO VIDEO UPLOAD                               */
/* -------------------------------------------------------------------------- */

export const uploadDemoVideo = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const multerMiddleware = upload.single("demoVideo");

  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (req.file) {
        const fileUrl = await uploadToStorage(
          req.user.organizationId,
          req.file,
          "courses/demo-videos",
        );

        req.body.demoUrl = fileUrl;
      }

      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Failed to upload demo video",
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                           LESSON VIDEO UPLOAD                              */
/* -------------------------------------------------------------------------- */

export const uploadLessonVideo = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const multerMiddleware = upload.single("video");

  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (req.file) {
        const fileUrl = await uploadToStorage(
          req.user.organizationId,
          req.file,
          "courses/lessons/videos",
        );

        req.body.videoUrl = fileUrl;
      }

      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Failed to upload video",
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                       LESSON THUMBNAIL UPLOAD                              */
/* -------------------------------------------------------------------------- */

export const uploadLessonThumbnail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const multerMiddleware = upload.single("videoThumbnail");

  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (req.file) {
        const fileUrl = await uploadToStorage(
          req.user.organizationId,
          req.file,
          "courses/lessons/thumbnails",
        );

        req.body.videoThumbnail = fileUrl;
      }

      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Failed to upload video thumbnail",
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                         LESSON RESOURCE UPLOAD                             */
/* -------------------------------------------------------------------------- */

export const uploadLessonResources = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const multerMiddleware = upload.array("resources", 10);

  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const files = req.files as Express.Multer.File[];

      if (files && files.length > 0) {
        const resources = [];

        for (const file of files) {
          const fileUrl = await uploadToStorage(
            req.user.organizationId,
            file,
            "courses/lessons/resources",
          );

          resources.push({
            title: file.originalname,
            url: fileUrl,
          });
        }

        req.body.resources = resources;
      }

      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Failed to upload resources",
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                             COMBINED MIDDLEWARE                            */
/* -------------------------------------------------------------------------- */

export const uploadCourseFiles = [uploadCourseThumbnail, uploadDemoVideo];

export const uploadLessonFiles = [
  uploadLessonVideo,
  uploadLessonThumbnail,
  uploadLessonResources,
];
