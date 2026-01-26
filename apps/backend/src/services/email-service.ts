import { SESClient, SendBulkTemplatedEmailCommand, SendEmailCommand } from "@aws-sdk/client-ses";

interface EmailDestination {
    email: string;
    templateData: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        interviewLink: string;
    };
}

class EmailService {
    private sesClient: SESClient;

    constructor() {
        this.sesClient = new SESClient({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
        });
    }

    async sendInterviewInvitations(
        destinations: EmailDestination[],
        fromEmail: string = process.env.FROM_EMAIL as string
    ): Promise<boolean> {
        try {
            const bulkDestinations = destinations.map(dest => ({
                Destination: {
                    ToAddresses: [dest.email],
                },
                ReplacementTemplateData: JSON.stringify(dest.templateData),
            }));

            const command = new SendBulkTemplatedEmailCommand({
                Source: fromEmail,
                Template: 'InterviewInvitationTemplate', // You'll need to create this template in AWS SES
                DefaultTemplateData: JSON.stringify({
                    candidateName: 'Candidate',
                    jobTitle: 'Position',
                    companyName: 'ZeroCV',
                    interviewLink: '#'
                }),
                Destinations: bulkDestinations,
            });

            const response = await this.sesClient.send(command);
            console.log("Bulk email sent successfully:", response);
            return true;
        } catch (error) {
            console.error("Error sending bulk email:", error);
            return false;
        }
    }

    async sendSingleInterviewInvitation(
        toEmail: string,
        candidateName: string,
        jobTitle: string,
        roundType: string,
        interviewLink: string,
        fromEmail: string = process.env.FROM_EMAIL as string
    ): Promise<boolean> {
        try {
            const roundTypeDisplay = roundType === 'skill_assessment' ? 'Skill Assessment' : 'Behavioral';
            
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Interview Invitation - ${jobTitle} (${roundTypeDisplay} Round)</h2>
                    <p>Dear ${candidateName},</p>
                    <p>Congratulations! You have been selected for a <strong>${roundTypeDisplay}</strong> interview for the position of <strong>${jobTitle}</strong>.</p>
                    <p>Please click the link below to access your interview session:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${interviewLink}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Start ${roundTypeDisplay} Interview
                        </a>
                    </div>
                    <p><strong>Important:</strong> This link is valid for 24 hours from the time you receive this email.</p>
                    <p>Best regards,<br>ZeroCV Team</p>
                </div>
            `;

            const command = new SendEmailCommand({
                Source: fromEmail,
                Destination: {
                    ToAddresses: [toEmail],
                },
                Message: {
                    Subject: {
                        Data: `Interview Invitation - ${jobTitle} (${roundTypeDisplay} Round)`,
                    },
                    Body: {
                        Html: {
                            Data: htmlBody,
                        },
                    },
                },
            });

            const response = await this.sesClient.send(command);
            console.log("Email sent successfully:", response);
            return true;
        } catch (error) {
            console.error("Error sending email:", error);
            return false;
        }
    }
}

export default new EmailService();