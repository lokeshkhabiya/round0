import express, { type RequestHandler } from "express";
import { interviewController } from "../controllers/interview.controller";
import { authenticateInterview } from "../middlewares/interview.middleware";
import multer from "multer";
import { saveMessage, saveToolResult } from '../controllers/interview.controller';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, 
});

router.get("/verify", authenticateInterview as RequestHandler, interviewController.verifyInterview as RequestHandler);
router.post("/end", authenticateInterview as RequestHandler, interviewController.endInterview as RequestHandler);
router.get("/round/:round_id/transcript", authenticateInterview as RequestHandler, interviewController.getRoundTranscript as RequestHandler);
router.get("/round/:round_id/report", authenticateInterview as RequestHandler, interviewController.getRoundReport as RequestHandler);

router.post("/round/:round_id/upload-recording", authenticateInterview as RequestHandler, upload.single("recording") as RequestHandler, interviewController.uploadRecording);
router.post("/evaluate-design",authenticateInterview as RequestHandler, interviewController.evaluateCanvas);
router.post("/evaluate-code", authenticateInterview as RequestHandler, interviewController.evaluateCode);
router.post("/agent-url", authenticateInterview as RequestHandler, interviewController.getAgentUrl as RequestHandler);

router.post("/message", authenticateInterview as RequestHandler, saveMessage as RequestHandler);
router.post("/tool-result", authenticateInterview as RequestHandler, saveToolResult as RequestHandler);

export default router;