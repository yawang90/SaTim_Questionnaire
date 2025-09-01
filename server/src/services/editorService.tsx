import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const saveImage = (file: Express.Multer.File) => {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.renameSync(file.path, filePath);

    return `${process.env.API_URL || 'http://localhost:5000'}/uploads/${filename}`;
};
