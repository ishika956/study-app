import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, BookOpen, Trash2, ArrowRight, X } from 'lucide-react';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();

  // Fetch courses from DB
  const fetchCourses = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      toast.error('Course name cannot be empty');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/courses', { name: newCourseName });
      toast.success(`Course "${response.data.name}" created!`);
      setNewCourseName('');
      setIsModalOpen(false);
      // Re-fetch courses list
      fetchCourses(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create course';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (e, courseId, name) => {
    e.stopPropagation(); // prevent card click navigate
    
    if (window.confirm(`Are you absolutely sure you want to delete "${name}"?\nAll targets, notes, drawings, and uploaded documents will be deleted forever.`)) {
      try {
        await api.delete(`/courses/${courseId}`);
        toast.success(`Course "${name}" deleted.`);
        // Filter out locally for instant response
        setCourses(courses.filter((c) => c._id !== courseId));
      } catch (error) {
        toast.error('Failed to delete course.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-theme pb-12">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Courses
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Track progress, store notes, sketch concepts, and organize materials.
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer dark:shadow-brand-500/10"
            type="button"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </button>
        </div>

        {/* Courses Area */}
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon="BookOpen"
            title="No courses yet"
            description="Create your first study course card to start managing your learning targets, notes, whiteboard sketches, and files!"
            actionButton={
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Course
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-350 dark:border-slate-800/80 dark:bg-slate-900 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Visual card corner accent */}
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-brand-500/5 group-hover:bg-brand-500/10 blur-xl transition-all" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-400 transition-all duration-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    {/* Delete course button */}
                    <button
                      onClick={(e) => handleDeleteCourse(e, course._id, course.name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white truncate group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    {course.name}
                  </h3>

                  {/* Dynamic Targets summary text */}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {course.totalTargets > 0
                      ? `${course.completedTargets} of ${course.totalTargets} targets completed`
                      : 'No targets defined yet'}
                  </p>
                </div>

                <div className="mt-8">
                  {/* Progress Line */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target Completion
                    </span>
                    <span className="text-xs font-black text-brand-500 dark:text-brand-400">
                      {course.completion}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 group-hover:from-brand-600 group-hover:to-indigo-600 transition-all duration-500"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>

                  {/* Hover action guide */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-500 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Open course hub <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
          />

          {/* Modal Container */}
          <div className="glass relative w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-all duration-350 transform scale-100 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Create New Course
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-brand-500"
                  placeholder="e.g. Advanced Calculus, Machine Learning"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer"
                >
                  {isCreating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
