"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import Link from "next/link";
import Image from "next/image";
import logo from '@/images/unwomenlogo.png';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, ArrowRight, Eye, EyeOff, ChevronDown } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confPassword: '',
    role: '',
    phoneNo: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.role) {
      toast.error("Please select a role");
      return;
    }
    setIsLoading(true);
    try {
      await signup({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: formData.role,
        phoneNo: formData.phoneNo || undefined,
        location: formData.location || undefined,
      });
      toast.success('Account created!');
      setTimeout(() => router.push('/'), 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-yellow-400" />
          <div className="px-8 pt-8 pb-10">
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="UN Women Market Square" width={120} height={44} className="h-10 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Create your account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Join thousands of women entrepreneurs today</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Account Role</label>
                <div className="relative">
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select name="role" value={formData.role} onChange={handleChange} required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 outline-none focus:border-blue-400 transition-colors appearance-none">
                    <option value="">Select your role</option>
                    <option value="Customer">Customer / Buyer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Mentor">Mentor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" name="phoneNo" placeholder="+232 79 000 000" value={formData.phoneNo} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="location" placeholder="Freetown, Sierra Leone" value={formData.location} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required
                      className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showConfirm ? 'text' : 'password'} name="confPassword" placeholder="••••••••" value={formData.confPassword} onChange={handleChange} required
                      className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2 text-sm mt-2">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">© {new Date().getFullYear()} UN Women Market Square</p>
      </div>
    </div>
  );
}
