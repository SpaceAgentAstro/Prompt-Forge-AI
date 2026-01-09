export interface OptimizationRequest {
  userIdea: string;
  isProMode: boolean;
  history?: OptimizedResult[];
}

export interface OptimizedResult {
  original: string;
  optimized: string;
  timestamp: number;
  isProMode: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}