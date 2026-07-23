import express from "express";
import {
    getClasses,
    createClass,
    updateClass,
    deleteClass, getClass,
} from "../controllers/schoolClassController.js";
import {teacherAuth} from "../auth/teacherAuthenticate.js";
import {authenticateToken} from "../auth/authenticate.js";

const router = express.Router();
router.get("/list", teacherAuth, getClasses);

router.get("/list/:teacherId", authenticateToken, getClasses);

router.get("/:id", teacherAuth, getClass);
router.post("/", teacherAuth, createClass);
router.put("/:id", teacherAuth, updateClass);
router.delete("/:id", teacherAuth, deleteClass);

export default router;