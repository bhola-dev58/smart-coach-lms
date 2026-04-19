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
      { key: 'dueDate', label: 'Due Date', type: 'date' },
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
      { key: 'slug', label: 'URL Slug', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'shortDescription', label: 'Short Subtitle (200 chars)', type: 'text' },
      { key: 'price', label: 'Offer Price (INR)', type: 'number', default: 0 },
      { key: 'originalPrice', label: 'Original MRP (INR)', type: 'number', default: 0 },
      { key: 'isFree', label: 'Is Free Course?', type: 'boolean', default: false },
      { key: 'thumbnail', label: 'Cover Image URL', type: 'file' },
      { key: 'previewVideoUrl', label: 'Intro Video URL', type: 'file' },
      { key: 'category', label: 'Category', type: 'select', options: ['CSE', 'ECE', 'MECH', 'CIVIL', 'AI/ML', 'GATE', 'MATHS', 'GENERAL', 'SCIENCE', 'COMMERCE'] },
      { key: 'level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
      { key: 'language', label: 'Language', type: 'text', default: 'Hindi' },
      { key: 'totalHours', label: 'Expected Total Hours', type: 'number' },
      { key: 'prerequisites', label: 'Prerequisites (Comma separated)', type: 'stringArray' },
      { key: 'learningOutcomes', label: 'Learning Outcomes (Comma separated)', type: 'stringArray' },
      { key: 'tags', label: 'Tags (Comma separated)', type: 'stringArray' },
      { key: 'faqs', label: 'FAQs', type: 'faqArray' },
      { key: 'isPublished', label: 'Published / Live', type: 'boolean', default: false },
      { key: 'isFeatured', label: 'Featured on Homepage', type: 'boolean', default: false }
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
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'suspended'] },
      { key: 'paymentId', label: 'Payment Receipt ID', type: 'text' }
    ]
  },
  livesessions: {
    name: 'Live Sessions',
    fields: [
      { key: 'title', label: 'Session Title', type: 'text', required: true },
      { key: 'course', label: 'Course ID', type: 'text', required: true },
      { key: 'date', label: 'Scheduled Date/Time', type: 'date', required: true },
      { key: 'meetingLink', label: 'Zoom/Meet Link', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'live', 'ended'] }
    ]
  },
  notifications: {
    name: 'Notifications',
    fields: [
      { key: 'user', label: 'User ID (Empty for All)', type: 'text' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'isRead', label: 'Read', type: 'boolean', default: false }
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
      { key: 'course', label: 'Course ID', type: 'text' },
      { key: 'fileUrl', label: 'PDF/Doc Upload', type: 'file', required: true },
      { key: 'type', label: 'Format', type: 'select', options: ['pdf', 'doc', 'link', 'other'] }
    ]
  }
};
