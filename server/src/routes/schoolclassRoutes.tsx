import express from "express";
import {
    getClasses,
    createClass,
    updateClass,
    deleteClass, getClass,
} from "../controllers/schoolClassController.js";
import {teacherAuth} from "../auth/teacherAuthenticate.js";

const router = express.Router();
router.use(teacherAuth);

router.get("/list", getClasses);
router.get("/:id", getClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;