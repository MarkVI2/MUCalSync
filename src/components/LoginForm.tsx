"use client";
import { useState } from "react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";

interface TimetableData {
  // Define your timetable structure here
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
    username: "",
    password: "",
    calendarType: "",
  });

  const [showGoogleAuth, setShowGoogleAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  // These will be implemented in the next phase
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);
  const [timetableData, setTimetableData] = useState<any>(null);

  const { data: session } = useSession();

  const validateEmail = (email: string): boolean => {
    // Break down the regex pattern:
    // ^s[ecml]      - starts with s,e,c,m,l followed by 'e'
    // (2[0-5])      - 20-25
    // [um]          - u or m
    // [a-zA-Z]{3}   - exactly 3 letters
    // [0-9]{3}      - exactly 3 numbers
    // @mahindrauniversity\.edu\.in$ - exact domain match
    //const emailPattern = /^s[ecml](2[2-7])[um][a-z]{3}[0-9]{3}@mahindrauniversity\.edu\.in$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@mahindrauniversity\.edu\.in$/;
    return emailPattern.test(email);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setCredentials((prev) => ({ ...prev, username: value }));

    // Only show error if there's a value and it doesn't match the pattern
    if (value && !validateEmail(value)) {
      setError("Please enter a valid MUERP email address");
    } else {
      setError("");
    }
  };

  const handleCalendarTypeChange = (type: string) => {
    setCredentials((prev) => ({ ...prev, calendarType: type }));
    setShowGoogleAuth(type === "google");
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      // First authenticate with MUERP
      const loginResponse = await fetch("/api/auth/muerp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("MUERP login failed");
      }

      const loginData = await loginResponse.json();
      console.log("Login Response Data:", loginData);

      // Fetch timetable data
      const timetableResponse = await fetch("/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
        }),
      });

      if (!timetableResponse.ok) {
        const errorData = await timetableResponse.json();
        console.error("Timetable Error Response:", errorData);
        throw new Error("Failed to fetch timetable");
      }

      const timetableData = await timetableResponse.json();
      setTimetableData(timetableData);

      // After successful MUERP login and data storage, initiate Google OAuth
      const result = await signIn("google", {
        redirect: true,
        callbackUrl: "/success",
      });

      if (result?.error) {
        console.error("Google sign-in error:", result.error);
        throw new Error("Google authentication failed");
      }

      if (result?.ok) {
        // Wait a moment for the session to be updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call calendar sync endpoint
        const syncResponse = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json();
          console.error("Sync error:", errorData);
          throw new Error("Calendar sync failed");
        }

        const syncData = await syncResponse.json();
        console.log("Sync response:", syncData);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Authentication failed");
    } catch (error) {
      // Handle error
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      );
    }

    if (credentials.calendarType === "google") {
      return (
        <>
          <IconBrandGoogleFilled className="w-5 h-5 mr-2" />
          Connect with Google
        </>
      );
    }

    if (!credentials.calendarType) {
      return "Select a Calendar Type";
    }

    return `Connect with ${
      credentials.calendarType.charAt(0).toUpperCase() +
      credentials.calendarType.slice(1)
    }`;
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-4xl p-8 bg-black/40 rounded-lg border border-gray-600">
        <div className="text-center space-y-4">
          {isLoading ? (
            <>
              <div className="flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-blue-500 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">
                Fetching Your Timetable...
              </h2>
              <p className="dark:text-gray-300 text-gray-600">
                Please wait while we retrieve your class schedule
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">
                Successfully Connected!
              </h2>
              <p className="dark:text-gray-300 text-gray-600">
                Your MUERP calendar has been synced with Google Calendar.
              </p>
              <p className="dark:text-gray-300 text-sm space-x-2">
                <span>Having trouble syncing? </span>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setCredentials({
                      username: "",
                      password: "",
                      calendarType: "",
                    });
                  }}
                  className="text-blue-400 hover:text-blue-500 transition-colors duration-200">
                  Try again
                </button>
                <span>or</span>
                <a
                  href="mailto:mark.atharv@gmail.com?subject=MU Calendar Sync Support"
                  className="text-blue-400 hover:text-blue-500 transition-colors duration-200">
                  contact us
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="space-y-4">
        {/* Username Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label
                htmlFor="username"
                className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
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
                autoComplete="username"
                className={`w-full px-4 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white`}
                placeholder="e.g., se00ucse000@mahindrauniversity.edu.in"
                value={credentials.username}
                onChange={handleUsernameChange}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label
                htmlFor="password"
                className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                MUERP Password
              </label>
            </div>
          </div>
          <div className="sm:w-2/3">
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className={`w-full px-4 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white`}
              placeholder="Enter your MUERP password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Calendar Type Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600">
              <label
                htmlFor="calendarType"
                className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                Calendar Type
              </label>
            </div>
          </div>
          <div className="sm:w-2/3">
            <select
              id="calendarType"
              value={credentials.calendarType}
              onChange={(e) => handleCalendarTypeChange(e.target.value)}
              className="w-full h-full px-4 mr-1 py-4 bg-white/40 dark:bg-black/40 border border-gray-400 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white">
              <option value="" className="text-gray-900 dark:text-white">
                Select a calendar
              </option>
              <option value="google" className="text-gray-900 dark:text-white">
                Google Calendar
              </option>
              <option value="ical" className="text-gray-900 dark:text-white">
                iCal
              </option>
              <option value="outlook" className="text-gray-900 dark:text-white">
                Outlook
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <a 
              href="https://buildandship.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <div className="h-full p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-gray-400 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200">
                <label className="block text-sm text-center text-gray-700 dark:text-gray-200 font-bold">
                  Build and Ship
                </label>
              </div>
            </a>
          </div>
        </div>

        {/* Google OAuth Button */}
        {showGoogleAuth && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3" />
            <div className="sm:w-2/3">
              <button
                onClick={handleGoogleAuth}
                disabled={
                  isLoading ||
                  !credentials.username ||
                  !credentials.password ||
                  !credentials.calendarType
                }
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md
                  ${
                    isLoading ||
                    !credentials.username ||
                    !credentials.password ||
                    !credentials.calendarType
                      ? "bg-gray-600 dark:bg-gray-700 cursor-not-allowed text-gray-300 dark:text-gray-400"
                      : "bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-blue-500 dark:to-purple-500 hover:opacity-90 text-gray-900 dark:text-white transition-all duration-200"
                  }`}>
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
                disabled>
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
