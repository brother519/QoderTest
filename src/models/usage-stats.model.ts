import { Schema, model, Document } from 'mongoose';

export interface IUsageStats extends Document {
  userId?: string;
  bucket?: string;
  date: Date;
  
  storage: {
    totalSize: number;
    fileCount: number;
    byMimeType: Map<string, { count: number; size: number }>;
  };
  
  bandwidth: {
    uploads: {
      count: number;
      totalBytes: number;
    };
    downloads: {
      count: number;
      totalBytes: number;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UsageStatsSchema = new Schema<IUsageStats>({
  userId: { type: String, index: true },
  bucket: { type: String, index: true },
  date: { type: Date, required: true, index: true },
  
  storage: {
    totalSize: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },
    byMimeType: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  
  bandwidth: {
    uploads: {
      count: { type: Number, default: 0 },
      totalBytes: { type: Number, default: 0 },
    },
    downloads: {
      count: { type: Number, default: 0 },
      totalBytes: { type: Number, default: 0 },
    },
  },
}, { 
  timestamps: true,
});

// Compound index for efficient queries
UsageStatsSchema.index({ userId: 1, date: 1 }, { unique: true, sparse: true });
UsageStatsSchema.index({ bucket: 1, date: 1 });

export const UsageStatsModel = model<IUsageStats>('UsageStats', UsageStatsSchema);
