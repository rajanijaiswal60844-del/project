
import { Timestamp } from 'firebase/firestore';

export type Comment = {
  id: string;
  text: string;
  author: string;
  timestamp: Timestamp;
}

export type Project = {
  id: string;
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
