'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IconCircleCheck } from '@tabler/icons-react';

export default function SuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState('pending');
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    const createCalendarEvent = async () => {
      if (syncAttempted) return; // Prevent multiple sync attempts
      
      try {
        setSyncStatus('syncing');
        setSyncAttempted(true);
        
        const syncResponse = await fetch('/api/calendar/sync', {
          method: 'POST',
        });

        if (syncResponse.ok) {
          setSyncStatus('success');
        } else {
          setSyncStatus('error');
          const errorData = await syncResponse.json();
          console.error('Sync failed:', errorData);
        }
      } catch (error) {
        setSyncStatus('error');
        console.error('Sync error:', error);
      }
    };

    if (session && syncStatus === 'pending') {
      createCalendarEvent();
    }
  }, [session, syncStatus, syncAttempted]);

  return (
    <div className="relative min-h-screen">
      {/* First blob */}
        <div 
          className="absolute left-[50vw] top-[50vh] -translate-x-1/2 -translate-y-1/2 
          w-[300px] h-[300px] 
          bg-gradient-to-r dark:from-blue-500/30 dark:to-purple-500/30 from-blue-300/40 to-sky-300/40 
          rounded-[60%_40%_70%_30%] blur-3xl 
          animate-blob-1" 
        />
        
        {/* Second blob */}
        <div 
          className="absolute left-[50vw] top-[50vh] -translate-x-1/2 -translate-y-1/2 
          w-[400px] h-[400px] 
          bg-gradient-to-r dark:from-red-500/30 dark:to-pink-500/30 from-orange-300/40 to-yellow-300/40 
          rounded-[70%_30%_50%_50%] blur-3xl 
          animate-blob-2" 
        />
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8 backdrop-blur-lg bg-white/20 dark:bg-black/20 p-8 rounded-2xl border border-black/10 dark:border-white/10">
          {/* Maintenance Badge */}
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <IconCircleCheck size={20} />
              <span>All systems working!</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-orange-400 to-yellow-400 dark:from-blue-400 dark:to-red-400 bg-clip-text text-transparent">
            MU Calendar Sync
          </h1>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Seamlessly sync your <a 
              href="https://muerp.mahindrauniversity.edu.in/login.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline"
            > MUERP</a> timetable with Google Calendar, iCalendar, and more!
          </p>
          <div className="flex items-center justify-center text-center">
                <svg 
                  className="w-16 h-16 text-green-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl text-center font-bold dark:text-white text-gray-900">
                Successfully Connected!
              </h2>
              <p className="dark:text-gray-300 text-gray-600 text-center">
                Your MUERP calendar has been synced with Google Calendar.
              </p>
              <p className="dark:text-gray-300 text-sm space-x-2 text-center">
                <span>Having trouble syncing?</span>
                <button
                  onClick={() => {
                    router.push('/');
                  }}
                  className="text-blue-400 hover:text-blue-500 transition-colors duration-200"
                >
                  Try again
                </button>
                <span>or</span>
                <a
                  href="mailto:mark.atharv@gmail.com?subject=MU Calendar Sync Support"
                  className="text-blue-400 hover:text-blue-500 transition-colors duration-200"
                >
                  contact us
                </a>
              </p>
        </div>
        </main>
          
        {/* Footer Badge */}
        <div className="fixed bottom-4 right-4 z-20 flex gap-3">
        {/* Made by badge */}
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <span>Made with 🦖 by</span>
            <a 
                href="https://github.com/markvi2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
                AviatorGator
            </a>
            </div>

            {/* Version badge */}
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <span>v0.1.3-beta</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        {/*Privacy Policy*/}
        <div className = "bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
          <a 
            href = "https://drive.google.com/file/d/18SDj1QHg1xgXVc1srsD7E1UJNT4HYNTf/view?usp=sharing"
            target = "_blank"
            rel = "noopener noreferrer"
            className = "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Privacy Policy
            </a>
        </div>
    
      </div>
    </div>
  );
}