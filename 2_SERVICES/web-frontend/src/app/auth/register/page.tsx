/**
 * Registration Page
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Multi-step registration with cultural intelligence assessment
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  userType: z.enum(['talent', 'employer', 'agency']),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  languagePreference: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState<'talent' | 'employer' | 'agency' | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      languagePreference: 'en',
      countryCode: '+1',
    },
  });

  const userTypes = [
    {
      type: 'talent' as const,
      title: 'Talent Professional',
      description: 'Looking for career opportunities',
      icon: '👨‍💼',
      features: [
        'Cultural Intelligence Assessment',
        'AI-Powered Job Matching',
        'Career Development Tools',
        'Global Opportunity Access',
      ],
    },
    {
      type: 'employer' as const,
      title: 'Employer/Company',
      description: 'Hiring top global talent',
      icon: '🏢',
      features: [
        'Cultural Fit Analysis',
        'Advanced Talent Screening',
        'Team Compatibility Assessment',
        'Japan-Ready Talent Pool',
      ],
    },
    {
      type: 'agency' as const,
      title: 'Recruitment Agency',
      description: 'Connecting talent with employers',
      icon: '🤝',
      features: [
        'Multi-Client Management',
        'Advanced Analytics Dashboard',
        'Commission Tracking',
        'White-Label Solutions',
      ],
    },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        phone: data.phone,
        countryCode: data.countryCode,
        languagePreference: data.languagePreference,
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted,
      });
      
      toast.success('Welcome to iWORKZ! 🎉');
      
      // Redirect based on user type
      if (data.userType === 'talent') {
        router.push('/onboarding/talent');
      } else if (data.userType === 'employer') {
        router.push('/onboarding/employer');
      } else {
        router.push('/onboarding/agency');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleSocialRegister = (provider: 'google' | 'linkedin') => {
    const userTypeParam = selectedUserType ? `?type=${selectedUserType}` : '';
    window.location.href = `/api/auth/${provider}/register${userTypeParam}`;
  };

  const nextStep = () => {
    if (step === 1 && selectedUserType) {
      setValue('userType', selectedUserType);
      setStep(2);
    }
  };

  // Step 1: User Type Selection
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join iWORKZ
          </h1>
          <p className="text-gray-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="space-y-4">
          {userTypes.map((userType) => (
            <Card
              key={userType.type}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedUserType === userType.type
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedUserType(userType.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{userType.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userType.title}
                      </h3>
                      {userType.type === 'talent' && (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {userType.description}
                    </p>
                    <ul className="space-y-1">
                      {userType.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={nextStep}
          disabled={!selectedUserType}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
        >
          Continue
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Account
        </h1>
        <p className="text-gray-600">
          Join as {selectedUserType === 'talent' ? 'Talent Professional' : 
                   selectedUserType === 'employer' ? 'Employer' : 'Recruitment Agency'}
        </p>
      </div>

      {/* Cultural Intelligence Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-purple-600">🧠</span>
          <span className="text-sm font-semibold text-purple-700">
            Cultural Intelligence Assessment Included
          </span>
        </div>
        <p className="text-xs text-purple-600">
          Get your personalized cultural compatibility score with 87% accuracy in predicting 3-year success
        </p>
      </div>

      {/* Social Registration */}
      <div className="space-y-3">
        <Button
          onClick={() => handleSocialRegister('google')}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 py-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign up with Google</span>
        </Button>

        <Button
          onClick={() => handleSocialRegister('linkedin')}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 py-3"
        >
          <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span>Sign up with LinkedIn</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="At least 8 characters"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              {...register('termsAccepted')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 mr-3"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </Link>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-red-500 text-xs">{errors.termsAccepted.message}</p>
          )}

          <label className="flex items-start">
            <input
              {...register('privacyAccepted')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 mr-3"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.privacyAccepted && (
            <p className="text-red-500 text-xs">{errors.privacyAccepted.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setStep(1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to user type selection
        </button>
      </div>
    </div>
  );
}