import { Router } from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  getTrashedTasks,
  postTaskActivity,
  recoverTask,
  trashTask,
  updateTask,
} from "../controllers/taskController";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware";

const router = Router();

router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/get-trashed", protectRoute, isAdminRoute, getTrashedTasks);
router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);
router.get("/recover/:id", protectRoute, recoverTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;
