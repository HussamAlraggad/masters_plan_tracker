export type CourseCategory = 'mandatory' | 'elective' | 'thesis';
export type CourseTrack = 'thesis' | 'comprehensive';
export type CourseStatus = 'pending' | 'registered' | 'passed' | 'failed';
export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | '';
export type SemesterTerm = 'first' | 'second' | 'summer';
export type SemesterStatus = 'planned' | 'active' | 'completed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type ExportFormat = 'xlsx' | 'ods' | 'csv' | 'json';

export interface Course {
  id: string;
  course_id: string;
  name_ar: string;
  name_en: string;
  credits: number;
  category: CourseCategory;
  prerequisites: string[];
  semester_offered: SemesterTerm[];
  track: CourseTrack;
  active: boolean;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  status: CourseStatus;
  grade: Grade;
  semester_taken: string;
  notes: string;
  updated_at: string;
  course?: Course;
}

export interface Semester {
  id: string;
  user_id: string;
  year: string;
  term: SemesterTerm;
  target_courses: number;
  target_credits: number;
  status: SemesterStatus;
  gpa: number | null;
  notes: string;
  created_at: string;
}

export interface ThesisMilestone {
  id: string;
  user_id: string;
  title: string;
  order: number;
  due_date: string | null;
  status: MilestoneStatus;
  notes: string;
  created_at: string;
}

export interface CourseSuggestion {
  course: Course;
  score: number;
  reasons: string[];
  conflicts: ScheduleConflict[];
  schedule: CourseSchedule[];
}

export interface ScheduleConflict {
  course_id: string;
  section: string;
  time: string;
  location: string;
}

export interface CourseSchedule {
  course_id: string;
  section: string;
  instructor: string;
  time: string;
  location: string;
}

export interface ExportData {
  progress: Progress[];
  courses: Course[];
  semesters: Semester[];
  thesis_milestones: ThesisMilestone[];
  exported_at: string;
  version: string;
}

export interface SuggestionInput {
  year: string;
  term: SemesterTerm;
  max_courses: number;
  max_credits: number;
  user_id: string;
}