import express from "express";
import {
    getClasses,
    createClass,
    updateClass,
    deleteClass, getClass,
} from "../controllers/schoolClassController.js";

const router = express.Router();

router.get("/list", getClasses);
router.get("/:id", getClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;