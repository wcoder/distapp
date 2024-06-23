import type { EventHandlerRequest, H3Event } from "h3";
import * as Minio from 'minio'

const createS3 = (event: H3Event<EventHandlerRequest>) => {
    const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = useRuntimeConfig(event)
    const s3 = new Minio.Client({
        endPoint: S3_ENDPOINT,
        region: 'us-east-1',
        useSSL: true,
        accessKey: S3_ACCESS_KEY_ID,
        secretKey: S3_SECRET_ACCESS_KEY,
    })
    return s3
}

export class S3AppClient {
    async getSignedUrlPutObject(event: H3Event<EventHandlerRequest>, key: string, expiresIn: number): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await s3.presignedPutObject(
            s3BucketName,
            key,
            expiresIn,
        )
        console.log('S3AppClient putObject', { signedUrl })
        return signedUrl
    }

    async getSignedUrlGetObject(event: H3Event<EventHandlerRequest>, key: string, expiresIn: number, contentDisposition: string): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await s3.presignedGetObject(
            s3BucketName,
            key,
            expiresIn, {
            'Content-Disposition': contentDisposition,
        },
        )
        console.log('S3AppClient getobject', { signedUrl })
        return signedUrl
    }

    async getHeadObject(event: H3Event<EventHandlerRequest>, key: string): Promise<any> {
        // const s3 = createS3(event)
        // const result = await s3
        return {}
    }

    async copyObject(event: H3Event<EventHandlerRequest>, sourceKey: string, targetKey: string) {
        const s3 = createS3(event)
        await s3.copyObject(
            s3BucketName,
            targetKey,
            sourceKey,
        )
    }

    async deleteObject(event: H3Event<EventHandlerRequest>, key: string) {
        const s3 = createS3(event)
        await s3.removeObject(
            s3BucketName,
            key,
        )
    }
}

export interface AppHeadObjectCommandOutput {
    ETag: string
    ContentLength: string
    ContentType: string
}
