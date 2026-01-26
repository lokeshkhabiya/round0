import express, { type RequestHandler } from "express";
import { authenticateUser } from "../middlewares/user.middleware";
import jobPostingController from "../controllers/job_posting.controller";
const router = express.Router();

router.post("/create_job", authenticateUser as RequestHandler , jobPostingController.createJobPosting);

router.get("/get_jobs",authenticateUser as RequestHandler,jobPostingController.getAllJobPosting)

router.get("/get_job_by_id", authenticateUser as RequestHandler, jobPostingController.getJobPostingById);

router.post("/update_job_by_id", authenticateUser as RequestHandler, jobPostingController.updateJobPostingById);

router.post("/delete_job_by_id", authenticateUser as RequestHandler, jobPostingController.deleteJobPostingById);

router.post("/create_mock_job", authenticateUser as RequestHandler, jobPostingController.createMockJobPosting);

export default router;
