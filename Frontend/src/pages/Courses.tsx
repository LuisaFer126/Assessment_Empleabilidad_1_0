import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, LogOut, BookOpen, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
    id: string;
    title: string;
    status: number; // 0=Draft, 1=Published (Based on Enum)
}

interface Meta {
    totalCount: number;
    page: number;
    pageSize: number;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

    // Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: 8 };
            if (search) params.q = search;
            if (statusFilter !== '') params.status = statusFilter;

            const response = await api.get('/courses/search', { params });
            // Helper to map response. items? or PagedResult?
            // API returns: { items: [], totalCount: 10, page: 1, pageSize: 10 }
            const data = response.data;
            setCourses(data.items);
            setTotalPages(Math.ceil(data.totalCount / data.pageSize));
        } catch (error: any) {
            if (error?.response?.status === 401) {
                // JWT missing/invalid: clear storage and let PrivateRoute redirect.
                logout();
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page, search, statusFilter]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', { title: newTitle });
            setNewTitle('');
            setIsModalOpen(false);
            fetchCourses();
        } catch (error) {
            alert('Failed to create course');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 0' }}>

            {/* Header */}
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Courses</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.3 }}>
                        <div>{user?.email || ''}</div>
                        <div>JWT: {hasToken ? 'stored' : 'missing'}</div>
                    </div>
                    <button onClick={logout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>

                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <input
                        className="input-field"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>

                <select
                    className="input-field"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ width: '150px' }}
                >
                    <option value="">All Status</option>
                    <option value="0">Draft</option>
                    <option value="1">Published</option>
                </select>

                <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> New Course
                </button>
            </div>

            {/* Grid */}
            <div className="container">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {courses.map(course => (
                            <div
                                key={course.id}
                                className="glass-panel"
                                style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                                onClick={() => navigate(`/courses/${course.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.8rem',
                                        background: course.status === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: course.status === 1 ? 'var(--success)' : 'var(--warning)'
                                    }}>
                                        {course.status === 1 ? 'Published' : 'Draft'}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(course.id, e)}
                                        className="btn-danger"
                                        style={{ padding: '0.4rem', borderRadius: '50%' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>{course.title}</h3>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                                    Click to manage lessons
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="container" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    className="btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{ opacity: page === 1 ? 0.5 : 1 }}
                >
                    Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
                <button
                    className="btn-secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{ opacity: page === totalPages ? 0.5 : 1 }}
                >
                    Next
                </button>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Course</h2>
                        <form onSubmit={handleCreate}>
                            <input
                                className="input-field"
                                placeholder="Course Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                autoFocus
                                required
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
