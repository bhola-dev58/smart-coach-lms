// Configuration for dynamic mapping of columns and form fields per Mongoose Schema
export const schemaConfig = {
  announcements: {
    name: 'Announcements',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Message Content', type: 'textarea', required: true },
      { key: 'course', label: 'Course ID', type: 'text' }, // We could use dynamic relations dropdown later
      { key: 'isActive', label: 'Active', type: 'boolean', default: true }
    ]
  },
  assignments: {
    name: 'Assignments',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'course', label: 'Course ID', type: 'text', required: true },
      { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { key: 'fileUrl', label: 'Attachment URL', type: 'file' }
    ]
  },
  assignmentsubmissions: {
    name: 'Submissions',
    fields: [
      { key: 'assignment', label: 'Assignment ID', type: 'text', required: true },
      { key: 'student', label: 'Student ID', type: 'text', required: true },
      { key: 'fileUrl', label: 'Submitted File', type: 'file' },
      { key: 'status', label: 'Status', type: 'select', options: ['submitted', 'graded', 'rejected'] },
      { key: 'grade', label: 'Grade Points', type: 'number' }
    ]
  },
  contacts: {
    name: 'Contacts',
    fields: [
      { key: 'name', label: 'Sender Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['open', 'resolved'] }
    ]
  },
  coupons: {
    name: 'Coupons',
    fields: [
      { key: 'code', label: 'Promo Code', type: 'text', required: true },
      { key: 'discountPercentage', label: 'Discount %', type: 'number' },
      { key: 'maxUses', label: 'Max Uses', type: 'number', default: 100 },
      { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
      { key: 'isActive', label: 'Active', type: 'boolean', default: true }
    ]
  },
  courses: {
    name: 'Courses',
    fields: [
      { key: 'title', label: 'Course Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'shortDescription', label: 'Short Subtitle (200 chars)', type: 'text', maxLength: 200 },
      { key: 'price', label: 'Offer Price (INR)', type: 'number', default: 0 },
      { key: 'originalPrice', label: 'Original MRP (INR)', type: 'number', default: 0 },
      { key: 'isFree', label: 'Is Free Course?', type: 'boolean', default: false },
      { key: 'thumbnail', label: 'Upload Thumbnail', type: 'file' },
      { key: 'category', label: 'Category', type: 'select', options: ['MATHS', 'SCIENCE', 'COMMERCE', 'GENERAL', 'ARTS', 'COMPUTER_SCIENCE'] },
      { key: 'targetClass', label: 'Target Class / Grade', type: 'select', options: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Dropper / Repeater', 'All Classes'] },
      { key: 'level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
      { key: 'language', label: 'Language', type: 'text', default: 'Hindi' },
      { key: 'totalHours', label: 'Expected Total Hours', type: 'number' },
      { key: 'prerequisites', label: 'Prerequisites', type: 'stringArray' },
      { key: 'learningOutcomes', label: 'Learning Outcomes', type: 'stringArray' },
      { key: 'tags', label: 'Tags', type: 'stringArray' },
      { key: 'faqs', label: 'FAQs', type: 'faqArray' },
      { key: 'isPublished', label: 'Published / Live', type: 'boolean', default: false },
      { key: 'isFeatured', label: 'Featured on Homepage', type: 'boolean', default: false }
    ]
  },
  batches: {
    name: 'Batches',
    fields: [
      { key: 'name', label: 'Batch Name', type: 'text', required: true },
      { key: 'course', label: 'Course', type: 'text', required: true },
      { key: 'students', label: 'Student Emails', type: 'stringArray' },
      { key: 'isActive', label: 'Active', type: 'boolean', default: true }
    ]
  },
  discussions: {
    name: 'Discussions',
    fields: [
      { key: 'course', label: 'Course ID', type: 'text' },
      { key: 'title', label: 'Topic Title', type: 'text' },
      { key: 'content', label: 'Details', type: 'textarea' },
      { key: 'isPinned', label: 'Pinned', type: 'boolean', default: false }
    ]
  },
  enrollments: {
    name: 'Enrollments',
    fields: [
      { key: 'student', label: 'Student ID', type: 'text', required: true },
      { key: 'course', label: 'Course ID', type: 'text', required: true },
      { key: 'batch', label: 'Batch', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'expired', 'refunded'] },
      { key: 'paymentId', label: 'Payment Receipt ID', type: 'text' }
    ]
  },
  livesessions: {
    name: 'Live Sessions',
    fields: [
      { key: 'title', label: 'Session Title', type: 'text', required: true },
      { key: 'course', label: 'Course ID', type: 'text', required: true },
      { key: 'batch', label: 'Batch ID (Optional)', type: 'text' },
      { key: 'scheduledAt', label: 'Scheduled Date/Time', type: 'date', required: true },
      { key: 'joinUrl', label: 'Zoom/Meet Link', type: 'text', required: true },
      { key: 'duration', label: 'Duration (mins)', type: 'number', default: 60 },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'live', 'completed', 'cancelled'] }
    ]
  },

  payments: {
    name: 'Payments',
    fields: [
      { key: 'user', label: 'User ID', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'success', 'failed', 'refunded'] },
      { key: 'transactionId', label: 'Gateway Txn ID', type: 'text' }
    ]
  },
  reviews: {
    name: 'Reviews',
    fields: [
      { key: 'course', label: 'Course ID', type: 'text' },
      { key: 'user', label: 'Student ID', type: 'text' },
      { key: 'rating', label: 'Stars (1-5)', type: 'number', required: true },
      { key: 'comment', label: 'Comment', type: 'textarea' },
      { key: 'isApproved', label: 'Approved', type: 'boolean', default: true }
    ]
  },
  studymaterials: {
    name: 'Study Materials',
    fields: [
      { key: 'title', label: 'Document Title', type: 'text', required: true },
      { key: 'course', label: 'Course ID', type: 'text', required: true },
      { key: 'fileUrl', label: 'PDF/Doc Upload', type: 'file', required: true },
      { key: 'fileType', label: 'Format', type: 'select', options: ['PDF', 'ZIP', 'DOC', 'IMAGE'] },
      { key: 'size', label: 'File Size (e.g. 1.2 MB)', type: 'text' }
    ]
  },
  practicequestions: {
    name: 'Practice Questions',
    fields: [
      { key: 'subject', label: 'Subject', type: 'select', options: ['MATHS', 'SCIENCE', 'COMMERCE', 'ARTS', 'GENERAL', 'COMPUTER_SCIENCE'], required: true },
      { key: 'class', label: 'Class', type: 'select', options: ['6', '7', '8', '9', '10', '11', '12', 'All'], required: true, default: 'All' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], required: true, default: 'Medium' },
      { key: 'question', label: 'Question Text', type: 'textarea', required: true },
      { key: 'optionA', label: 'Option A', type: 'text', required: true },
      { key: 'optionB', label: 'Option B', type: 'text', required: true },
      { key: 'optionC', label: 'Option C', type: 'text', required: true },
      { key: 'optionD', label: 'Option D', type: 'text', required: true },
      { key: 'correctOptionIndex', label: 'Correct Option Index (0-3)', type: 'select', options: ['0', '1', '2', '3'], required: true, default: '0' },
      { key: 'isActive', label: 'Active', type: 'boolean', default: true }
    ]
  },
  certificates: {
    name: 'Certificates',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'text', required: true },
      { key: 'courseName', label: 'Course Name', type: 'text', required: true },
      { key: 'certId', label: 'Certificate ID', type: 'text', required: true },
      { key: 'pdfUrl', label: 'Certificate PDF URL', type: 'text' },
      { key: 'imageUrl', label: 'Certificate Image URL', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['generating', 'generated', 'emailed', 'revoked'], default: 'generating' }
    ]
  }
};
