
import React from 'react';
import { ArrowLeft, Eye, Database, Share2, Lock } from 'lucide-react';

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
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Database size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Data Collection</h2>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-2">
            <p>PulseCoach collects the following information to personalize your fitness journey:</p>
            <p>• <strong>Identity Data:</strong> Name and email address provided during signup.</p>
            <p>• <strong>Fitness Data:</strong> Workout logs, fitness levels, goals, and equipment availability.</p>
            <p>• <strong>Calendar Data:</strong> If connected, we access your Google Calendar (read-only) to identify "busy" blocks for scheduling recommendations.</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Share2 size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">AI Processing</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Your fitness stats and goal information are sent to Google’s Gemini API to generate personalized workout plans and coaching responses. This data is processed in accordance with Google's GenAI Terms of Service. We do not sell your personal training data to third-party advertisers.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Lock size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Security & Storage</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            We use Supabase for secure data storage and authentication. Payment information is handled exclusively by Stripe or NOWPayments; PulseCoach does not store your full credit card details or crypto wallet private keys on our servers.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Eye size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Your Rights</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            You have the right to access, correct, or delete your personal data at any time. You can disconnect your calendar or delete your workout history directly through the settings panel. For full account deletion, please contact support.
          </p>
        </section>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-medium tracking-widest">
            Last Updated: May 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
