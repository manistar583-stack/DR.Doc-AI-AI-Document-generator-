export type Role = 'user' | 'model';

export interface AttachmentData {
  fileName: string;
  mimeType: string;
  data: string; // Base64
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
  attachments?: AttachmentData[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isDeleted?: boolean;
}
