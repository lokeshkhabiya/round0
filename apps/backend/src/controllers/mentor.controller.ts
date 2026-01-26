import type { Request, Response } from "express";
import mentorService from "../services/mentor";
import prisma from "../lib/prisma";

const testConnection = async (req: Request, res: Response) => {
    try {
        const result = await mentorService.testConnection();
        res.status(200).json({
            success: "true",
            message: "OpenAI connection test completed",
            data: result,
        });
    } catch (error) {
        console.error("Error testing connection:", error);
        res.status(500).json({
            success: "false",
            message: "Error testing OpenAI connection",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

const createMentorSession = async (req: Request, res: Response) => {
    try {
        const { id: candidate_id } = req.user;

        const mentorSession =
            await mentorService.createMentorSession(candidate_id);

        if (!mentorSession) {
            res.status(400).json({
                success: "false",
                message: "Failed to create mentor session",
            });
            return;
        }

        res.status(200).json({
            success: "true",
            message: "Mentor session created successfully",
            data: mentorSession,
        });
        return;
    } catch (error) {
        console.log("Error while creating mentor session", error);
        res.status(500).json({
            success: "false",
            message: "Error while creating mentor session",
            error: error,
        });
        return;
    }
};

const conversation = async (req: Request, res: Response) => {
    try {
        const { id: candidate_id } = req.user!;
        const { mentor_session_id, user_query } = req.body;

        // Validate required fields
        if (!mentor_session_id || !user_query) {
            res.status(400).json({
                success: "false",
                message: "Missing required fields: mentor_session_id and user_query",
            });
            return;
        }

        // 1. persist user query
        await prisma.mentor_message.create({
            data: {
                session_id: mentor_session_id as string,
                messenger_role: "candidate",
                content: { text: user_query },
                message_type: "text",
            },
        });

        // 2. get the full event stream (search, reasoning, text-delta, etc)
        const fullStream = await mentorService.respondCandidate(
            candidate_id,
            mentor_session_id as string
        );

        // 3. turn on SSE / chunked streaming
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Cache-Control");
        res.flushHeaders();

        // 4. stream every TextStreamPart to client and accumulate only the text deltas
        let fullText = "";
        let partCount = 0;
        try {
            
            for await (const part of fullStream) {
                partCount++;

                // send raw event down to client
                const jsonString = JSON.stringify(part);
                res.write(`data: ${jsonString}\n\n`);

                // accumulate only the actual reply text
                if (part.type === "text-delta") {
                    fullText += part.textDelta;
                }
            }

            // signal stream end
            res.write("event: done\ndata: \n\n");
            res.end();

            // 5. once finished, save the full AI reply into the DB
            if (fullText.trim()) {
                await prisma.mentor_message.create({
                    data: {
                        session_id: mentor_session_id as string,
                        messenger_role: "ai_mentor",
                        content: { text: fullText },
                        message_type: "text",
                    },
                });
            }
        } catch (streamError) {
            console.error("Error during streaming:", streamError);
            console.error("Stream error stack:", streamError instanceof Error ? streamError.stack : 'No stack trace');
            
            // Send error event to client
            res.write(`data: ${JSON.stringify({ 
                type: "error", 
                error: { 
                    message: "Streaming interrupted",
                    details: streamError instanceof Error ? streamError.message : String(streamError)
                } 
            })}\n\n`);
            res.write("event: done\ndata: \n\n");
            res.end();

            // Still try to save any accumulated text
            if (fullText.trim()) {
                await prisma.mentor_message.create({
                    data: {
                        session_id: mentor_session_id as string,
                        messenger_role: "ai_mentor",
                        content: { text: fullText },
                        message_type: "text",
                    },
                });
            }
        }
    } catch (error) {
        console.error("Error in conversation controller:", error);
        
        // If headers haven't been sent yet, send regular JSON error
        if (!res.headersSent) {
            res.status(500).json({
                success: "false",
                message: "Error while processing conversation",
                error: error instanceof Error ? error.message : String(error),
            });
        } else {
            // If we're in the middle of streaming, send error event
            res.write(`data: ${JSON.stringify({ 
                type: "error", 
                error: { 
                    message: "Server error occurred",
                    details: error instanceof Error ? error.message : String(error)
                } 
            })}\n\n`);
            res.write("event: done\ndata: \n\n");
            res.end();
        }
    }
};

const getMentorSessions = async (req: Request, res: Response) => {
    
    const { id: candidate_id } = req.user!;
    try {
        
        const mentorSessions = await prisma.mentor_session.findMany({
            where: {
                candidate_id: candidate_id
            },

            orderBy: {
                created_at: "desc"
            },
            take: 10,
            skip: 0
        })

        if (!mentorSessions) {
            res.status(404).json({
                success: "false",
                message: "No mentor sessions found",
            });
            return;
        }

        res.status(200).json({
            success: "true",
            message: "Mentor sessions fetched successfully",
            data: mentorSessions,
        });
        return;

    } catch (error) {
        console.error("Error while getting mentor sessions", error);
        res.status(500).json({
            success: "false",
            message: "Error while getting mentor sessions",
            error: error,
        });
    }
}

const getMentorSessionMessages = async (req: Request, res: Response) => {
    const { id: candidate_id } = req.user!;
    const { mentor_session_id } = req.query;

    try {
        const mentorSessionMessages = await prisma.mentor_message.findMany({
            where: {
                session_id: mentor_session_id as string,
                session: {
                    candidate_id: candidate_id
                }
            },

            orderBy: {
                created_at: "asc"
            }
        })

        if (!mentorSessionMessages) {
            res.status(404).json({
                success: "false",
                message: "No mentor session messages found",
            });
            return;
        }

        res.status(200).json({
            success: "true",
            message: "Mentor session messages fetched successfully",
            data: mentorSessionMessages,
        });
        return;

    } catch (error) {
        console.error("Error while getting mentor session messages", error);
        res.status(500).json({
            success: "false",
            message: "Error while getting mentor session messages",
            error: error,
        });
    }
}

export const mentorController = {
    conversation,
    createMentorSession,
    testConnection,
    getMentorSessions,
    getMentorSessionMessages
};
