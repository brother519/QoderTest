import { Schema, model, Document } from 'mongoose';

export interface IFile extends Document {
  fileId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  
  s3Key: string;
  s3Bucket: string;
  s3ETag: string;
  
  cdnUrl: string;
  thumbnailUrl?: string;
  
  isPublic: boolean;
  accessLevel: 'public' | 'private' | 'signed';
  expiresAt?: Date;
  
  userId: string;
  permissions: {
    allowedUsers: string[];
    allowedRoles: string[];
  };
  
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    custom: Record<string, any>;
  };
  
  stats: {
    downloads: number;
    views: number;
    lastAccessedAt?: Date;
  };
  
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  fileId: { type: String, required: true, unique: true, index: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  
  s3Key: { type: String, required: true },
  s3Bucket: { type: String, required: true },
  s3ETag: { type: String, required: true },
  
  cdnUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  
  isPublic: { type: Boolean, default: false },
  accessLevel: { type: String, enum: ['public', 'private', 'signed'], default: 'private' },
  expiresAt: { type: Date, index: true },
  
  userId: { type: String, required: true, index: true },
  permissions: {
    allowedUsers: { type: [String], default: [] },
    allowedRoles: { type: [String], default: [] },
  },
  
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    custom: { type: Schema.Types.Mixed, default: {} },
  },
  
  stats: {
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    lastAccessedAt: Date,
  },
  
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  processingError: String,
}, { 
  timestamps: true,
});

// TTL index for automatic expiration
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for S3 lookup
FileSchema.index({ s3Bucket: 1, s3Key: 1 });

// Index for querying files by creation date
FileSchema.index({ createdAt: -1 });

export const FileModel = model<IFile>('File', FileSchema);
