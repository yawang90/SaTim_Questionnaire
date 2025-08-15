import express from 'express';
import {registerUser} from "../controllers/userController.js";

const router = express.Router();

router.post('/imageUpload', registerUser);

export default router;
