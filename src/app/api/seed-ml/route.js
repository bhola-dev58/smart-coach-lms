import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // The user running this needs an instructor ID. We will randomly assign an existing user or create a strict mock.
    // If you don't have users, this might throw error, but we'll fetch the first admin/instructor or create one.
    const User = mongoose.models.User;
    let instructor = await User.findOne({ role: { $in: ['admin', 'instructor'] } });

    if (!instructor) {
      instructor = await User.create({
        name: 'AI Instructor',
        email: 'ai@meetmecenter.com',
        password: 'dummy_password_hash',
        role: 'instructor'
      });
    }

    // Prepare chapters
    const chapters = [
      {
        title: 'Python for ML',
        order: 1,
        lessons: [
          {
            title: 'NumPy & Pandas',
            slug: 'numpy-pandas',
            duration: 35,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418617/NumPy_Pandas_jxd3wz.mp4',
            order: 1,
            isFree: true
          },
          {
            title: 'Data Visualization',
            slug: 'data-visualization',
            duration: 30,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418614/Data_Visualization_sy7fbw.mp4',
            order: 2,
            isFree: false
          },
          {
            title: 'Feature Engineering',
            slug: 'feature-engineering',
            type: 'video',
            duration: 40,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418616/0AFeature_Engineering_epkmtu.mp4',
            order: 3,
            isFree: false
          },
          {
            title: 'Assignment 1: Feature Engineering Prototype',
            slug: 'project-assignment-1',
            type: 'assignment',
            duration: 60,
            content: '<p>Please upload your Jupyter notebook implementation of the Feature Engineering module. Ensure all outputs are executed before submitting your `.ipynb` file.</p>',
            order: 4,
            isFree: false
          }
        ]
      },
      {
        title: 'Supervised Learning',
        order: 2,
        lessons: [
          {
            title: 'Linear Regression',
            slug: 'linear-regression',
            duration: 40,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418605/Linear_Regression_s383ay.mp4',
            order: 1,
            isFree: false
          },
          {
            title: 'Decision Trees & Random Forests',
            slug: 'decision-trees',
            duration: 45,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418617/Decision_Trees_Random_Forests_danzsf.mp4',
            order: 2,
            isFree: false
          },
          {
            title: 'SVM & KNN',
            slug: 'svm-knn',
            type: 'video',
            duration: 35,
            videoUrl: 'https://res.cloudinary.com/ds3gjhrob/video/upload/v1776418610/SVM_KNN_ykhadl.mp4',
            order: 3,
            isFree: false
          },
          {
            title: 'Assignment 2: Final ML Prototype',
            slug: 'final-ml-prototype',
            type: 'assignment',
            duration: 120,
            content: '<p>Using the techniques taught in this chapter, build a predictive model for housing prices using SVM or Decision Trees. Export your model and upload the `.zip` containing your script and the model checkpoint.</p>',
            order: 4,
            isFree: false
          }
        ]
      }
    ];

    const queryMatchedCourse = await Course.findOne({ title: { $regex: /Machine Learning/, $options: 'i' } });

    if (queryMatchedCourse) {
      queryMatchedCourse.chapters = chapters;
      queryMatchedCourse.isPublished = true;
      queryMatchedCourse.category = 'AI/ML';
      queryMatchedCourse.title = 'Machine Learning & AI';
      await queryMatchedCourse.save();
    } else {
      await Course.create({
        title: 'Machine Learning & AI',
        slug: 'machine-learning-and-ai',
        description: 'Complete hands-on course covering Python for ML, Supervised Learning, and more.',
        shortDescription: 'Master ML with hands-on projects and highly optimized theoretical coverage.',
        thumbnail: 'https://res.cloudinary.com/ds3gjhrob/image/course-thumbnail.png', // Fallback image
        instructor: instructor._id,
        category: 'AI/ML',
        level: 'Intermediate',
        price: 4999,
        originalPrice: 12000,
        chapters,
        isPublished: true,
        publishedAt: new Date(),
        totalHours: 25,
        totalStudents: 1450,
        rating: 4.8
      });
    }

    return NextResponse.json({ success: true, message: 'ML Course Seeded perfectly with Cloudinary Custom Videos!' });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
