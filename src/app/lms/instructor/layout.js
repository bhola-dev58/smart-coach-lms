import InstructorSidebar from '@/components/lms/instructor/InstructorSidebar';

export const metadata = {
  title: 'Instructor Panel | MeetMe Center',
};

export default function InstructorLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // Adjust based on Topbar height
      overflow: 'hidden' // So only the main content scrolls
    }}>
      {/* Permanent Left Inner Sidebar */}
      <div style={{ flexShrink: 0 }}>
        <InstructorSidebar />
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
}
