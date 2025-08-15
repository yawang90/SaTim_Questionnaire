import express from 'express';
import {uploadImage} from "../controllers/editorController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "temp/" });

router.post("/imageUpload", upload.single("upload"), uploadImage);

export default router;
