import { google } from 'googleapis'
import { Readable } from 'stream'

// Helper function to get Google Drive client using OAuth2
const getDriveClient = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    })

    return google.drive({ version: 'v3', auth: oauth2Client })
}

export const uploadToDrive = async (file: File, folderId: string, fileName: string) => {
    try {
        const drive = getDriveClient()

        // Convert File to buffer/stream for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: {
                mimeType: 'application/pdf',
                body: stream,
            },
            fields: 'id, webViewLink',
        })

        const fileId = response.data.id;
        if (fileId) {
            // Set file to be public so anyone with link can view it
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
        }

        return {
            id: fileId,
            link: response.data.webViewLink
        }
    } catch (error: any) {
        console.error('Google Drive Upload Error:', error)
        throw new Error(`Gagal upload ke Google Drive: ${error.message}`)
    }
}

export const createStudentFolder = async (folderName: string, parentFolderId: string) => {
    try {
        const drive = getDriveClient()

        // Check if folder already exists
        const listResponse = await drive.files.list({
            q: `name = '${folderName}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id)',
        })

        if (listResponse.data.files && listResponse.data.files.length > 0) {
            return listResponse.data.files[0].id
        }

        // Create new folder
        const createResponse = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            },
            fields: 'id',
        })

        return createResponse.data.id
    } catch (error: any) {
        console.error('Google Drive Folder Creation Error:', error)
        throw new Error(`Gagal membuat folder di Google Drive: ${error.message}`)
    }
}

export const deleteFromDrive = async (fileId: string) => {
    try {
        const drive = getDriveClient()
        await drive.files.delete({
            fileId: fileId,
        })
        return true
    } catch (error: any) {
        // If file already deleted or not found, just log and continue
        console.warn(`Could not delete file ${fileId} from Drive:`, error.message)
        return false
    }
}
