import { Timestamp } from 'firebase/firestore';

export type Comment = {
  id: string;
  text: string;
  author: string;
  timestamp: Timestamp;
}

export type Project = {
  id:string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  labels: string[];
  rate?: number;
  comments?: Comment[]; // Comments may be loaded separately
  createdAt: Timestamp;
};

export type Label = {
    id: string;
    name: string;
}

export type UserFile = {
    id: string;
    fileName: string;
    fileType: string;
    uploadDate: Timestamp;
    fileSize: number;
    downloadUrl: string;
}

export type User = {
    id: string;
    email: string;
    location?: {
        latitude: number;
        longitude: number;
        timestamp: Timestamp;
    }
}
