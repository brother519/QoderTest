import { Schema, model, Document } from 'mongoose';

export interface IMultipartSession extends Document {
  uploadId: string;
  fileId: string;
  
  s3Key: string;
  s3Bucket: string;
  s3UploadId: string;
  
  fileName: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;
  totalParts: number;
  
  uploadedParts: Array<{
    partNumber: number;
    etag: string;
    size: number;
    uploadedAt: Date;
  }>;
  
  status: 'active' | 'completed' | 'aborted' | 'expired';
  
  userId: string;
  isPublic: boolean;
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const MultipartSessionSchema = new Schema<IMultipartSession>({
  uploadId: { type: String, required: true, unique: true, index: true },
  fileId: { type: String, required: true, index: true },
  
  s3Key: { type: String, required: true },
  s3Bucket: { type: String, required: true },
  s3UploadId: { type: String, required: true },
  
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  totalSize: { type: Number, required: true },
  chunkSize: { type: Number, required: true },
  totalParts: { type: Number, required: true },
  
  uploadedParts: [{
    partNumber: { type: Number, required: true },
    etag: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
  
  status: { 
    type: String, 
    enum: ['active', 'completed', 'aborted', 'expired'], 
    default: 'active',
    index: true,
  },
  
  userId: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false },
  expiresAt: Date,
}, { 
  timestamps: true,
});

// TTL index for automatic session cleanup (24 hours)
MultipartSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const MultipartSessionModel = model<IMultipartSession>('MultipartSession', MultipartSessionSchema);
