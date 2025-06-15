/**
 * Employer Onboarding Page
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Company cultural profile setup for optimal talent matching
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const employerOnboardingSchema = z.object({
  // Step 1: Company Information
  companyName: z.string().min(2, 'Company name is required'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  industry: z.string().min(1, 'Industry is required'),
  companyDescription: z.string().min(50, 'Description must be at least 50 characters'),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  headquartersLocation: z.object({
    country: z.string(),
    city: z.string(),
    timezone: z.string(),
  }),
  
  // Step 2: Cultural Profile
  organizationStructure: z.enum(['hierarchical', 'flat', 'matrix', 'hybrid']),
  communicationStyle: z.enum(['formal', 'casual', 'mixed']),
  decisionMaking: z.enum(['top-down', 'consensus', 'delegated', 'collaborative']),
  workLifeBalance: z.enum(['traditional', 'flexible', 'results-oriented']),
  teamDynamics: z.enum(['individual-focused', 'team-focused', 'project-based']),
  
  // Step 3: Japan-specific
  hasJapanOperations: z.boolean(),
  japaneseStaffing: z.enum(['none', 'some', 'majority', 'all']).optional(),
  japaneseBusinessCulture: z.boolean().optional(),
  englishWorkingLanguage: z.boolean().optional(),
  
  // Step 4: Hiring Preferences
  hiringVolume: z.enum(['1-5', '6-20', '21-50', '50+']),
  typicalRoles: z.array(z.string()).min(1, 'Select at least one role type'),
  experienceLevels: z.array(z.string()).min(1, 'Select at least one experience level'),
  remotePolicy: z.enum(['onsite-only', 'remote-friendly', 'remote-first', 'hybrid']),
  
  // Step 5: Cultural Requirements
  culturalFitImportance: z.number().min(1).max(10),
  diversityFocus: z.array(z.string()),
  languageRequirements: z.array(z.string()),
  relocationSupport: z.boolean(),
  visaSponsorship: z.boolean(),
});

type EmployerOnboardingData = z.infer<typeof employerOnboardingSchema>;

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [culturalProfile, setCulturalProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployerOnboardingData>({
    resolver: zodResolver(employerOnboardingSchema),
    defaultValues: {
      headquartersLocation: {
        country: '',
        city: '',
        timezone: '',
      },
      hasJapanOperations: false,
      typicalRoles: [],
      experienceLevels: [],
      diversityFocus: [],
      languageRequirements: [],
      relocationSupport: false,
      visaSponsorship: false,
      culturalFitImportance: 7,
    },
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
    'Consulting', 'Education', 'Media', 'Real Estate', 'Automotive',
    'Aerospace', 'Energy', 'Telecommunications', 'Pharmaceuticals'
  ];

  const roleTypes = [
    'Engineering', 'Product Management', 'Design', 'Marketing', 'Sales',
    'Operations', 'Finance', 'HR', 'Legal', 'Executive', 'Research',
    'Customer Success', 'Data Science', 'DevOps', 'Security'
  ];

  const experienceLevels = [
    'Entry Level (0-2 years)', 'Mid Level (3-5 years)', 
    'Senior (6-10 years)', 'Lead/Principal (10+ years)', 'Executive'
  ];

  const diversityOptions = [
    'Gender Diversity', 'Ethnic Diversity', 'Age Diversity', 
    'Cultural Background', 'Educational Background', 'Disability Inclusion',
    'LGBTQ+ Inclusion', 'Veteran Hiring', 'Neurodiversity'
  ];

  const languageOptions = [
    'English', 'Japanese', 'Mandarin', 'Spanish', 'German', 'French',
    'Korean', 'Portuguese', 'Hindi', 'Arabic'
  ];

  const calculateCulturalProfile = (data: Partial<EmployerOnboardingData>) => {
    // Calculate company cultural profile score
    let hierarchyScore = 50;
    let formalityScore = 50;
    let collaborationScore = 50;
    let flexibilityScore = 50;
    
    // Adjust based on responses
    if (data.organizationStructure === 'hierarchical') hierarchyScore = 85;
    if (data.organizationStructure === 'flat') hierarchyScore = 20;
    
    if (data.communicationStyle === 'formal') formalityScore = 90;
    if (data.communicationStyle === 'casual') formalityScore = 20;
    
    if (data.decisionMaking === 'consensus') collaborationScore = 90;
    if (data.decisionMaking === 'top-down') collaborationScore = 30;
    
    if (data.workLifeBalance === 'flexible') flexibilityScore = 85;
    if (data.workLifeBalance === 'traditional') flexibilityScore = 30;
    
    return {
      hierarchy: hierarchyScore,
      formality: formalityScore,
      collaboration: collaborationScore,
      flexibility: flexibilityScore,
      overall: Math.round((hierarchyScore + formalityScore + collaborationScore + flexibilityScore) / 4),
      japanReadiness: data.hasJapanOperations ? 85 : 45,
    };
  };

  const onSubmit = async (data: EmployerOnboardingData) => {
    setIsLoading(true);
    try {
      // Calculate cultural profile
      const profile = calculateCulturalProfile(data);
      
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation:
      // await api.post('/onboarding/employer', { ...data, culturalProfile: profile });
      
      toast.success('Company profile setup complete! 🎉');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      
      // Calculate cultural profile when moving to results
      if (step === 4) {
        const formData = watch();
        const profile = calculateCulturalProfile(formData);
        setCulturalProfile(profile);
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
            Welcome to iWORKZ! 🏢
          </h1>
          <p className="text-gray-600">
            Set up your company profile with cultural intelligence for better talent matching
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
              {/* Step 1: Company Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-blue-100 p-2 rounded-lg">🏢</span>
                      <span>Company Information</span>
                    </CardTitle>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      {...register('companyName')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Acme Corporation"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      {...register('companySize')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.companySize && (
                      <p className="text-red-500 text-xs mt-1">{errors.companySize.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      {...register('industry')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    {errors.industry && (
                      <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      {...register('companyDescription')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your company, mission, and values..."
                    />
                    {errors.companyDescription && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL (Optional)
                    </label>
                    <input
                      {...register('websiteUrl')}
                      type="url"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.yourcompany.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Cultural Profile */}
              {step === 2 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-purple-100 p-2 rounded-lg">🧠</span>
                      <span>Company Culture Profile</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Help us understand your company culture for better talent matching
                    </p>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Structure
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'hierarchical', label: 'Hierarchical - Clear chain of command' },
                        { value: 'flat', label: 'Flat - Minimal hierarchy' },
                        { value: 'matrix', label: 'Matrix - Cross-functional teams' },
                        { value: 'hybrid', label: 'Hybrid - Mix of structures' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('organizationStructure')}
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
                        { value: 'formal', label: 'Formal - Professional protocols' },
                        { value: 'casual', label: 'Casual - Informal interaction' },
                        { value: 'mixed', label: 'Mixed - Depends on context' }
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
                      Decision Making Process
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'top-down', label: 'Top-down - Leadership decides' },
                        { value: 'consensus', label: 'Consensus - Team agreement' },
                        { value: 'delegated', label: 'Delegated - Department autonomy' },
                        { value: 'collaborative', label: 'Collaborative - Cross-team input' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('decisionMaking')}
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
                      Work-Life Balance Approach
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'traditional', label: 'Traditional - Standard hours' },
                        { value: 'flexible', label: 'Flexible - Adaptable schedule' },
                        { value: 'results-oriented', label: 'Results-oriented - Focus on output' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('workLifeBalance')}
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

              {/* Step 3: Japan-Specific */}
              {step === 3 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-red-100 p-2 rounded-lg">🇯🇵</span>
                      <span>Japan Operations</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Tell us about your Japan presence and cultural requirements
                    </p>
                  </CardHeader>

                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('hasJapanOperations')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium">
                        We have operations in Japan
                      </span>
                    </label>
                  </div>

                  {watch('hasJapanOperations') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Japanese Staff Composition
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'none', label: 'No Japanese staff' },
                            { value: 'some', label: 'Some Japanese staff (20-50%)' },
                            { value: 'majority', label: 'Majority Japanese staff (50-80%)' },
                            { value: 'all', label: 'All Japanese staff (80%+)' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center">
                              <input
                                {...register('japaneseStaffing')}
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
                        <label className="flex items-center">
                          <input
                            {...register('japaneseBusinessCulture')}
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">
                            We follow traditional Japanese business culture
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            {...register('englishWorkingLanguage')}
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm">
                            English is the primary working language
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  {!watch('hasJapanOperations') && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        🌏 Expand to Japan?
                      </h4>
                      <p className="text-sm text-blue-700">
                        Our cultural intelligence platform can help you identify candidates 
                        ready for Japanese market expansion. We'll match you with talent 
                        who have Japan readiness scores and cultural adaptability.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Hiring Preferences */}
              {step === 4 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-green-100 p-2 rounded-lg">👥</span>
                      <span>Hiring Preferences</span>
                    </CardTitle>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Hiring Volume
                    </label>
                    <select
                      {...register('hiringVolume')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select hiring volume</option>
                      <option value="1-5">1-5 hires per year</option>
                      <option value="6-20">6-20 hires per year</option>
                      <option value="21-50">21-50 hires per year</option>
                      <option value="50+">50+ hires per year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typical Roles (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {roleTypes.map((role) => (
                        <label key={role} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={role}
                            {...register('typicalRoles')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                    {errors.typicalRoles && (
                      <p className="text-red-500 text-xs mt-1">{errors.typicalRoles.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Levels (Select all that apply)
                    </label>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <label key={level} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={level}
                            {...register('experienceLevels')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                    {errors.experienceLevels && (
                      <p className="text-red-500 text-xs mt-1">{errors.experienceLevels.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remote Work Policy
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'onsite-only', label: 'On-site only' },
                        { value: 'remote-friendly', label: 'Remote-friendly' },
                        { value: 'remote-first', label: 'Remote-first' },
                        { value: 'hybrid', label: 'Hybrid model' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('remotePolicy')}
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

              {/* Step 5: Cultural Profile Results */}
              {step === 5 && culturalProfile && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-emerald-100 p-2 rounded-lg">📊</span>
                      <span>Your Company Cultural Profile</span>
                    </CardTitle>
                  </CardHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Hierarchy Level</h4>
                      <div className="text-2xl font-bold text-blue-700">{culturalProfile.hierarchy}%</div>
                      <Progress value={culturalProfile.hierarchy} className="h-2 mt-2" />
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Formality</h4>
                      <div className="text-2xl font-bold text-purple-700">{culturalProfile.formality}%</div>
                      <Progress value={culturalProfile.formality} className="h-2 mt-2" />
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Collaboration</h4>
                      <div className="text-2xl font-bold text-green-700">{culturalProfile.collaboration}%</div>
                      <Progress value={culturalProfile.collaboration} className="h-2 mt-2" />
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Flexibility</h4>
                      <div className="text-2xl font-bold text-orange-700">{culturalProfile.flexibility}%</div>
                      <Progress value={culturalProfile.flexibility} className="h-2 mt-2" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      🎯 Overall Cultural Score: {culturalProfile.overall}%
                    </h3>
                    {watch('hasJapanOperations') && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className="bg-red-100 text-red-700">
                          🇯🇵 Japan Readiness: {culturalProfile.japanReadiness}%
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm text-gray-700">
                      This profile helps us match you with candidates who align with your company culture. 
                      Higher scores indicate better cultural compatibility and reduced hiring risk.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      What this means for your hiring:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Candidates will see cultural fit scores before applying</li>
                      <li>• Our AI will prioritize culturally compatible candidates</li>
                      <li>• Reduce time-to-hire with better initial matches</li>
                      <li>• Improve retention with culture-aligned hiring</li>
                      {watch('hasJapanOperations') && (
                        <li>• Access to Japan-ready talent pool with cultural scores</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 6: Final Setup */}
              {step === 6 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center space-x-2">
                      <span className="bg-yellow-100 p-2 rounded-lg">⚙️</span>
                      <span>Final Setup</span>
                    </CardTitle>
                  </CardHeader>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cultural Fit Importance (1-10)
                    </label>
                    <input
                      {...register('culturalFitImportance', { valueAsNumber: true })}
                      type="range"
                      min="1"
                      max="10"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Skills first</span>
                      <span>Culture critical</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {watch('culturalFitImportance')}/10
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diversity Focus (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {diversityOptions.map((option) => (
                        <label key={option} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={option}
                            {...register('diversityFocus')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language Requirements
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {languageOptions.map((language) => (
                        <label key={language} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            value={language}
                            {...register('languageRequirements')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {language}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        {...register('relocationSupport')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm">We provide relocation support</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        {...register('visaSponsorship')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm">We sponsor work visas</span>
                    </label>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      🎉 Setup Complete!
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Your company profile is ready with cultural intelligence matching. 
                      You'll start seeing qualified candidates with cultural fit scores immediately.
                    </p>
                    {culturalProfile && (
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          Cultural Score: {culturalProfile.overall}%
                        </Badge>
                        {watch('hasJapanOperations') && (
                          <Badge className="bg-red-100 text-red-700">
                            Japan Ready: {culturalProfile.japanReadiness}%
                          </Badge>
                        )}
                      </div>
                    )}
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
                    {isLoading ? 'Setting Up...' : 'Complete Setup'}
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