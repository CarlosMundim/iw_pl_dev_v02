/**
 * Talent Onboarding Page
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Multi-step onboarding with cultural intelligence assessment
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CulturalFitBadge from '@/components/cultural/CulturalFitBadge';
import JapanReadinessScore from '@/components/cultural/JapanReadinessScore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const talentOnboardingSchema = z.object({
  // Step 1: Professional Information
  currentTitle: z.string().min(2, 'Job title is required'),
  experienceYears: z.number().min(0).max(50),
  industryExperience: z.array(z.string()).min(1, 'Select at least one industry'),
  skills: z.array(z.string()).min(3, 'Add at least 3 skills'),
  
  // Step 2: Cultural Assessment
  workStylePreference: z.enum(['hierarchical', 'flat', 'mixed']),
  communicationStyle: z.enum(['direct', 'indirect', 'contextual']),
  teamOrientation: z.enum(['individual', 'collaborative', 'leadership']),
  conflictResolution: z.enum(['direct', 'mediated', 'harmonious']),
  decisionMaking: z.enum(['quick', 'consensus', 'analytical']),
  
  // Step 3: Preferences
  remotePreference: z.enum(['onsite', 'remote', 'hybrid']),
  salaryExpectation: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }),
  preferredLocations: z.array(z.string()),
  availabilityDate: z.string(),
  
  // Step 4: Japan-specific
  japanInterest: z.boolean(),
  japaneseLevel: z.enum(['none', 'basic', 'intermediate', 'advanced', 'native']).optional(),
  culturalAdaptability: z.number().min(1).max(10).optional(),
  hierarchyComfort: z.number().min(1).max(10).optional(),
});

type TalentOnboardingData = z.infer<typeof talentOnboardingSchema>;

export default function TalentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [culturalScore, setCulturalScore] = useState(0);
  const [japanReadinessData, setJapanReadinessData] = useState<{
    score: number;
    level: 'Elite' | 'Advanced' | 'Intermediate' | 'Beginner';
    breakdown: {
      hierarchicalAdaptation: number;
      communicationStyle: number;
      teamHarmony: number;
      workEthics: number;
      conflictResolution: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TalentOnboardingData>({
    resolver: zodResolver(talentOnboardingSchema),
    defaultValues: {
      experienceYears: 0,
      industryExperience: [],
      skills: [],
      preferredLocations: [],
      salaryExpectation: {
        currency: 'USD',
        min: 50000,
        max: 100000,
      },
      japanInterest: false,
    },
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Marketing', 'Sales', 'Operations',
    'Design', 'Engineering', 'Research', 'Legal', 'HR'
  ];

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Team Management', 'Strategic Planning'
  ];

  const calculateCulturalScore = (data: Partial<TalentOnboardingData>) => {
    // Simplified cultural scoring algorithm
    let score = 50; // Base score
    
    if (data.workStylePreference === 'hierarchical') score += 15;
    if (data.communicationStyle === 'indirect') score += 10;
    if (data.teamOrientation === 'collaborative') score += 15;
    if (data.conflictResolution === 'harmonious') score += 10;
    
    return Math.min(score, 100);
  };

  const calculateJapanReadiness = (data: Partial<TalentOnboardingData>) => {
    if (!data.japanInterest) return null;

    const baseScore = 40;
    let score = baseScore;
    
    // Language bonus
    if (data.japaneseLevel === 'basic') score += 10;
    if (data.japaneseLevel === 'intermediate') score += 20;
    if (data.japaneseLevel === 'advanced') score += 30;
    if (data.japaneseLevel === 'native') score += 40;
    
    // Cultural adaptability
    if (data.culturalAdaptability) score += data.culturalAdaptability * 2;
    if (data.hierarchyComfort) score += data.hierarchyComfort * 1.5;
    
    return {
      score: Math.min(score, 100),
      level: score >= 80 ? 'Elite' : score >= 65 ? 'Advanced' : score >= 50 ? 'Intermediate' : 'Beginner' as 'Elite' | 'Advanced' | 'Intermediate' | 'Beginner',
      breakdown: {
        hierarchicalAdaptation: data.hierarchyComfort ? data.hierarchyComfort * 10 : 50,
        communicationStyle: data.communicationStyle === 'indirect' ? 85 : 60,
        teamHarmony: data.teamOrientation === 'collaborative' ? 90 : 70,
        workEthics: 85, // Default high score
        conflictResolution: data.conflictResolution === 'harmonious' ? 95 : 75,
      }
    };
  };

  const onSubmit = async (data: TalentOnboardingData) => {
    setIsLoading(true);
    try {
      // Calculate final scores
      const finalCulturalScore = calculateCulturalScore(data);
      const japanReadiness = calculateJapanReadiness(data);
      
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation:
      // await api.post('/onboarding/talent', { ...data, culturalScore: finalCulturalScore, japanReadiness });
      
      toast.success('Onboarding completed! 🎉');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      
      // Calculate cultural score when moving to assessment results
      if (step === 3) {
        const formData = watch();
        const score = calculateCulturalScore(formData);
        setCulturalScore(score);
        
        const japanData = calculateJapanReadiness(formData);
        setJapanReadinessData(japanData);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to iWORKZ! 🎉
          </h1>
          <p className="text-gray-600">
            Let's set up your profile with cultural intelligence assessment
          </p>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Professional Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-blue-100 p-2 rounded-lg">👨‍💼</span>
                      <span>Professional Information</span>
                    </CardTitle>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Job Title
                    </label>
                    <input
                      {...register('currentTitle')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.currentTitle && (
                      <p className="text-red-500 text-xs mt-1">{errors.currentTitle.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      {...register('experienceYears', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Experience (Select all that apply)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {industries.map((industry) => (
                        <label key={industry} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={industry}
                            {...register('industryExperience')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {industry}
                        </label>
                      ))}
                    </div>
                    {errors.industryExperience && (
                      <p className="text-red-500 text-xs mt-1">{errors.industryExperience.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top Skills (Select at least 3)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {skillOptions.map((skill) => (
                        <label key={skill} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={skill}
                            {...register('skills')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                    {errors.skills && (
                      <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Cultural Assessment */}
              {step === 2 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-purple-100 p-2 rounded-lg">🧠</span>
                      <span>Cultural Intelligence Assessment</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      This helps us understand your work style and cultural preferences
                    </p>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Work Structure
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'hierarchical', label: 'Hierarchical - Clear chain of command' },
                        { value: 'flat', label: 'Flat - Equal collaboration' },
                        { value: 'mixed', label: 'Mixed - Flexible structure' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('workStylePreference')}
                            type="radio"
                            value={option.value}
                            className="text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Communication Style
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'direct', label: 'Direct - Straightforward and explicit' },
                        { value: 'indirect', label: 'Indirect - Subtle and contextual' },
                        { value: 'contextual', label: 'Contextual - Depends on situation' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('communicationStyle')}
                            type="radio"
                            value={option.value}
                            className="text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Orientation
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'individual', label: 'Individual contributor' },
                        { value: 'collaborative', label: 'Team collaboration' },
                        { value: 'leadership', label: 'Team leadership' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('teamOrientation')}
                            type="radio"
                            value={option.value}
                            className="text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Japan-Specific Assessment */}
              {step === 3 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-red-100 p-2 rounded-lg">🇯🇵</span>
                      <span>Japan Readiness Assessment</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Optional: Assess your readiness for Japanese workplace culture
                    </p>
                  </CardHeader>

                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('japanInterest')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium">
                        I'm interested in opportunities in Japan
                      </span>
                    </label>
                  </div>

                  {watch('japanInterest') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Japanese Language Level
                        </label>
                        <select
                          {...register('japaneseLevel')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="none">No Japanese</option>
                          <option value="basic">Basic (JLPT N5-N4)</option>
                          <option value="intermediate">Intermediate (JLPT N3-N2)</option>
                          <option value="advanced">Advanced (JLPT N1)</option>
                          <option value="native">Native/Fluent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cultural Adaptability (1-10)
                        </label>
                        <input
                          {...register('culturalAdaptability', { valueAsNumber: true })}
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Prefer familiar</span>
                          <span>Highly adaptable</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comfort with Hierarchy (1-10)
                        </label>
                        <input
                          {...register('hierarchyComfort', { valueAsNumber: true })}
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Prefer equality</span>
                          <span>Comfortable with hierarchy</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Cultural Intelligence Results */}
              {step === 4 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-emerald-100 p-2 rounded-lg">📊</span>
                      <span>Your Cultural Intelligence Score</span>
                    </CardTitle>
                  </CardHeader>

                  <div className="text-center space-y-4">
                    <CulturalFitBadge 
                      score={culturalScore} 
                      size="lg" 
                      className="justify-center"
                    />
                    
                    <p className="text-gray-600">
                      Your cultural compatibility score indicates how well you might fit 
                      with different organizational cultures, especially Japanese enterprises.
                    </p>
                  </div>

                  {japanReadinessData && (
                    <div className="flex justify-center">
                      <JapanReadinessScore
                        score={japanReadinessData.score}
                        level={japanReadinessData.level}
                        breakdown={japanReadinessData.breakdown}
                        showDetails={true}
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      What this means for you:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• We'll match you with companies that value your work style</li>
                      <li>• Employers can see your cultural compatibility before interviewing</li>
                      <li>• You'll get personalized career development recommendations</li>
                      {japanReadinessData && (
                        <li>• Priority access to Japan-focused opportunities</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 5: Final Preferences */}
              {step === 5 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-green-100 p-2 rounded-lg">⚙️</span>
                      <span>Final Preferences</span>
                    </CardTitle>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Arrangement Preference
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'onsite', label: 'On-site only' },
                        { value: 'remote', label: 'Remote only' },
                        { value: 'hybrid', label: 'Hybrid (flexible)' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('remotePreference')}
                            type="radio"
                            value={option.value}
                            className="text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Expectations (USD)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        {...register('salaryExpectation.min', { valueAsNumber: true })}
                        type="number"
                        placeholder="Minimum"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        {...register('salaryExpectation.max', { valueAsNumber: true })}
                        type="number"
                        placeholder="Maximum"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability Date
                    </label>
                    <input
                      {...register('availabilityDate')}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      🎉 You're all set!
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Your profile is ready with cultural intelligence scoring. 
                      You'll start receiving personalized job matches immediately.
                    </p>
                    <div className="flex items-center space-x-4">
                      <CulturalFitBadge score={culturalScore} size="sm" />
                      {japanReadinessData && (
                        <Badge className="bg-red-100 text-red-700">
                          Japan Ready: {japanReadinessData.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    ← Previous
                  </Button>
                ) : <div />}

                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Completing...' : 'Complete Onboarding'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}