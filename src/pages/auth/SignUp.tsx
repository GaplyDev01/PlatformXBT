import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, AlertTriangle, Star } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateField = (field: keyof typeof formData, value: string) => {
    try {
      const schema = signUpSchema.pick({ [field]: true });
      schema.parse({ [field]: value });
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: err.errors[0].message
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof typeof formData, value);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate all fields
      const validatedData = signUpSchema.parse(formData);

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            username: validatedData.username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Redirect to email verification page
      navigate('/auth/verify-email', { state: { email: validatedData.email } });
    } catch (err) {
      console.error('Error signing up:', err);
      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce((acc, error) => ({
          ...acc,
          [error.path[0]]: error.message
        }), {});
        setValidationErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8">
        <h2 className="text-2xl font-bold text-sand-DEFAULT mb-6">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500">
            <AlertTriangle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-sand-DEFAULT mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.username 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="johndoe"
            />
            {validationErrors.username && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sand-DEFAULT mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="you@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sand-DEFAULT mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.password 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="••••••••"
            />
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-sand-DEFAULT mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.confirmPassword 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="••••••••"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sand-DEFAULT hover:bg-sand-light text-carbon-dark py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sand-dark/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-carbon-light/20 text-sand-dark">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-sand-dark/30 rounded-lg text-sand-DEFAULT hover:bg-sand-DEFAULT/5"
            onClick={() => {/* Implement GitHub OAuth */}}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            GitHub
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-sand-dark/30 rounded-lg text-sand-DEFAULT hover:bg-sand-DEFAULT/5"
            onClick={() => {/* Implement Google OAuth */}}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
        </div>

        <p className="mt-4 text-sm text-sand-dark text-center">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="text-sand-DEFAULT hover:text-sand-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;