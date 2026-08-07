import express from 'express';
import {getStudents, loginStudent, registerStudent} from "../controllers/studentController.js";
import {teacherAuth} from "../auth/teacherAuthenticate.js";

const router = express.Router();


router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get("/:classId", teacherAuth, getStudents);

export default router;
