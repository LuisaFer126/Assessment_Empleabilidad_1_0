import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, CheckCircle, XCircle } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    order: number;
}

interface CourseDetail {
    id: string;
    title: string;
    status: number;
    lessons: Lesson[];
}

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [editTitle, setEditTitle] = useState('');

    // Lesson Modal
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonOrder, setLessonOrder] = useState<number>(1);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data);
            setEditTitle(response.data.title);
            // Determine next order
            const maxOrder = response.data.lessons.reduce((max: number, l: any) => l.order > max ? l.order : max, 0);
            setLessonOrder(maxOrder + 1);
        } catch (error) {
            alert('Error fetching course');
            navigate('/courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCourse();
    }, [id]);

    const handleUpdateCourse = async () => {
        try {
            await api.put(`/courses/${id}`, { title: editTitle });
            alert('Saved!');
        } catch (e) { alert('Error saving'); }
    };

    const handlePublish = async () => {
        try {
            if (course?.status === 1) {
                await api.patch(`/courses/${id}/unpublish`);
            } else {
                await api.patch(`/courses/${id}/publish`);
            }
            fetchCourse();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error changing status');
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/lessons', { courseId: id, title: lessonTitle, order: lessonOrder });
            setIsLessonModalOpen(false);
            setLessonTitle('');
            fetchCourse();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error creating lesson');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete lesson?')) return;
        try {
            await api.delete(`/lessons/${lessonId}`);
            fetchCourse();
        } catch (e) { alert('Error deleting'); }
    };

    const handleReorder = async (lessonId: string, newOrder: number) => {
        // Simple prompt or UI
        // For simplicity in standard React without DnD lib:
        try {
            await api.patch(`/lessons/${lessonId}/reorder`, newOrder);
            fetchCourse();
        } catch (e) { alert('Error reordering'); }
    };

    if (loading) return <div className="container" style={{ paddingTop: '3rem' }}>Loading...</div>;
    if (!course) return null;

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container">
                <button onClick={() => navigate('/courses')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                    <ArrowLeft size={18} /> Back to Courses
                </button>

                {/* Course Header */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Course Title</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    className="input-field"
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                                <button onClick={handleUpdateCourse} className="btn-secondary" title="Save Title"><Save size={20} /></button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '1rem',
                                background: course.status === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: course.status === 1 ? 'var(--success)' : 'var(--warning)',
                                fontWeight: 'bold'
                            }}>
                                {course.status === 1 ? 'Published' : 'Draft'}
                            </div>
                            <button
                                onClick={handlePublish}
                                className={course.status === 1 ? 'btn-danger' : 'btn-primary'}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {course.status === 1 ? <><XCircle size={18} /> Unpublish</> : <><CheckCircle size={18} /> Publish</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lessons List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Lessons ({course.lessons.length})</h2>
                    <button onClick={() => setIsLessonModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add Lesson
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {course.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                        <div key={lesson.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--text-tertiary)', cursor: 'grab' }}><GripVertical size={20} /></div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {lesson.order}
                            </div>
                            <div style={{ flex: 1, fontWeight: '500' }}>{lesson.title}</div>

                            {/* Reorder Inputs (Simplified) */}
                            <input
                                type="number"
                                className="input-field"
                                style={{ width: '60px', padding: '0.25rem' }}
                                defaultValue={lesson.order}
                                onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val !== lesson.order) handleReorder(lesson.id, val);
                                }}
                            />

                            <button onClick={() => handleDeleteLesson(lesson.id)} className="btn-danger" style={{ padding: '0.5rem' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {course.lessons.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)' }}>
                            No lessons yet. Add one to publish the course.
                        </div>
                    )}
                </div>
            </div>

            {/* Create Lesson Modal */}
            {isLessonModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Lesson</h2>
                        <form onSubmit={handleCreateLesson}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title</label>
                                <input
                                    className="input-field"
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Order</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={lessonOrder}
                                    onChange={(e) => setLessonOrder(parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsLessonModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
