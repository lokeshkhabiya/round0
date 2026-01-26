import express from "express";
import cors from "cors";
import jobApplicationsRouter from "./routers/job_applications.router";
import usersRouter from "./routers/users.router";
import jobPostingRouter from "./routers/job_posting.router";
import interviewRouter from "./routers/interview.router";
import reportRouter from "./routers/report.router";
import mockInterviewRouter from "./routers/mockinterview.router";
import mentorRouter from "./routers/mentor.router";

const PORT = process.env.PORT || 8080;

const app = express();

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"https://admin.zerocv.ai",
	"https://recruiter.zerocv.ai",
	"https://candidate.zerocv.ai",
];

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/job_applications", jobApplicationsRouter);

app.use("/users", usersRouter);

app.use("/job_posting", jobPostingRouter);

app.use("/interview", interviewRouter);

app.use("/report", reportRouter);

app.use("/mockinterview", mockInterviewRouter);

app.use("/mentor", mentorRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
