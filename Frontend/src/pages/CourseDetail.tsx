import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getCourseSummary, type CourseSummary } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, CheckCircle, XCircle, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

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
    const { logout } = useAuth();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [editTitle, setEditTitle] = useState('');

    // Summary (GET /courses/{id}/summary)
    const [summary, setSummary] = useState<CourseSummary | null>(null);

    // Drag and drop reorder (no extra libs)
    const [draggingLessonId, setDraggingLessonId] = useState<string | null>(null);
    const [dropTargetLessonId, setDropTargetLessonId] = useState<string | null>(null);

    // Lesson Modal
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonOrder, setLessonOrder] = useState<number>(1);

    // Edit Lesson Modal
    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [editingLessonTitle, setEditingLessonTitle] = useState('');

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data);
            setEditTitle(response.data.title);
            // Determine next order
            const maxOrder = response.data.lessons.reduce((max: number, l: any) => l.order > max ? l.order : max, 0);
            setLessonOrder(maxOrder + 1);

            // Summary endpoint (business rule visibility)
            if (id) {
                const s = await getCourseSummary(id);
                setSummary(s);
            }
        } catch (error) {
            const err = error as any;
            if (err?.response?.status === 401) {
                logout();
                navigate('/login');
                return;
            }

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

    const openEditLessonModal = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setEditingLessonTitle(lesson.title);
        setIsEditLessonModalOpen(true);
    };

    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLesson) return;

        try {
            await api.put(`/lessons/${editingLesson.id}`, { title: editingLessonTitle, order: editingLesson.order });
            setIsEditLessonModalOpen(false);
            setEditingLesson(null);
            setEditingLessonTitle('');
            fetchCourse();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error updating lesson');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '3rem' }}>Loading...</div>;
    if (!course) return null;

    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

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

                            {summary && (
                                <div style={{ marginTop: '0.9rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
                                    <span><strong style={{ color: 'white' }}>Total lessons:</strong> {summary.totalLessons}</span>
                                    <span><strong style={{ color: 'white' }}>Last modified:</strong> {new Date(summary.lastModified).toLocaleString()}</span>
                                </div>
                            )}
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
                    {sortedLessons.map((lesson, index) => {
                        const canMoveUp = index > 0;
                        const canMoveDown = index < sortedLessons.length - 1;
                        const upOrder = canMoveUp ? sortedLessons[index - 1].order : lesson.order;
                        const downOrder = canMoveDown ? sortedLessons[index + 1].order : lesson.order;
                        const isDropTarget = dropTargetLessonId === lesson.id && draggingLessonId && draggingLessonId !== lesson.id;

                        return (
                            <div
                                key={lesson.id}
                                className="glass"
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => setDropTargetLessonId(lesson.id)}
                                onDragLeave={() => setDropTargetLessonId(null)}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    if (!draggingLessonId || draggingLessonId === lesson.id) return;
                                    await handleReorder(draggingLessonId, lesson.order);
                                    setDraggingLessonId(null);
                                    setDropTargetLessonId(null);
                                }}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    border: isDropTarget ? '1px solid rgba(124, 58, 237, 0.6)' : '1px solid transparent'
                                }}
                            >
                                <div
                                    style={{ color: 'var(--text-tertiary)', cursor: 'grab', display: 'flex' }}
                                    draggable
                                    title="Drag to reorder"
                                    onDragStart={() => setDraggingLessonId(lesson.id)}
                                    onDragEnd={() => {
                                        setDraggingLessonId(null);
                                        setDropTargetLessonId(null);
                                    }}
                                >
                                    <GripVertical size={20} />
                                </div>

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

                                <button
                                    className="btn-secondary"
                                    disabled={!canMoveUp}
                                    onClick={() => handleReorder(lesson.id, upOrder)}
                                    title="Move up"
                                    style={{ padding: '0.45rem', opacity: canMoveUp ? 1 : 0.45 }}
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    className="btn-secondary"
                                    disabled={!canMoveDown}
                                    onClick={() => handleReorder(lesson.id, downOrder)}
                                    title="Move down"
                                    style={{ padding: '0.45rem', opacity: canMoveDown ? 1 : 0.45 }}
                                >
                                    <ChevronDown size={16} />
                                </button>

                                <button
                                    className="btn-secondary"
                                    onClick={() => openEditLessonModal(lesson)}
                                    title="Edit lesson"
                                    style={{ padding: '0.45rem' }}
                                >
                                    <Pencil size={16} />
                                </button>

                                <button onClick={() => handleDeleteLesson(lesson.id)} className="btn-danger" style={{ padding: '0.5rem' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
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

            {/* Edit Lesson Modal */}
            {isEditLessonModalOpen && editingLesson && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '420px', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Edit Lesson</h2>
                        <form onSubmit={handleUpdateLesson}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title</label>
                                <input
                                    className="input-field"
                                    value={editingLessonTitle}
                                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div style={{ marginBottom: '1rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                                Order: <strong style={{ color: 'white' }}>{editingLesson.order}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditLessonModalOpen(false);
                                        setEditingLesson(null);
                                        setEditingLessonTitle('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
