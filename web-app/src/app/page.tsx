'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BarChart3, Users, Calendar, DollarSign, CheckCircle, Star, Shield, Zap, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="/">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">Continuo</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
                  <Link className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors" href="#features">
          Features
        </Link>
        <Link className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors" href="#pricing">
          Pricing
        </Link>
        <Link className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors" href="/auth/login">
          Sign In
        </Link>
          <Link 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" 
            href="/auth/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
                  Transform Your Business
                  <span className="text-blue-600 block">With AI-Powered</span>
                  <span className="text-gray-900 block">Management</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-lg text-gray-700 md:text-xl leading-relaxed">
                  Join 10,000+ businesses saving 20+ hours per week with our all-in-one platform. 
                  Manage customers, finances, projects, and inventory with intelligent automation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                  href="/auth/register"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 text-base font-semibold text-gray-900 shadow-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  href="#demo"
                >
                  Watch Demo
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col items-center space-y-4 pt-8">
                <p className="text-sm text-gray-600 font-medium">Trusted by 10,000+ businesses</p>
                <div className="flex items-center space-x-6 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-2 text-sm text-gray-600">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                Why Choose Continuo?
              </h2>
              <p className="max-w-[700px] text-lg text-gray-700 md:text-xl">
                Powerful features designed to save you time and grow your business
              </p>
            </div>
            
            <div className="grid max-w-6xl mx-auto gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Smart CRM</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  AI-powered customer insights help you close more deals and build lasting relationships.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lead scoring & automation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Customer journey tracking
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Financial Control</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Complete financial management with automated invoicing and real-time reporting.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automated invoicing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time analytics
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Project Management</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Streamline project workflows with intelligent task management and team collaboration.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Smart task assignment
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Time tracking & reporting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid max-w-4xl mx-auto gap-8 md:grid-cols-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-sm text-gray-600 font-medium">Active Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
                <div className="text-sm text-gray-600 font-medium">Hours Saved/Week</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600 font-medium">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-sm text-gray-600 font-medium">Customer Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Join thousands of satisfied customers who've transformed their business with Continuo
              </p>
            </div>
            
            <div className="grid max-w-6xl mx-auto gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Continuo has completely transformed how we manage our business. We've saved over 25 hours per week on administrative tasks."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">SM</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Sarah Mitchell</div>
                    <div className="text-sm text-gray-600">CEO, TechStart Inc.</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The AI-powered insights have helped us increase our conversion rate by 40%. Absolutely game-changing!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">MJ</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Mike Johnson</div>
                    <div className="text-sm text-gray-600">Founder, GrowthCo</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Finally, a platform that actually understands small business needs. The financial management tools are incredible."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">LD</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Lisa Davis</div>
                    <div className="text-sm text-gray-600">Owner, Creative Agency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  Ready to Transform Your Business?
                </h2>
                <p className="mx-auto max-w-[600px] text-blue-100 text-lg">
                  Join 10,000+ businesses saving time and growing revenue with Continuo
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  href="/auth/register"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-white px-8 text-base font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
                  href="/auth/login"
                >
                  Sign In
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-blue-200 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-900">
          © 2024 Continuo. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-gray-900 hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-gray-900 hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
