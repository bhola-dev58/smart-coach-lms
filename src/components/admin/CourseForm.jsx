'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseForm({ initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(initialData || {
    title: '', slug: '', shortDescription: '', description: '',
    category: '', level: 'Beginner', language: 'English',
    price: 0, originalPrice: 0, 
    thumbnail: '', totalHours: 0, totalLessons: 0,
    learningOutcomes: [''],
    chapters: [],
    faqs: [],
    isPublished: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const ArrayManager = ({ title, items, onAdd, onUpdate, onRemove, renderItem }) => (
    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #eaeaea' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
         <h4 style={{ margin: 0, color: '#333' }}>{title}</h4>
         <button type="button" onClick={onAdd} style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add</button>
      </div>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>{renderItem(item, index, (newVal) => onUpdate(index, newVal))}</div>
          <button type="button" onClick={() => onRemove(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>X</button>
        </div>
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const method = initialData ? 'PUT' : 'POST';
      const payload = initialData ? { ...formData, _id: initialData._id } : formData;
      
      const res = await fetch('/api/admin/courses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save course');
      
      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '1rem', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.9rem', color: '#555' };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      {error && <div style={{ background: '#f8d7da', color: '#842029', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
         <div>
            <label style={labelStyle}>Course Title *</label>
            <input style={inputStyle} required name="title" value={formData.title} onChange={handleChange} />
         </div>
         <div>
            <label style={labelStyle}>URL Slug (Leave blank for auto)</label>
            <input style={inputStyle} name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. advance-maths" />
         </div>
      </div>

      <div>
         <label style={labelStyle}>Short Description *</label>
         <input style={inputStyle} required name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
      </div>

      <div>
         <label style={labelStyle}>Full Description</label>
         <textarea style={{...inputStyle, minHeight: '100px'}} name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
         <div>
            <label style={labelStyle}>Category *</label>
            <input style={inputStyle} required name="category" value={formData.category} onChange={handleChange} />
         </div>
         <div>
            <label style={labelStyle}>Level</label>
            <select style={inputStyle} name="level" value={formData.level} onChange={handleChange}>
               <option value="Beginner">Beginner</option>
               <option value="Intermediate">Intermediate</option>
               <option value="Advanced">Advanced</option>
            </select>
         </div>
         <div>
            <label style={labelStyle}>Price (₹) *</label>
            <input style={inputStyle} type="number" required name="price" value={formData.price} onChange={handleChange} />
         </div>
         <div>
            <label style={labelStyle}>Original Price (₹)</label>
            <input style={inputStyle} type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
         <div>
            <label style={labelStyle}>Thumbnail URL</label>
            <input style={inputStyle} name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="/images/courses/maths.jpg" />
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="checkbox" id="isPublished" name="isPublished" checked={formData.isPublished} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
            <label htmlFor="isPublished" style={{ fontWeight: 600, color: '#333' }}>Publish Course (Visible to Students)</label>
         </div>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#eaeaea' }} />

      <ArrayManager 
        title="Learning Outcomes" 
        items={formData.learningOutcomes} 
        onAdd={() => setFormData(p => ({ ...p, learningOutcomes: [...p.learningOutcomes, ''] }))}
        onRemove={(idx) => setFormData(p => ({ ...p, learningOutcomes: p.learningOutcomes.filter((_, i) => i !== idx) }))}
        onUpdate={(idx, val) => {
           let newArr = [...formData.learningOutcomes];
           newArr[idx] = val;
           setFormData(p => ({...p, learningOutcomes: newArr}));
        }}
        renderItem={(item, idx, update) => (
           <input style={{...inputStyle, marginBottom: 0}} value={item} onChange={e => update(e.target.value)} placeholder="E.g. Build full stack apps" />
        )}
      />

      <hr style={{ margin: '2rem 0', borderColor: '#eaeaea' }} />
      <h3 style={{ marginBottom: '1rem' }}>Chapters & Lessons</h3>
      {/* Basic Chapters Editor - for more advanced, we should break this into another component */}
      <div style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
         (Database structure supports deep nesting. Admin UI currently accepts raw JSON structure for bulk chapter/lesson updates to allow rapid curriculum building)
      </div>
      <textarea 
         style={{ ...inputStyle, minHeight: '300px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
         name="chapters" 
         required
         value={typeof formData.chapters === 'string' ? formData.chapters : JSON.stringify(formData.chapters, null, 2)} 
         onChange={(e) => {
           // We keep it as string while typing, parse on submit
           setFormData(p => ({...p, chapters: e.target.value}));
         }} 
      />
      <small style={{display: 'block', marginTop: '-10px', marginBottom: '2rem', color: '#888'}}>Must be valid JSON array of objects. Example: [ {`{"title":"Intro", "lessons":[{"title":"L1", "slug":"l1", "videoUrl":"..."}]}`} ]</small>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" disabled={loading} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : (initialData ? 'Update Course' : 'Create Course')}
        </button>
        <button type="button" onClick={() => router.back()} style={{ background: 'transparent', color: '#555', padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
