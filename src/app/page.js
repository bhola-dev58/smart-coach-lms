

import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CoursesSection from '@/components/home/CoursesSection';
import HowItWorks from '@/components/home/HowItWorks';
import RoadmapSection from '@/components/home/RoadmapSection';
import ScholarshipCalculator from '@/components/home/ScholarshipCalculator';
import CTASection from '@/components/home/CTASection';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User'; // Register User schema for populate('instructor')

export const metadata = {
  title: 'Gradify Academy | Class 8-12 Boards, JEE & NEET Online Coaching',
  description:
    'Join India\'s premier school coaching platform. Live classes for Class 8, 9, 10, 11 & 12 in Science, Math & English. Target 95%+ in board exams and top ranks in JEE/NEET with expert IITian faculty.',
};

export default async function HomePage() {
  // Fetch featured/popular courses from DB (server-side, no API call needed)
  await connectDB();

  const featuredCourses = await Course.find({ isPublished: true })
    .select('title slug shortDescription description thumbnail category level price originalPrice totalHours totalStudents rating')
    .populate('instructor', 'name avatar')
    .sort({ totalStudents: -1 })
    .limit(6)
    .lean();

  const statsData = [
    { number: 1000, suffix: '+', label: 'Students Enrolled' },
    { number: 10, suffix: '+', label: 'Expert Courses' },
    { number: 95, suffix: '%', label: 'Academic Success Rate' },
  ];

  // Serialize for client components (convert ObjectId & Date to string)
  const courses = featuredCourses.map((c) => ({
    ...c,
    _id: c._id.toString(),
    instructor: c.instructor
      ? { ...c.instructor, _id: c.instructor._id.toString() }
      : null,
  }));

  return (
    <>
      <HeroSection />
      <StatsSection statsData={statsData} />
      <FeaturesSection />
      <CoursesSection courses={courses} />
      <HowItWorks />
      <RoadmapSection />
      <ScholarshipCalculator />
      <CTASection />
    </>
  );
}
