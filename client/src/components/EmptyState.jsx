import React from 'react';
import * as Icons from 'lucide-react';

const EmptyState = ({
  icon = 'Inbox',
  title = 'No items found',
  description = 'Get started by creating a new entry!',
  actionButton
}) => {
  const IconComponent = Icons[icon] || Icons.Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/30 backdrop-blur-sm transition-all duration-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/50 dark:text-brand-400 mb-4 animate-pulse">
        <IconComponent className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
