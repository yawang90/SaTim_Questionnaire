import express from 'express';
import {getStudents, loginStudent, registerStudent} from "../controllers/studentController.js";

const router = express.Router();


router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/get', getStudents)


export default router;
