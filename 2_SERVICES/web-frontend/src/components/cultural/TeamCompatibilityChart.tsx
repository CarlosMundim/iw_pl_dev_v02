/**
 * Team Compatibility Chart Component
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Visualizes how a candidate fits within existing team dynamics
 * Critical for Japanese enterprises focused on team harmony (wa)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  culturalProfile: {
    hierarchyComfort: number;
    communicationDirectness: number;
    decisionMakingStyle: number;
    teamOrientation: number;
  };
  compatibilityScore: number; // 0-100 compatibility with candidate
}

interface TeamCompatibilityChartProps {
  candidateName: string;
  teamMembers: TeamMember[];
  overallCompatibility: number; // 0-100
  riskFactors?: string[];
  strengths?: string[];
  language?: 'en' | 'ja';
  className?: string;
}

const TeamCompatibilityChart: React.FC<TeamCompatibilityChartProps> = ({
  candidateName,
  teamMembers,
  overallCompatibility,
  riskFactors = [],
  strengths = [],
  language = 'en',
  className
}) => {
  // Prepare data for radial chart
  const compatibilityData = teamMembers.map((member, index) => ({
    name: member.name,
    compatibility: member.compatibilityScore,
    fill: getCompatibilityColor(member.compatibilityScore),
    role: member.role
  }));

  // Color mapping for compatibility scores
  function getCompatibilityColor(score: number): string {
    if (score >= 85) return '#10b981'; // Green - Excellent
    if (score >= 70) return '#3b82f6'; // Blue - Good  
    if (score >= 60) return '#f59e0b'; // Amber - Moderate
    return '#ef4444'; // Red - Needs Attention
  }

  // Overall compatibility level
  const getCompatibilityLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent', icon: '🌟', color: 'text-green-600', labelJa: '優秀' };
    if (score >= 70) return { level: 'Good', icon: '✅', color: 'text-blue-600', labelJa: '良好' };
    if (score >= 60) return { level: 'Moderate', icon: '⚠️', color: 'text-amber-600', labelJa: '普通' };
    return { level: 'Needs Support', icon: '🔄', color: 'text-red-600', labelJa: 'サポート要' };
  };

  const compatibilityLevel = getCompatibilityLevel(overallCompatibility);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className={cn(
          'text-lg',
          language === 'ja' && 'font-japanese'
        )}>
          <div className="flex items-center justify-between">
            <span>
              {language === 'ja' ? 'チーム適合性分析' : 'Team Compatibility Analysis'}
            </span>
            <Badge className={cn('px-3 py-1', compatibilityLevel.color)}>
              {compatibilityLevel.icon} {overallCompatibility}%
            </Badge>
          </div>
        </CardTitle>
        <p className={cn(
          'text-sm text-gray-600',
          language === 'ja' && 'font-japanese'
        )}>
          {language === 'ja' 
            ? `${candidateName}さんと既存チームとの相性`
            : `How ${candidateName} fits with existing team members`
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Compatibility Score */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">
            <span className={compatibilityLevel.color}>
              {overallCompatibility}%
            </span>
          </div>
          <p className={cn(
            'text-sm font-medium',
            compatibilityLevel.color,
            language === 'ja' && 'font-japanese'
          )}>
            {language === 'ja' ? compatibilityLevel.labelJa : compatibilityLevel.level}
          </p>
        </div>

        {/* Individual Team Member Compatibility */}
        <div className="space-y-4">
          <h4 className={cn(
            'font-semibold text-sm',
            language === 'ja' && 'font-japanese'
          )}>
            {language === 'ja' ? '個別メンバー適合度' : 'Individual Member Compatibility'}
          </h4>
          
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{member.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${member.compatibilityScore}%`,
                          backgroundColor: getCompatibilityColor(member.compatibilityScore)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className="font-bold text-sm">
                    {member.compatibilityScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Risk Factors */}
        {(strengths.length > 0 || riskFactors.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="space-y-2">
                <h5 className={cn(
                  'font-semibold text-sm text-green-700',
                  language === 'ja' && 'font-japanese'
                )}>
                  ✅ {language === 'ja' ? '強み' : 'Strengths'}
                </h5>
                <ul className="space-y-1">
                  {strengths.map((strength, index) => (
                    <li key={index} className={cn(
                      'text-sm text-green-600 flex items-start gap-1',
                      language === 'ja' && 'font-japanese text-xs'
                    )}>
                      <span className="text-green-500 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div className="space-y-2">
                <h5 className={cn(
                  'font-semibold text-sm text-amber-700',
                  language === 'ja' && 'font-japanese'
                )}>
                  ⚠️ {language === 'ja' ? 'リスク要因' : 'Risk Factors'}
                </h5>
                <ul className="space-y-1">
                  {riskFactors.map((risk, index) => (
                    <li key={index} className={cn(
                      'text-sm text-amber-600 flex items-start gap-1',
                      language === 'ja' && 'font-japanese text-xs'
                    )}>
                      <span className="text-amber-500 mt-0.5">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Cultural Harmony Prediction */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 font-semibold text-sm">
              🎯 {language === 'ja' ? '和(wa)予測' : 'Team Harmony Prediction'}
            </span>
          </div>
          <p className={cn(
            'text-xs text-blue-700',
            language === 'ja' && 'font-japanese'
          )}>
            {language === 'ja' 
              ? `この候補者はチームの和を${overallCompatibility >= 80 ? '向上' : overallCompatibility >= 60 ? '維持' : '改善要'}させる可能性が高いです`
              : `This candidate is likely to ${overallCompatibility >= 80 ? 'enhance' : overallCompatibility >= 60 ? 'maintain' : 'require support for'} team harmony (wa)`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCompatibilityChart;