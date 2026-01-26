import express, { type RequestHandler } from "express";

import { authenticateUser } from "../middlewares/user.middleware";
import jobApplicationsController from "../controllers/job_applications.controller";

const router = express.Router();

router.post("/", authenticateUser as RequestHandler, jobApplicationsController.applyForJob);
router.get("/applied_candidates_for_job", authenticateUser as RequestHandler, jobApplicationsController.getApplicationsForJob);
router.get("/applied_candidates_shortlisted", authenticateUser as RequestHandler, jobApplicationsController.getApplicationsShortlisted);
router.get("/all_applications_by_candidate", authenticateUser as RequestHandler, jobApplicationsController.getApplicationsByCandidate);
router.post("/status", authenticateUser as RequestHandler, jobApplicationsController.updateApplicationStatus);
router.post("/invite_candidate", authenticateUser as RequestHandler, jobApplicationsController.inviteCandidate);
router.post("/recruiter_decision", authenticateUser as RequestHandler, jobApplicationsController.updateRecruiterDecision);

export default router;