/**
 * Forgot Password Page
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Secure password reset with email verification
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, call your API
      // await api.post('/auth/forgot-password', { email: data.email });
      
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a password reset link to your email address.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Check your email inbox and spam folder</li>
            <li>• Click the reset link within 1 hour</li>
            <li>• Create a new secure password</li>
            <li>• Sign in with your new password</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full"
          >
            Try Different Email
          </Button>
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Your Password?
        </h1>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
        >
          {isLoading ? 'Sending Email...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Security Note */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-gray-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              Security Information
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              For your security, password reset links expire after 1 hour and can only be used once. 
              If you don't receive an email, check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}