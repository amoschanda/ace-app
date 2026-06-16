export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  audioUrl?: string;
  videoUrl?: string;
  series: string;
  description: string;
  notes: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  downloadUrl: string;
  pages: number;
  category: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  modules: {
    title: string;
    lessons: {
      title: string;
      duration: string;
      videoUrl?: string;
      content: string; // lesson study notes/material
    }[];
  }[];
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  type: 'service' | 'prayer' | 'study' | 'special';
}

export interface StudyResource {
  id: string;
  title: string;
  category: string;
  fileType: string;
  description: string;
  downloadUrl: string;
  fileSize: string;
}

export interface BroadcastEmail {
  id: string;
  subject: string;
  body: string;
  sentAt?: string;
  recipients: string; // 'all' | 'leaders' | 'members'
  status: 'draft' | 'sent';
}
