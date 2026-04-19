'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { schemaConfig } from '@/components/lms/instructor/schemaConfig';
import DataTable from '@/components/lms/instructor/DataTable';
import SchemaFormModal from '@/components/lms/instructor/SchemaFormModal';

export default function GenericResourcePage({ params }) {
  const router = useRouter();
  const resource = params.resource.toLowerCase();
  const config = schemaConfig[resource];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    if (!config) return; // Ignore if config not found
    fetchData();
  }, [resource, config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/instructor/crud/${resource}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        console.error(json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const isEdit = !!formData._id;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(`/api/instructor/crud/${resource}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        fetchData(); // reload
      } else {
        alert(json.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete this ${config.name} item?`)) return;
    
    try {
      const res = await fetch(`/api/instructor/crud/${resource}?id=${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        setData(prev => prev.filter(r => r._id !== id));
      } else {
        alert(json.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!config) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Resource Not Found</h2>
        <p>The system does not have an admin configuration for "{resource}".</p>
      </div>
    );
  }

  // Build columns for DataTable from config fields
  const columns = config.fields.map(f => ({
    key: f.key,
    label: f.label,
    render: (val) => {
       if (f.type === 'boolean') return val ? 'Yes' : 'No';
       if (f.type === 'file' && val) return <a href={val} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>Link</a>;
       if (f.type === 'date' && val) return new Date(val).toLocaleDateString();
       
       // Truncate long text
       if (typeof val === 'string' && val.length > 50) return val.substring(0, 47) + '...';
       return val;
    }
  }));

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dash-text-muted)' }}>
          Loading {config.name}...
        </div>
      ) : (
        <DataTable 
          resourceName={config.name}
          columns={columns}
          data={data}
          onAdd={() => { setEditingRow(null); setIsModalOpen(true); }}
          onEdit={(row) => { setEditingRow(row); setIsModalOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      {isModalOpen && (
        <SchemaFormModal 
          config={config}
          initialData={editingRow}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
