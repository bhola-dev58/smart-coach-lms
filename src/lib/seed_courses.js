/**
 * ============================================
 * 🌱 Seed Featured School Courses + Instructors into MongoDB
 * Run: node src/lib/seed_courses.js
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Inline schemas (CommonJS) to avoid ESM issues
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: String,
    bio: String,
    specialization: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const lessonSchema = new mongoose.Schema({
  title: String,
  slug: String,
  duration: Number,
  videoUrl: String,
  content: String,
  order: Number,
  isFree: { type: Boolean, default: false },
});

const chapterSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    description: String,
    shortDescription: String,
    thumbnail: String,
    previewVideoUrl: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    level: String,
    language: { type: String, default: 'English' },
    price: Number,
    originalPrice: Number,
    isFree: { type: Boolean, default: false },
    totalHours: Number,
    totalLessons: Number,
    chapters: [chapterSchema],
    prerequisites: [String],
    learningOutcomes: [String],
    tags: [String],
    faqs: [{ question: String, answer: String }],
    rating: Number,
    totalRatings: Number,
    totalStudents: Number,
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // ── Clear old courses ──
    await Course.deleteMany({});
    console.log('🗑️  Cleared old courses from database\n');

    // ── Create/find instructor ──
    let instructor = await User.findOne({ email: 'rajesh@meetme.center' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@meetme.center',
        role: 'instructor',
        bio: 'Senior Science Faculty with 15+ years of teaching board & foundation courses.',
        specialization: ['Physics', 'Chemistry', 'Mathematics Foundation'],
      });
      console.log('✅ Created instructor: Dr. Rajesh Kumar');
    } else {
      instructor.bio = 'Senior Science Faculty with 15+ years of teaching board & foundation courses.';
      instructor.specialization = ['Physics', 'Chemistry', 'Mathematics Foundation'];
      await instructor.save();
      console.log('⏭️  Instructor updated: Dr. Rajesh Kumar');
    }

    // ── Create second instructor ──
    let instructor2 = await User.findOne({ email: 'priya@meetme.center' });
    if (!instructor2) {
      instructor2 = await User.create({
        name: 'Prof. Priya Sharma',
        email: 'priya@meetme.center',
        role: 'instructor',
        bio: 'Experienced Mathematics expert, specializing in Board Exams and KCET/NEET coaching.',
        specialization: ['Mathematics', 'Biology', 'Science Foundation'],
      });
      console.log('✅ Created instructor: Prof. Priya Sharma');
    } else {
      instructor2.bio = 'Experienced Mathematics expert, specializing in Board Exams and KCET/NEET coaching.';
      instructor2.specialization = ['Mathematics', 'Biology', 'Science Foundation'];
      await instructor2.save();
      console.log('⏭️  Instructor updated: Prof. Priya Sharma');
    }

    // ── Course Data ──
    const coursesData = [
      {
        title: 'Class 10 Mathematics (Karnataka SSLC)',
        slug: 'class-10-math-sslc',
        description:
          'Complete Karnataka Board SSLC Class 10 Mathematics course. Covers step-by-step video lectures, textbook solutions, important theorems, model question paper analysis, and practice worksheets. Clear your doubts and score 100/100 in your boards.',
        shortDescription: 'Complete Mathematics syllabus for Class 10 (SSLC) Karnataka Board.',
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
        instructor: instructor2._id,
        category: 'MATHS',
        level: 'All Levels',
        language: 'English / Kannada',
        price: 1499,
        originalPrice: 2999,
        totalHours: 80,
        totalLessons: 45,
        totalStudents: 1540,
        totalRatings: 180,
        rating: 4.8,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-06-15'),
        prerequisites: ['Basic 9th class mathematics understanding'],
        learningOutcomes: [
          'Solve Arithmetic Progressions and Linear Equations quickly',
          'Understand similarity theorems for Triangles',
          'Master Trigonometric identities and applications',
          'Solve Coordinate Geometry and Area related problems easily',
          'Excel in grouped statistics and probability questions',
          'Solve previous years SSLC board question papers',
        ],
        tags: ['Class 10', 'SSLC', 'Karnataka Board', 'Mathematics', 'Coaching'],
        faqs: [
          { question: 'Is the course based on the Karnataka Board syllabus?', answer: 'Yes, it strictly follows the Karnataka State Board (KSEAB) SSLC textbook and pattern.' },
          { question: 'Will doubt sessions be conducted?', answer: 'Yes, weekly interactive live doubt resolution classes are included.' },
        ],
        chapters: [
          {
            title: 'Arithmetic Progressions',
            description: 'Understanding terms, common differences, and summation formulas.',
            order: 1,
            lessons: [
              { title: 'Introduction to AP & General Form', slug: 'ap-intro', duration: 25, order: 1, isFree: true },
              { title: 'Finding the nth Term of an AP', slug: 'ap-nth-term', duration: 35, order: 2 },
              { title: 'Sum of First n Terms of an AP', slug: 'ap-sum-n-terms', duration: 40, order: 3 },
            ],
          },
          {
            title: 'Triangles & Trigonometry',
            description: 'Basic Proportionality Theorem, similarity criteria, and trigonometric identities.',
            order: 2,
            lessons: [
              { title: 'BPT (Thales Theorem) and Similarity', slug: 'triangles-bpt', duration: 30, order: 1 },
              { title: 'Introduction to Trigonometric Ratios', slug: 'trigo-intro', duration: 25, order: 2 },
              { title: 'Trigonometric Identities & Applications', slug: 'trigo-identities', duration: 35, order: 3, isFree: true },
            ],
          },
          {
            title: 'Quadratic Equations & Statistics',
            description: 'Nature of roots, quadratic formulas, and grouped statistical measures.',
            order: 3,
            lessons: [
              { title: 'Solving Quadratic Equations by Factorization', slug: 'quad-factor', duration: 30, order: 1 },
              { title: 'Quadratic Formula & Nature of Roots', slug: 'quad-formula', duration: 35, order: 2 },
              { title: 'Mean, Median, and Mode of Grouped Data', slug: 'stats-grouped', duration: 40, order: 3 },
            ],
          },
        ],
      },
      {
        title: 'Class 10 Science (Physics, Chemistry & Biology)',
        slug: 'class-10-science-sslc',
        description:
          'Master Karnataka SSLC Class 10 Science with high-quality explanations, neat diagrams, and practical examples. Features comprehensive modules in Physics (Electricity, Light), Chemistry (Carbon Compounds, Acids & Bases), and Biology (Life Processes, Control).',
        shortDescription: 'Complete SSLC Science course with notes and board exam practice.',
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
        instructor: instructor._id,
        category: 'SCIENCE',
        level: 'All Levels',
        language: 'English / Kannada',
        price: 1499,
        originalPrice: 2999,
        totalHours: 90,
        totalLessons: 60,
        totalStudents: 1850,
        totalRatings: 240,
        rating: 4.9,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-05-10'),
        prerequisites: ['Basic middle school science concepts'],
        learningOutcomes: [
          'Draw neat, labeled science diagrams for exams',
          'Understand chemical equation balancing and properties of acids/bases',
          'Master Ray Diagrams for reflection and refraction',
          'Understand electricity, Ohm\'s law, and Joule\'s heating effect',
          'Understand human digestion, circulation, and nervous system functions',
          'Write high-scoring answers to board-exam questions',
        ],
        tags: ['Class 10', 'SSLC', 'Karnataka Board', 'Science', 'Physics', 'Chemistry', 'Biology'],
        faqs: [
          { question: 'Are PDF notes provided?', answer: 'Yes, detailed chapter-wise notes and solved questions are attached to each chapter.' },
        ],
        chapters: [
          {
            title: 'Chemical Substances & Reactions',
            description: 'Chemical equation balancing, acids, bases, and properties of metals.',
            order: 1,
            lessons: [
              { title: 'Chemical Reactions and Equations', slug: 'chem-reactions', duration: 30, order: 1, isFree: true },
              { title: 'Acids, Bases, and Salts - Core Concepts', slug: 'acids-bases', duration: 40, order: 2 },
              { title: 'Metals and Non-Metals Properties', slug: 'metals-properties', duration: 35, order: 3 },
            ],
          },
          {
            title: 'World of Living (Biology)',
            description: 'Life processes, nutrition, respiration, and human control systems.',
            order: 2,
            lessons: [
              { title: 'Life Processes: Nutrition & Respiration', slug: 'bio-nutrition', duration: 45, order: 1 },
              { title: 'Control and Coordination in Humans', slug: 'bio-coordination', duration: 40, order: 2 },
            ],
          },
          {
            title: 'Light & Electricity (Physics)',
            description: 'Reflection, refraction, lens formulas, and electric current circuits.',
            order: 3,
            lessons: [
              { title: 'Light - Reflection and Ray Diagrams', slug: 'phys-reflection', duration: 40, order: 1, isFree: true },
              { title: 'Ohm\'s Law and Circuit Calculations', slug: 'phys-ohms-law', duration: 45, order: 2 },
            ],
          },
        ],
      },
      {
        title: '2nd PUC Physics (Class 12 Board & KCET)',
        slug: '2nd-puc-physics-kcet',
        description:
          'Comprehensive preparation course for 2nd PUC Physics Karnataka Board exams and KCET. Features detailed lectures on Electrostatics, Current Electricity, Magnetism, Electromagnetic Induction, Wave Optics, Dual Nature of Matter, Atoms, Nuclei, and Semiconductor Electronics. Includes past 10 years board papers and KCET MCQ solving strategies.',
        shortDescription: 'Physics for 2nd PUC Karnataka Board and KCET preparation.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
        instructor: instructor._id,
        category: 'SCIENCE',
        level: 'Intermediate',
        language: 'English',
        price: 2499,
        originalPrice: 4999,
        totalHours: 120,
        totalLessons: 75,
        totalStudents: 920,
        totalRatings: 110,
        rating: 4.7,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-08-20'),
        prerequisites: ['1st PUC Physics concepts'],
        learningOutcomes: [
          'Derive key board exam equations (Gauss law, Lens maker formula, etc.)',
          'Solve numerical problems in Electrostatics and Current Electricity',
          'Understand electromagnetic induction and alternating current behavior',
          'Solve KCET Physics MCQs accurately in less than 60 seconds',
          'Master Semiconductor device principles and logic gates',
        ],
        tags: ['2nd PUC', 'Class 12', 'Physics', 'KCET', 'Science'],
        faqs: [
          { question: 'Does this cover KCET as well?', answer: 'Yes! Every chapter has special lectures dedicated to solving KCET MCQs and previous years question papers.' },
        ],
        chapters: [
          {
            title: 'Electrostatics & Current Electricity',
            description: 'Charges, potential difference, capacitors, and current circuits.',
            order: 1,
            lessons: [
              { title: 'Electric Charges and Fields', slug: 'elec-charges', duration: 35, order: 1, isFree: true },
              { title: 'Electrostatic Potential and Capacitance', slug: 'elec-potential', duration: 40, order: 2 },
              { title: 'Kirchhoff\'s Rules & Wheatstone Bridge', slug: 'kirchhoff-rules', duration: 45, order: 3 },
            ],
          },
          {
            title: 'Magnetism & Induction',
            description: 'Moving charges, electromagnetic induction, and AC circuits.',
            order: 2,
            lessons: [
              { title: 'Moving Charges and Force in Magnetic Field', slug: 'moving-charges', duration: 40, order: 1 },
              { title: 'Electromagnetic Induction & Faraday\'s Laws', slug: 'emi-faraday', duration: 35, order: 2 },
            ],
          },
          {
            title: 'Optics & Semiconductors',
            description: 'Wave optics and p-n junction diode electronics.',
            order: 3,
            lessons: [
              { title: 'Wave Optics: Huygens Principle & Interference', slug: 'wave-optics', duration: 45, order: 1, isFree: true },
              { title: 'Semiconductor Electronics & Logic Gates', slug: 'semiconductors', duration: 50, order: 2 },
            ],
          },
        ],
      },
      {
        title: '2nd PUC Mathematics (Class 12 Board & KCET)',
        slug: '2nd-puc-math-kcet',
        description:
          'Master 2nd PUC Mathematics with expert guidance. Covers Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, Application of Derivatives, Integrals, Application of Integrals, Differential Equations, Vector Algebra, Three Dimensional Geometry, Linear Programming, and Probability. Ideal for Karnataka Board and KCET preparation.',
        shortDescription: 'Mathematics masterclass for 2nd PUC and KCET preparation.',
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
        instructor: instructor2._id,
        category: 'MATHS',
        level: 'All Levels',
        language: 'English',
        price: 2499,
        originalPrice: 4999,
        totalHours: 140,
        totalLessons: 90,
        totalStudents: 1200,
        totalRatings: 170,
        rating: 4.8,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-07-05'),
        prerequisites: ['Strong algebra and basic trigonometry concepts'],
        learningOutcomes: [
          'Evaluate integrals using substitution, parts, and partial fractions',
          'Solve systems of linear equations using matrix inversion method',
          'Master continuity, differentiability, and rate of change calculations',
          'Understand vector properties, dot product, and cross product',
          'Apply Bayes Theorem to solve complex probability problems',
          'Solve KCET math sections with high accuracy',
        ],
        tags: ['2nd PUC', 'Class 12', 'Mathematics', 'KCET', 'Maths'],
        chapters: [
          {
            title: 'Calculus (Integration & Differentiation)',
            description: 'Derivative rules, applications, and indefinite/definite integration.',
            order: 1,
            lessons: [
              { title: 'Continuity and Differentiability Basics', slug: 'math-continuity', duration: 35, order: 1, isFree: true },
              { title: 'Methods of Differentiation', slug: 'math-differentiation', duration: 40, order: 2 },
              { title: 'Indefinite Integrals: Substitution Method', slug: 'math-integrals', duration: 45, order: 3 },
            ],
          },
          {
            title: 'Algebra & Vectors',
            description: 'Matrices operations, determinants, and vector geometry.',
            order: 2,
            lessons: [
              { title: 'Matrices and Determinants Properties', slug: 'math-matrices', duration: 35, order: 1 },
              { title: 'Vector Algebra: Dot & Cross Product', slug: 'math-vectors', duration: 40, order: 2 },
            ],
          },
        ],
      },
      {
        title: '1st PUC Biology (Class 11 Science)',
        slug: '1st-puc-biology',
        description:
          'Detailed biology course for Karnataka 1st PUC science students. Covers Diversity in the Living World, Structural Organisation in Plants and Animals, Cell Structure and Functions, Plant Physiology, and Human Physiology. Perfect for scoring high in college exams and building a strong foundation for NEET.',
        shortDescription: 'Detailed Biology syllabus for 1st PUC and NEET foundation.',
        thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop',
        instructor: instructor2._id,
        category: 'SCIENCE',
        level: 'Beginner',
        language: 'English',
        price: 1999,
        originalPrice: 3999,
        totalHours: 100,
        totalLessons: 70,
        totalStudents: 680,
        totalRatings: 90,
        rating: 4.6,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-11-15'),
        prerequisites: ['10th class science basics'],
        learningOutcomes: [
          'Understand taxonomy and classifications of animal and plant kingdoms',
          'Learn the cell cycle and mitotic/meiotic division processes',
          'Master photosynthesis and respiration in plants',
          'Understand human respiration, blood circulation, and neural coordination',
          'Excel in drawing labeled biological diagrams',
        ],
        tags: ['1st PUC', 'Class 11', 'Biology', 'NEET', 'Science'],
        chapters: [
          {
            title: 'Cell Structure & Division',
            description: 'Components of cells, organelles, cell cycle, and division.',
            order: 1,
            lessons: [
              { title: 'Cell: The Unit of Life', slug: 'cell-unit', duration: 35, order: 1, isFree: true },
              { title: 'Cell Cycle and Cell Division', slug: 'cell-cycle', duration: 40, order: 2 },
            ],
          },
          {
            title: 'Plant & Human Physiology',
            description: 'Photosynthesis, plant growth, breathing, and neural systems.',
            order: 2,
            lessons: [
              { title: 'Photosynthesis in Higher Plants', slug: 'photosynthesis', duration: 45, order: 1 },
              { title: 'Breathing and Exchange of Gases', slug: 'breathing', duration: 40, order: 2, isFree: true },
            ],
          },
        ],
      },
      {
        title: '2nd PUC Accountancy (Commerce)',
        slug: '2nd-puc-accountancy',
        description:
          'Learn 2nd PUC Accountancy from basics to advanced. Covers Partnership Accounts, Reconstitution of Partnership Firm, Admission/Retirement/Death of a Partner, Dissolution of Partnership Firm, Share Capital Transaction, Issue and Redemption of Debentures, and Financial Statement Analysis. Perfect for scoring 100% in Commerce boards.',
        shortDescription: 'Complete Accountancy syllabus for 2nd PUC Commerce Board.',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
        instructor: instructor._id,
        category: 'COMMERCE',
        level: 'All Levels',
        language: 'English',
        price: 1999,
        originalPrice: 3999,
        totalHours: 110,
        totalLessons: 65,
        totalStudents: 780,
        totalRatings: 95,
        rating: 4.8,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-06-01'),
        prerequisites: ['1st PUC Accountancy basics'],
        learningOutcomes: [
          'Understand Partnership Deed, Capital Accounts, and profit distribution',
          'Calculate new profit-sharing ratios and sacrifice ratios on partner admission',
          'Prepare Revaluation Accounts and Balance Sheet after Partner retirement',
          'Account for company share issues at par and premium',
          'Analyse company financial statement using ratio analysis',
        ],
        tags: ['2nd PUC', 'Class 12', 'Accountancy', 'Commerce', 'Board Exam'],
        chapters: [
          {
            title: 'Accounting for Partnership Firms',
            description: 'Fundamentals, partner admission, retirement, and dissolution.',
            order: 1,
            lessons: [
              { title: 'Partnership Deed & Interest on Capital', slug: 'acc-partnership-deed', duration: 35, order: 1, isFree: true },
              { title: 'Admission: New Profit Sharing Ratio', slug: 'acc-admission-ratio', duration: 40, order: 2 },
            ],
          },
          {
            title: 'Company Accounts',
            description: 'Issue of shares, forfeiture, and reissue accounting.',
            order: 2,
            lessons: [
              { title: 'Issue of Shares at Par and Premium', slug: 'acc-shares-issue', duration: 40, order: 1, isFree: true },
              { title: 'Forfeiture and Reissue of Shares', slug: 'acc-shares-forfeiture', duration: 45, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'Class 9 Mathematics & Science Foundation',
        slug: 'class-9-math-science-foundation',
        description:
          'Build a rock-solid foundation in Class 9 Math and Science for NTSE, Olympiads, and future Class 10 board exams. Covers Number Systems, Polynomials, Coordinate Geometry, matter in our surroundings, force, motion, work and energy.',
        shortDescription: 'Foundation course in Mathematics and Science for Class 9 students.',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
        instructor: instructor2._id,
        category: 'GENERAL',
        level: 'Beginner',
        language: 'English / Hindi',
        price: 1299,
        originalPrice: 2499,
        totalHours: 90,
        totalLessons: 50,
        totalStudents: 1100,
        totalRatings: 130,
        rating: 4.7,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-09-01'),
        prerequisites: ['Class 8 maths & science concepts'],
        learningOutcomes: [
          'Understand rational, irrational numbers and polynomial factorization',
          'Apply equations of motion and Newton\'s laws of motion to numericals',
          'Understand plant and animal tissues structures',
          'Solve coordinate geometry and linear equations in two variables',
          'Master foundations needed to crack future board and competitive exams',
        ],
        tags: ['Class 9', 'Science', 'Mathematics', 'Foundation', 'Olympiad'],
        chapters: [
          {
            title: 'Number Systems & Algebra',
            description: 'Rational numbers, irrational numbers, polynomials and factorization.',
            order: 1,
            lessons: [
              { title: 'Rational & Irrational Numbers', slug: 'fnd-rational-numbers', duration: 35, order: 1, isFree: true },
              { title: 'Polynomials & Remainder Theorem', slug: 'fnd-polynomials', duration: 40, order: 2 },
            ],
          },
          {
            title: 'Motion, Force & Gravitation',
            description: 'Kinematics, dynamics, and universal gravitation laws.',
            order: 2,
            lessons: [
              { title: 'Equations of Motion Graphical Derivation', slug: 'fnd-motion-eq', duration: 40, order: 1, isFree: true },
              { title: 'Newton\'s Laws of Motion Explained', slug: 'fnd-newtons-laws', duration: 45, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'Class 8 Comprehensive Syllabus (Math, Science & English)',
        slug: 'class-8-comprehensive',
        description:
          'Complete Class 8 online course covering Mathematics, Science, and English. Designed to keep students ahead of their school curriculum from home. Focuses on conceptual clarity, interactive worksheets, and regular quizzes.',
        shortDescription: 'Full syllabus coverage of Mathematics, Science, and English for Class 8.',
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
        instructor: instructor._id,
        category: 'GENERAL',
        level: 'Beginner',
        language: 'English / Hindi',
        price: 999,
        originalPrice: 1999,
        totalHours: 75,
        totalLessons: 40,
        totalStudents: 850,
        totalRatings: 90,
        rating: 4.5,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-10-01'),
        prerequisites: ['Basic reading and math skills'],
        learningOutcomes: [
          'Solve linear equations in one variable',
          'Understand crop production techniques and soil preparation',
          'Identify friendly and harmful microorganisms',
          'Improve English grammar, tense usage, and comprehension writing',
          'Build study habits and self-learning discipline from home',
        ],
        tags: ['Class 8', 'Mathematics', 'Science', 'English', 'School Syllabus'],
        chapters: [
          {
            title: 'Rational Numbers & Algebra',
            description: 'Properties of numbers and linear equations solving.',
            order: 1,
            lessons: [
              { title: 'Properties of Rational Numbers', slug: 'class8-rational', duration: 30, order: 1, isFree: true },
              { title: 'Solving Linear Equations in One Variable', slug: 'class8-linear', duration: 35, order: 2 },
            ],
          },
          {
            title: 'Science - Agricultural & Biological Basics',
            description: 'Crop production, irrigation, and friendly/harmful bacteria.',
            order: 2,
            lessons: [
              { title: 'Agricultural Practices & Soil Prep', slug: 'class8-agri', duration: 30, order: 1, isFree: true },
              { title: 'Microorganisms: Friend and Foe', slug: 'class8-microbes', duration: 35, order: 2 },
            ],
          },
        ],
      },
    ];

    // ── Upsert courses (update if exists, create if not) ──
    let created = 0;
    let updated = 0;

    for (const courseData of coursesData) {
      const existing = await Course.findOne({ slug: courseData.slug });
      if (existing) {
        await Course.updateOne({ slug: courseData.slug }, { $set: courseData });
        console.log(`🔄 Updated: ${courseData.title}`);
        updated++;
      } else {
        await Course.create(courseData);
        console.log(`✅ Created: ${courseData.title}`);
        created++;
      }
    }

    console.log(`\n─────────────────────────────────────`);
    console.log(`🎉 Seed complete! Created: ${created} | Updated: ${updated} | Total: ${coursesData.length}`);

    // ── Verify featured courses ──
    const featured = await Course.countDocuments({ isFeatured: true, isPublished: true });
    const total = await Course.countDocuments({ isPublished: true });
    console.log(`⭐ Featured (for homepage): ${featured}`);
    console.log(`📚 Total published courses: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
