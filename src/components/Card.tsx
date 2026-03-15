import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, icon: Icon, onClick, className, children }) => {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm transition-all",
        onClick && "cursor-pointer hover:border-emerald-500/50 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 leading-tight">{title}</h3>
          {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className="bg-emerald-50 p-2 rounded-xl">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
};

import { cn } from '../lib/utils';
