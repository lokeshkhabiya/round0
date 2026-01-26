import express, { type RequestHandler } from "express";
import { mentorController } from "../controllers/mentor.controller";
import { authenticateUser } from "../middlewares/user.middleware";

const router = express.Router();

router.post("/create-session", authenticateUser as RequestHandler, mentorController.createMentorSession);
router.post("/message", authenticateUser as RequestHandler, mentorController.conversation);
router.get("/test-connection", mentorController.testConnection);
router.get("/get-sessions", authenticateUser as RequestHandler, mentorController.getMentorSessions);
router.get("/get-messages", authenticateUser as RequestHandler, mentorController.getMentorSessionMessages);

export default router; 