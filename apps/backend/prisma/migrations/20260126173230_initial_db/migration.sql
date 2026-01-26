-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('recruiter', 'candidate', 'admin');

-- CreateEnum
CREATE TYPE "JOB_APPLICATION_STATUS" AS ENUM ('pending', 'invited', 'in_progress', 'completed', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "INTERVIEW_ROUND_TYPE" AS ENUM ('skill_assessment', 'behavioral', 'system_design');

-- CreateEnum
CREATE TYPE "RECRUITER_DECISION" AS ENUM ('pending', 'pass', 'fail');

-- CreateEnum
CREATE TYPE "MESSENGER_ROLE" AS ENUM ('ai_interviewer', 'candidate', 'system', 'ai_mentor');

-- CreateEnum
CREATE TYPE "ATTACHMENT_KIND" AS ENUM ('image', 'audio', 'video', 'code', 'document');

-- CreateEnum
CREATE TYPE "INTERVIEW_ROUND_STATUS" AS ENUM ('pending', 'started', 'completed', 'error');

-- CreateEnum
CREATE TYPE "USER_LANGUAGE" AS ENUM ('en', 'hi');

-- CreateEnum
CREATE TYPE "MESSAGE_TYPE" AS ENUM ('text', 'audio', 'tool_call', 'tool_result', 'feedback');

-- CreateEnum
CREATE TYPE "TOOL_TYPE" AS ENUM ('code_editor', 'whiteboard', 'file_upload', 'screen_share', 'feedback');

-- CreateEnum
CREATE TYPE "SERVICE_TYPE" AS ENUM ('openai', 'elevenlabs', 'system');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "role" "USER_ROLE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profile" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "resume_url" TEXT,
    "skills" TEXT[],
    "experience" TEXT[],
    "education" TEXT[],
    "certifications" TEXT[],
    "projects" TEXT[],
    "achievements" TEXT[],
    "interests" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiter_profile" (
    "id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_logo" TEXT,
    "company_website" TEXT,
    "company_description" TEXT,
    "company_location" TEXT,
    "company_size" INTEGER,
    "company_industry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_description" (
    "id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jd_payload" JSONB NOT NULL,
    "is_mock" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_description_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_application" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "job_description_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "JOB_APPLICATION_STATUS" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_session" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_round" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "round_type" "INTERVIEW_ROUND_TYPE" NOT NULL DEFAULT 'skill_assessment',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "status" "INTERVIEW_ROUND_STATUS" NOT NULL DEFAULT 'pending',
    "spoken_language" "USER_LANGUAGE" DEFAULT 'en',
    "zero_score" INTEGER,
    "score_components" JSONB,
    "ai_summary" TEXT,
    "report_data" JSONB,
    "report_generated_at" TIMESTAMP(3),
    "recruiter_decision" "RECRUITER_DECISION" NOT NULL DEFAULT 'pending',
    "decision_at" TIMESTAMP(3),
    "agent_session_id" TEXT,

    CONSTRAINT "interview_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "messenger_role" "MESSENGER_ROLE" NOT NULL,
    "content" JSONB NOT NULL,
    "message_type" "MESSAGE_TYPE" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "conversation_id" TEXT,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "ATTACHMENT_KIND" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_result" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "tool_name" "TOOL_TYPE" NOT NULL,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB NOT NULL,
    "passed" BOOLEAN,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_recording" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_log" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "model_name" TEXT,
    "service_type" "SERVICE_TYPE" NOT NULL DEFAULT 'openai',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_session" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "interview_session_id" TEXT,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_message" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "messenger_role" "MESSENGER_ROLE" NOT NULL,
    "content" JSONB NOT NULL,
    "message_type" "MESSAGE_TYPE" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profile_candidate_id_key" ON "candidate_profile"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_profile_recruiter_id_key" ON "recruiter_profile"("recruiter_id");

-- CreateIndex
CREATE INDEX "interview_round_session_id_round_number_idx" ON "interview_round"("session_id", "round_number");

-- CreateIndex
CREATE INDEX "message_round_id_created_at_idx" ON "message"("round_id", "created_at");

-- CreateIndex
CREATE INDEX "tool_result_round_id_tool_name_idx" ON "tool_result"("round_id", "tool_name");

-- CreateIndex
CREATE UNIQUE INDEX "session_recording_session_id_round_id_key" ON "session_recording"("session_id", "round_id");

-- CreateIndex
CREATE INDEX "usage_log_session_id_created_at_idx" ON "usage_log"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "mentor_message_session_id_created_at_idx" ON "mentor_message"("session_id", "created_at");

-- AddForeignKey
ALTER TABLE "candidate_profile" ADD CONSTRAINT "candidate_profile_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_profile" ADD CONSTRAINT "recruiter_profile_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_description" ADD CONSTRAINT "job_description_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_description_id_fkey" FOREIGN KEY ("job_description_id") REFERENCES "job_description"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_round" ADD CONSTRAINT "interview_round_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "interview_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_result" ADD CONSTRAINT "tool_result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "interview_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recording" ADD CONSTRAINT "session_recording_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "interview_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recording" ADD CONSTRAINT "session_recording_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_log" ADD CONSTRAINT "usage_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_session" ADD CONSTRAINT "mentor_session_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_session" ADD CONSTRAINT "mentor_session_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "interview_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_message" ADD CONSTRAINT "mentor_message_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentor_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
