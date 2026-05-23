import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import TabTargets from '../components/TabTargets';
import TabWhiteboard from '../components/TabWhiteboard';
import TabNotes from '../components/TabNotes';
import TabDocuments from '../components/TabDocuments';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckSquare, Palette, FileText, FolderOpen } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('targets'); // 'targets', 'whiteboard', 'notes', 'docs'

  // Fetch course detail metadata
  const fetchCourseData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/courses');
      const matchedCourse = response.data.find((c) => c._id === id);
      
      if (!matchedCourse) {
        toast.error('Course not found or access denied.');
        navigate('/');
        return;
      }
      setCourse(matchedCourse);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // Synchronously update header progress percentage when targets change
  const handleProgressUpdate = (newPercent) => {
    if (course && course.completion !== newPercent) {
      setCourse({
        ...course,
        completion: newPercent
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
        <Navbar />
        <div className="flex h-[450px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  // Tabs metadata definition
  const tabs = [
    { id: 'targets', label: 'Targets & Goals', icon: CheckSquare },
    { id: 'whiteboard', label: 'Whiteboard Sketch', icon: Palette },
    { id: 'notes', label: 'Course Notes', icon: FileText },
    { id: 'docs', label: 'Study Documents', icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-theme pb-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Back navigation & Course Title Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/50 pb-6 dark:border-slate-800/80 mb-6">
          <div className="space-y-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white leading-tight">
              {course.name}
            </h1>
          </div>

          {/* Quick Header Course progress wheel */}
          <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-200/60 p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 shrink-0">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400">
              <span className="text-[10px] font-black">{course.completion}%</span>
              {/* SVG circular track preview */}
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - course.completion / 100)}`}
                  className="text-brand-500 transition-all duration-500"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-850 dark:text-white">Overall Completion</h4>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">
                Active learning tracks
              </p>
            </div>
          </div>
        </div>

        {/* Custom Tab selectors */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                    : 'border-transparent text-slate-450 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                type="button"
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Pane Content */}
        <div className="mt-4">
          {activeTab === 'targets' && (
            <TabTargets courseId={id} onProgressUpdate={handleProgressUpdate} />
          )}
          {activeTab === 'whiteboard' && <TabWhiteboard courseId={id} />}
          {activeTab === 'notes' && <TabNotes courseId={id} />}
          {activeTab === 'docs' && <TabDocuments courseId={id} />}
        </div>

      </main>
    </div>
  );
};

export default CourseDetail;
