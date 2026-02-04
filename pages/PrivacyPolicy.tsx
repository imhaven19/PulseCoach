import React from 'react';
import { ArrowLeft, Eye, Database, Share2, Lock, Shield, Bell, Trash2, Globe, Server } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      <header className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        
        {/* Introduction */}
        <section className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border border-primary/10">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            At PulseCoach, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our AI-powered fitness coaching application.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Database size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Information We Collect</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-12">
            <p><strong className="text-slate-900 dark:text-white">Account Information:</strong> Name, email address, and encrypted password when you create an account.</p>
            <p><strong className="text-slate-900 dark:text-white">Fitness Profile:</strong> Your fitness goals, experience level, available equipment, and workout preferences to personalize your training.</p>
            <p><strong className="text-slate-900 dark:text-white">Workout Data:</strong> Exercise history, session duration, and progress metrics to track your fitness journey.</p>
            <p><strong className="text-slate-900 dark:text-white">Calendar Data:</strong> If you connect your calendar, we access event times (read-only) to suggest optimal workout windows. We never read event details or attendee information.</p>
            <p><strong className="text-slate-900 dark:text-white">Meal Photos:</strong> Images you scan for nutritional analysis are processed in real-time and not permanently stored on our servers.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Share2 size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">How We Use Your Data</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-12">
            <p><strong className="text-slate-900 dark:text-white">AI Coaching:</strong> Your fitness profile and goals are sent to Google's Gemini API to generate personalized workout plans and real-time coaching responses.</p>
            <p><strong className="text-slate-900 dark:text-white">Progress Tracking:</strong> We analyze your workout history to provide insights and adjust recommendations.</p>
            <p><strong className="text-slate-900 dark:text-white">Service Improvement:</strong> Aggregated, anonymized data helps us improve our algorithms and features.</p>
            <p><strong className="text-slate-900 dark:text-white">Communications:</strong> With your consent, we may send workout reminders and motivational notifications.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Server size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Third-Party Services</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-12">
            <p><strong className="text-slate-900 dark:text-white">Supabase:</strong> Secure database hosting and user authentication with industry-standard encryption.</p>
            <p><strong className="text-slate-900 dark:text-white">Google Gemini API:</strong> AI processing for workout generation and coaching. Data is processed per Google's AI Terms of Service.</p>
            <p><strong className="text-slate-900 dark:text-white">Stripe:</strong> Payment processing for subscriptions. We never store your full credit card details.</p>
            <p><strong className="text-slate-900 dark:text-white">NOWPayments:</strong> Cryptocurrency payment processing. We do not store wallet private keys.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Lock size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Data Security</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-12">
            <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
            <p>Passwords are hashed using industry-standard bcrypt algorithms and are never stored in plain text.</p>
            <p>We implement row-level security policies to ensure users can only access their own data.</p>
            <p>Regular security audits and penetration testing are conducted to identify and address vulnerabilities.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bell size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Notifications & Communications</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-12">
            <p>Push notifications for workout reminders and schedule gaps are optional and can be disabled at any time in your profile settings. We will never share your contact information with third-party marketers.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Eye size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Your Rights</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-12">
            <p><strong className="text-slate-900 dark:text-white">Access:</strong> Request a copy of all personal data we hold about you.</p>
            <p><strong className="text-slate-900 dark:text-white">Correction:</strong> Update or correct inaccurate information in your profile.</p>
            <p><strong className="text-slate-900 dark:text-white">Deletion:</strong> Request complete deletion of your account and associated data.</p>
            <p><strong className="text-slate-900 dark:text-white">Portability:</strong> Export your workout history and profile data in a standard format.</p>
            <p><strong className="text-slate-900 dark:text-white">Opt-Out:</strong> Disconnect calendar integration or disable notifications at any time.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Trash2 size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Data Retention</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-12">
            <p>We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized, aggregated data may be retained for analytical purposes.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">International Users</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-12">
            <p>PulseCoach operates globally. Your data may be processed in the United States or other countries where our service providers maintain facilities. We ensure appropriate safeguards are in place for international data transfers.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Shield size={20} />
            </div>
            <h2 className="font-black uppercase tracking-wider text-xs">Children's Privacy</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-12">
            <p>PulseCoach is not intended for users under 16 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-3">Contact Us</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            For privacy-related inquiries or to exercise your data rights, contact us at <strong className="text-primary">privacy@pulsecoach.app</strong>
          </p>
        </section>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Last Updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
