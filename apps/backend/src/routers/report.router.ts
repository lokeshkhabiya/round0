import express, { type RequestHandler } from "express";
import reportController from "../controllers/report.controller";
import { authenticateUser } from "../middlewares/user.middleware";

const router = express.Router(); 

router.get("/getReportByInterviewRoundId", authenticateUser as RequestHandler, reportController.getReport as RequestHandler);

export default router;	