import express from 'express';
import {getStudent, getStudents, loginStudent, registerStudent} from "../controllers/studentController.js";
import {teacherAuth} from "../auth/teacherAuthenticate.js";
import {studentAuth} from "../auth/studentAuthenticate.js";

const router = express.Router();


router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get("/:classId", teacherAuth, getStudents);
router.get("/profile/:id", studentAuth, getStudent);

export default router;
