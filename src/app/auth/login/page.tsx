"use client"

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import logo from '@/images/unwomenlogo.png';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cleanError } from '@/utils/formatError';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const email = event.currentTarget.email.value as string;
    const password = event.currentTarget.password.value as string;
    try {
      await login(email, password);
      toast.success('Login successful!');
      setTimeout(() => router.push('/'), 800);
    } catch (err) {
      toast.error(cleanError(err, 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-yellow-400" />
          <div className="px-8 pt-8 pb-10">
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="UN Women Market Square" width={120} height={44} className="h-10 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Sign up for free</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">© {new Date().getFullYear()} UN Women Market Square</p>
      </div>
    </div>
  );
}
