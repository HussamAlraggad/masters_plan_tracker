import { z } from 'zod';

export const gradeSchema = z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', '']);

export const courseStatusSchema = z.enum(['pending', 'registered', 'passed', 'failed']);

export const semesterTermSchema = z.enum(['first', 'second', 'summer']);

export const semesterStatusSchema = z.enum(['planned', 'active', 'completed']);

export const milestoneStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

export const exportFormatSchema = z.enum(['xlsx', 'ods', 'csv', 'json']);

export const progressUpdateSchema = z.object({
  course_id: z.string().min(1),
  status: courseStatusSchema,
  grade: gradeSchema.optional(),
  semester_taken: z.string().optional(),
  notes: z.string().optional(),
});

export const suggestionInputSchema = z.object({
  year: z.string().min(1),
  term: semesterTermSchema,
  max_courses: z.number().int().min(1).max(5),
  max_credits: z.number().int().min(3).max(15),
  user_id: z.string().uuid(),
});

export const scheduleInputSchema = z.object({
  year: z.string().min(1),
  term: semesterTermSchema,
  dept_id: z.string().default('101300'),
});

export const semesterSchema = z.object({
  year: z.string().min(1),
  term: semesterTermSchema,
  target_courses: z.number().int().min(1).max(6).default(3),
  target_credits: z.number().int().min(3).max(18).default(9),
  status: semesterStatusSchema.default('planned'),
  notes: z.string().optional(),
});

export const otpSendSchema = z.object({
  email: z.string().email(),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const courseFilterSchema = z.object({
  category: z.enum(['mandatory', 'elective', 'thesis']).optional(),
  track: z.enum(['thesis', 'comprehensive']).optional(),
  status: courseStatusSchema.optional(),
  search: z.string().optional(),
});

export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type SuggestionInput = z.infer<typeof suggestionInputSchema>;
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
export type OTPSend = z.infer<typeof otpSendSchema>;
export type OTPVerify = z.infer<typeof otpVerifySchema>;
export type CourseFilter = z.infer<typeof courseFilterSchema>;