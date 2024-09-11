import { Router } from "express";
import taskRoutes from "./taskRoutes";
import userRoutes from "./userRoutes";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

const router = Router();

router.use("/tasks", taskRoutes);
router.use("/user", userRoutes);

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../swagger.json"), "utf8")
);

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
