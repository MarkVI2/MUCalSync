'use client';
import { useState } from 'react';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { signIn, useSession } from "next-auth/react";
import { encryptData } from "@/utils/encryption";

interface TimetableData {
  schedule?: Array<{
    day: string;
    slots: Array<{
      start_time: string;
      end_time: string;
      subject_code: string;
      subject_name: string;
      faculty: string;
      room: string;
      type: string;
    }>;
  }>;
}

export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    calendarType: ''
  });

  const [showGoogleAuth, setShowGoogleAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);

  //const { data: session } = useSession();

  const validateEmail = (email: string): boolean => {
    // Break down the regex pattern:
    // ^s[ecml]      - starts with s,e,c,m,l followed by 'e'
    // (2[0-5])      - 20-25
    // [um]          - u or m
    // [a-zA-Z]{3}   - exactly 3 letters
    // [0-9]{3}      - exactly 3 numbers
    // @mahindrauniversity\.edu\.in$ - exact domain match
    const emailPattern = /^s[ecml](2[2-7])[um][a-z]{3}[0-9]{3}@mahindrauniversity\.edu\.in$/;
    return emailPattern.test(email);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setCredentials(prev => ({ ...prev, username: value }));
    
    if (value && !validateEmail(value)) {
      setError('Please enter a valid MUERP email address');
    } else {
      setError('');
    }
  };

  const handleCalendarTypeChange = (type: string) => {
    setCredentials(prev => ({ ...prev, calendarType: type }));
    setShowGoogleAuth(type === 'google');
  };

  const handleCalendarAuth = async () => {
    setIsLoading(true);
    
    try {
      const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('Encryption configuration error');
      }

      // Encrypt and authenticate with MUERP first
      const encryptedData = encryptData({
        username: credentials.username,
        password: credentials.password
      }, encryptionKey);

      const loginResponse = await fetch('/api/auth/muerp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedData }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.error("MUERP login error response:", errorData);
        throw new Error('MUERP login failed');
      }

      // Fetch timetable data
      const timetableResponse = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username
        }),
      });

      if (!timetableResponse.ok) {
        const errorData = await timetableResponse.json();
        console.error("Timetable fetch error response:", errorData);
        throw new Error('Failed to fetch timetable');
      }

      const timetableData = await timetableResponse.json();
      setTimetableData(timetableData);

      // Handle different calendar types
      switch (credentials.calendarType) {
        case 'google':
          const result = await signIn('google', {
            redirect: true,
            callbackUrl: '/success'
          });

          if (result?.error) {
            console.error("Google sign-in error:", result.error);
            throw new Error('Google authentication failed');
          }

          if (result?.ok) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const syncResponse = await fetch('/api/calendar/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (!syncResponse.ok) {
              const errorData = await syncResponse.json();
              console.error("Sync error response:", errorData);
              throw new Error('Calendar sync failed');
            }

            const syncData = await syncResponse.json();
            console.log("Sync response:", syncData);
          }
          break;

        case 'ical':
          const iCalResponse = await fetch('/api/calendar/ical', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timetableData }),
          });
          if (!iCalResponse.ok) {
            const errorData = await iCalResponse.json();
            console.error("iCal generation error response:", errorData);
            throw new Error('Failed to generate iCal file');
          }
          const blob = await iCalResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'muerp-calendar.ics';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          break;

        case 'outlook':
          const outlookResponse = await fetch('/api/calendar/outlook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timetableData }),
          });
          if (!outlookResponse.ok) {
            throw new Error('Failed to sync with Outlook');
          }
          break;

        default:
          throw new Error('Please select a calendar type');
      }

    } catch (error) {
      console.error('Calendar sync error:', error);
      setError(error instanceof Error ? error.message : 'Calendar sync failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) throw new Error('Authentication failed');
    } catch (error) {
      // Handle error
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />;
    }
    
    if (credentials.calendarType === 'google') {
      return (
        <>
          <IconBrandGoogleFilled className="w-5 h-5 mr-2" />
          Connect with Google
        </>
      );
    }
    
    if (!credentials.calendarType) {
      return 'Select a Calendar Type';
    }
    
    return `Connect with ${credentials.calendarType.charAt(0).toUpperCase() + credentials.calendarType.slice(1)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="space-y-4">
        {/* Username Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label htmlFor="username" className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                MUERP Username
              </label>
            </div>
          </div>
          <div className="sm:w-2/3">
            <div className="space-y-1 w-full">
              <input
                id="username"
                type="text"
                required
                className={`w-full px-4 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white`}
                placeholder="e.g., se00ucse000@mahindrauniversity.edu.in"
                value={credentials.username}
                onChange={handleUsernameChange}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label htmlFor="password" className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                MUERP Password
              </label>
            </div>
          </div>
          <div className="sm:w-2/3">
            <input
              id="password"
              type="password"
              required
              className={`w-full px-4 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white`}
              placeholder="Enter your MUERP password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
        </div>

        {/* Calendar Type Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label htmlFor="calendarType" className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                Calendar Type
              </label>
            </div>
          </div>
          <div className="sm:w-2/3">
            <select
              id="calendarType"
              value={credentials.calendarType}
              onChange={(e) => handleCalendarTypeChange(e.target.value)}
              className="w-full h-full px-4 mr-1 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="" className="text-gray-900 dark:text-white">Select a calendar</option>
              <option value="google" className="text-gray-900 dark:text-white">Google Calendar</option>
              <option value="ical" className="text-gray-900 dark:text-white">iCal</option>
              <option value="outlook" className="text-gray-900 dark:text-white">Outlook</option>
            </select>
          </div>
        </div>

        {/* Google OAuth Button */}
        {showGoogleAuth && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3" />
            <div className="sm:w-2/3">
              <button
                type="button"
                onClick={handleCalendarAuth}
                disabled={isLoading || !credentials.username || !credentials.password || !credentials.calendarType}
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md
                  ${isLoading || !credentials.username || !credentials.password || !credentials.calendarType 
                    ? 'bg-gray-600 dark:bg-gray-700 cursor-not-allowed text-gray-300 dark:text-gray-400' 
                    : 'bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-blue-500 dark:to-purple-500 hover:opacity-90 text-gray-900 dark:text-white transition-all duration-200'
                  }`}
              >
                {getButtonContent()}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button - Only show for non-Google options */}
        {!showGoogleAuth && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3" />
            <div className="sm:w-2/3">
              <button
                type="submit"
                className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}