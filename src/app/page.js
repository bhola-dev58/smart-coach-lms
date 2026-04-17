
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CoursesSection from '@/components/home/CoursesSection';
import HowItWorks from '@/components/home/HowItWorks';
import CTASection from '@/components/home/CTASection';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User'; // Register User schema for populate('instructor')

export const metadata = {
  title: 'MeetMe Center — Smart Coaching LMS',
  description:
    'Join India\'s fastest-growing B.Tech coaching platform. Expert faculty from IITs & NITs, industry-relevant curriculum, and guaranteed placement assistance.',
};

export default async function HomePage() {
  // Fetch featured/popular courses from DB (server-side, no API call needed)
  await connectDB();
  const featuredCourses = await Course.find({
    isPublished: true,
  })
    .select(
      'title slug shortDescription description thumbnail category level price originalPrice totalHours totalStudents rating'
    )
    .populate('instructor', 'name avatar')
    .sort({ totalStudents: -1 })
    .limit(6)
    .lean();

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
      <StatsSection />
      <FeaturesSection />
      <CoursesSection courses={courses} />
      <HowItWorks />
      <CTASection />
    </>
  );
}
