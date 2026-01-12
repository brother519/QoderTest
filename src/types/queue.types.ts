// Processing task status
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Task priority levels
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

// Base task data
export interface BaseTaskData {
  imageId: string;
  userId?: string;
  priority: TaskPriority;
  createdAt: number;
}

// Image upload processing task
export interface UploadTaskData extends BaseTaskData {
  type: 'upload';
  originalPath: string;
  generateThumbnails: boolean;
  watermarkTemplate?: string;
}

// Image transform task
export interface TransformTaskData extends BaseTaskData {
  type: 'transform';
  sourcePath: string;
  params: {
    width?: number;
    height?: number;
    fit?: string;
    format?: string;
    quality?: number;
    watermark?: string;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
  };
}

// Thumbnail generation task
export interface ThumbnailTaskData extends BaseTaskData {
  type: 'thumbnail';
  sourcePath: string;
  variants: Array<{
    name: string;
    width: number;
    height: number;
    fit?: string;
    format?: string;
    quality?: number;
  }>;
}

// Union type for all task data
export type TaskData = UploadTaskData | TransformTaskData | ThumbnailTaskData;

// Task result
export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  progress: number;
  results?: Array<{
    variant: string;
    url: string;
    size: number;
  }>;
  error?: string;
  completedAt?: number;
}

// Job options for Bull queue
export interface JobOptions {
  attempts: number;
  backoff: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  priority: number;
  removeOnComplete: {
    age: number;
    count: number;
  };
  removeOnFail: {
    age: number;
  };
}
