import React, { useState } from 'react';
import { FileText, ArrowRight, Lock, Mail, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onClose?: () => void;
  message?: string;
  theme?: 'light' | 'dark';
}

export function Login({ onLogin, onClose, message, theme = 'light' }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 800);
  };

  const handleSocialLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 800);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative transition-colors`}>
      {onClose && (
        <button 
          onClick={onClose}
          className={`absolute top-6 left-6 p-2 ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'} border rounded-full shadow-sm transition-colors`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={`flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl shadow-lg ring-4 ${isDark ? 'ring-indigo-900/30' : 'ring-indigo-50'}`}>
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className={`mt-6 text-center text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Sign in to Dr. Doc
        </h2>
        <p className={`mt-2 text-center text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
          Your personal AI Documentation Engineer
        </p>
        {message && (
          <div className={`mx-4 mt-4 ${isDark ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'} px-4 py-3 rounded-xl text-sm font-medium text-center shadow-sm border`}>
            {message}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border transition-colors`}>
          <div className="space-y-3 mb-6">
            <button 
              onClick={handleSocialLogin}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center py-2.5 px-4 border ${isDark ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
            <button 
              onClick={handleSocialLogin}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center py-2.5 px-4 border ${isDark ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5 mr-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign in with Facebook
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
                Or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`bg-red-50 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-sm border ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : ''}`}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email address
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl sm:text-sm transition-all focus:outline-none`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl sm:text-sm transition-all focus:outline-none`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} rounded cursor-pointer`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'} cursor-pointer`}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in with Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
