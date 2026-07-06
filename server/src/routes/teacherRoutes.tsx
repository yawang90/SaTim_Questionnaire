import express from 'express';
import {getTeachers, registerTeacher} from "../controllers/teacherController.js";

const router = express.Router();


router.post('/register', registerTeacher);
//router.post('/login', loginTeacher);
router.get('/get', getTeachers)
//router.get('/search', searchTeacher);


export default router;
