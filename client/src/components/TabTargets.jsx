import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const TabTargets = ({ courseId, onProgressUpdate }) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch targets
  const fetchTargets = async () => {
    try {
      const response = await api.get(`/targets/${courseId}`);
      setTargets(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load targets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [courseId]);

  // Compute completion stats
  const totalCount = targets.length;
  const completedCount = targets.filter(t => t.isDone).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Propagate progress changes up to the parent page so it stays sync'd
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(percent);
    }
  }, [percent, onProgressUpdate]);

  // Create a new target
  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!newTargetTitle.trim()) return;

    setIsAdding(true);
    try {
      const response = await api.post(`/targets/${courseId}`, { title: newTargetTitle });
      setTargets([...targets, response.data]);
      setNewTargetTitle('');
      toast.success('Target added!');
    } catch (error) {
      toast.error('Failed to add target.');
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle isDone state
  const handleToggleTarget = async (targetId, currentStatus) => {
    // Update locally for instant responsiveness
    setTargets(
      targets.map((t) => (t._id === targetId ? { ...t, isDone: !currentStatus } : t))
    );

    try {
      await api.patch(`/targets/${courseId}/${targetId}`, { isDone: !currentStatus });
    } catch (error) {
      toast.error('Failed to update target status.');
      // Revert state on error
      setTargets(
        targets.map((t) => (t._id === targetId ? { ...t, isDone: currentStatus } : t))
      );
    }
  };

  // Delete a target
  const handleDeleteTarget = async (targetId) => {
    const backup = [...targets];
    // Optimistic local update
    setTargets(targets.filter((t) => t._id !== targetId));

    try {
      await api.delete(`/targets/${courseId}/${targetId}`);
      toast.success('Target deleted.');
    } catch (error) {
      toast.error('Failed to delete target.');
      setTargets(backup);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Target Progress Bar panel */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Course Progress Tracker
            </span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {percent}% Completed
            </h4>
          </div>
          <span className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-black text-brand-500 dark:bg-brand-950/50 dark:text-brand-400">
            {completedCount} of {totalCount} goals
          </span>
        </div>
        
        {/* Progress bar container */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Targets Adder Form */}
      <form onSubmit={handleAddTarget} className="flex gap-3">
        <input
          type="text"
          value={newTargetTitle}
          onChange={(e) => setNewTargetTitle(e.target.value)}
          className="block w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-brand-500"
          placeholder="What is your next goal or topic for this course?"
          required
        />
        <button
          type="submit"
          disabled={isAdding || !newTargetTitle.trim()}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-brand-500 hover:bg-brand-600 px-6 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 cursor-pointer"
        >
          {isAdding ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Plus className="h-4.5 w-4.5" /> Add
            </>
          )}
        </button>
      </form>

      {/* Targets List */}
      {targets.length === 0 ? (
        <EmptyState
          icon="CheckCircle2"
          title="No targets yet"
          description="Create some learning milestones! Check them off as you review topics, finish chapters, or write assignments."
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {targets.map((target) => (
              <div
                key={target._id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                {/* Tapping on the row toggles the item */}
                <div
                  onClick={() => handleToggleTarget(target._id, target.isDone)}
                  className="flex flex-1 items-center gap-3.5 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className="text-slate-400 group-hover:scale-105 transition-transform"
                  >
                    {target.isDone ? (
                      <CheckCircle2 className="h-6 w-6 text-brand-500 fill-brand-500/10" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                    )}
                  </button>
                  <span
                    className={`text-sm font-medium transition-all ${
                      target.isDone
                        ? 'text-slate-400 line-through decoration-brand-400/40 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {target.title}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTarget(target._id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
                  title="Delete Target"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabTargets;
