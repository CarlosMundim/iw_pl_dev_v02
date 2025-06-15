/**
 * Cultural Fit Badge Component
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Displays cultural compatibility score with Japanese enterprise styling
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CulturalFitBadgeProps {
  score: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'ja';
  className?: string;
}

const CulturalFitBadge: React.FC<CulturalFitBadgeProps> = ({
  score,
  showLabel = true,
  size = 'md',
  language = 'en',
  className
}) => {
  // Determine fit level and styling based on score
  const getFitLevel = (score: number) => {
    if (score >= 90) return { level: 'elite', color: 'bg-emerald-500 text-white', labelEn: 'Elite Fit', labelJa: 'エリート適合' };
    if (score >= 80) return { level: 'excellent', color: 'bg-green-500 text-white', labelEn: 'Excellent', labelJa: '優秀' };
    if (score >= 70) return { level: 'good', color: 'bg-blue-500 text-white', labelEn: 'Good Fit', labelJa: '良好' };
    if (score >= 60) return { level: 'moderate', color: 'bg-yellow-500 text-black', labelEn: 'Moderate', labelJa: '普通' };
    return { level: 'low', color: 'bg-orange-500 text-white', labelEn: 'Needs Support', labelJa: 'サポート要' };
  };

  const fitData = getFitLevel(score);
  const label = language === 'ja' ? fitData.labelJa : fitData.labelEn;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        className={cn(
          fitData.color,
          sizeClasses[size],
          'font-semibold rounded-full border-0 shadow-sm',
          'transition-all duration-200 hover:shadow-md'
        )}
      >
        {score}%
      </Badge>
      {showLabel && (
        <span className={cn(
          'font-medium text-gray-700',
          language === 'ja' && 'font-japanese',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {label}
        </span>
      )}
    </div>
  );
};

export default CulturalFitBadge;