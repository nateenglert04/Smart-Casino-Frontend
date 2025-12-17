import { SmartCasinoClient } from './SmartCasinoClient';

export interface Course {
  id: number;
  title: string;
  description: string;
  gameType: string;
  totalXp: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  xpReward: number;
  difficulty: number;
  sequenceOrder: number;
  isCompleted: boolean;
}

export interface CourseDetails extends Course {
  lessons: Lesson[];
}

export const CourseService = {
  
  getClient: () => SmartCasinoClient.getInstance().client,

  getAllCourses: async () => {
    const response = await CourseService.getClient().get<Course[]>('/courses');
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await CourseService.getClient().get<CourseDetails>(`/courses/${id}`);
    return response.data;
  },

  completeLesson: async (lessonId: number) => {
    const response = await CourseService.getClient().post(`/courses/lesson/${lessonId}/complete`);
    return response.data;
  }
};
