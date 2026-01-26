import express, { type RequestHandler } from "express";
import { authenticateUser } from "../middlewares/user.middleware";
import usersController from "../controllers/users.controller";

const router = express.Router();

router.get("/candidate", authenticateUser as RequestHandler, usersController.getUser);
router.get("/get_all_candidates", authenticateUser as RequestHandler, usersController.getAllUsers);
router.get("/get_candidate", authenticateUser as RequestHandler, usersController.getCandidate);


// Candidate profile routes
router.get("/profile", authenticateUser as RequestHandler, usersController.getCandidateProfile);
router.post("/profile", authenticateUser as RequestHandler, usersController.createCandidateProfile);
router.put("/profile", authenticateUser as RequestHandler, usersController.updateCandidateProfile);

// Recruiter profile routes
router.get("/recruiter-profile", authenticateUser as RequestHandler, usersController.getRecruiterProfile);
router.post("/recruiter-profile", authenticateUser as RequestHandler, usersController.createRecruiterProfile);
router.put("/recruiter-profile", authenticateUser as RequestHandler, usersController.updateRecruiterProfile);
router.get("/get_all_recruiters", authenticateUser as RequestHandler, usersController.getAllRecruiters);

export default router;