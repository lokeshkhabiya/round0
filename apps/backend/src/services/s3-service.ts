import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION_BUCKET,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    public async getUploadPresignedUrl(bucketName: string, key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return url;
    }

    public async uploadFile(bucketName: string, key: string, file: Buffer, mimetype: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: mimetype,
        });

        try {
            console.log(`Uploading ${key} to bucket ${bucketName}...`);
            await this.s3Client.send(command);
            console.log(`Successfully uploaded ${key} to ${bucketName}.`);
            const url = `https://${bucketName}.s3.${process.env.AWS_REGION_BUCKET}.amazonaws.com/${key}`;
            return url;
        } catch (error) {
            console.error(`Error uploading file to S3:`, error);
            throw error;
        }
    }

    public async uploadAudioFile(bucketName: string, key: string, file: Buffer, mimetype: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: mimetype,
        });

        try {
            console.log(`Uploading ${key} to bucket ${bucketName}...`);
            await this.s3Client.send(command);
            console.log(`Successfully uploaded ${key} to ${bucketName}.`);
            const url = `https://${bucketName}.s3.${process.env.AWS_REGION_BUCKET}.amazonaws.com/${key}`;
            return url;
        } catch (error) {
            console.error(`Error uploading file to S3:`, error);
            throw error;
        }
    }

    public async getFileUrl(bucketName: string, key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        return url;
    }
}

export default new S3Service(); 