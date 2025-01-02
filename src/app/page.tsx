"use client";
import { useState, useEffect } from "react";
import Dropdown from "../components/dropdown";
import {
  SCHOOL_OPTIONS,
  BATCH_YEARS,
  BatchYear,
  SchoolOption,
} from "./utils/constants";

import {
  IconBrandGoogleFilled,
  IconBrandApple,
  IconBrandTeams,
  IconArrowLeft,
  IconCalendarPlus,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | "">("");
  const [selectedBatch, setSelectedBatch] = useState<BatchYear | "">("");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleSuccess, setIsGoogleSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.authenticated) {
          setIsGoogleSuccess(true);
        }
      } catch (error) {
        console.error("Auth check failed: ", error);
      }
    };

    const handleMessage = async (e: MessageEvent) => {
      if (e.data.type === "GOOGLE_AUTH_SUCCESS") {
        setIsGoogleLoading(false);
        setIsGoogleSuccess(true);

        try {
          const calendarData = {
            school: selectedSchool,
            batch: selectedBatch,
            stream: selectedStream,
            section: selectedSection,
            token: {
              access_token: e.data.token.access_token,
              refresh_token: e.data.token.refresh_token,
            },
            email: e.data.token.email,
            calendarType: "google",
          };

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/calendar/sync`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(calendarData),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to sync calendar");
          }
          console.log("Calendar synced successfully!");
        } catch (error) {
          console.error("Failed to sync calendar:", error);
          setIsGoogleSuccess(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    checkAuth();
    return () => window.removeEventListener("message", handleMessage);
  }, [selectedSchool, selectedBatch, selectedStream, selectedSection]);

  const getAvailableStreams = () => {
    if (!selectedSchool || !selectedBatch) return [];

    const school = SCHOOL_OPTIONS[selectedSchool];
    if (!school) return [];

    // Now TypeScript knows selectedBatch is a valid key
    return school.availableByBatch[selectedBatch as BatchYear] || [];
  };

  const isStreamDisabled = !selectedSchool || !selectedBatch;
  const isSectionDisabled = !selectedStream;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      {/* Main content container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-4 w-1/2 sm:w-1/4 md:w-1/4">
          <Link
            href="https://buildandship.org"
            target="_self"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <IconArrowLeft className="mr-2" />
            Build And Ship
          </Link>
        </div>
        {/* Glass card */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl p-6 md:p-12 space-y-8">
          {/* Header section */}
          <div className="text-center space-y-2">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-fredoka font-semibold 
              bg-gradient-to-r from-indigo-600 to-slate-800 bg-clip-text text-transparent py-2"
            >
              MU Calendar Sync
            </h1>
            <div className="h-px bg-gradient-to-r from-indigo-100 to-slate-200 w-full max-w-2xl mx-auto" />
          </div>

          {/* Form content */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Select School"
                options={Object.keys(SCHOOL_OPTIONS)}
                onSelect={(value) => {
                  setSelectedSchool(value as keyof typeof SCHOOL_OPTIONS | "");
                }}
                value={selectedSchool}
              />
              <Dropdown
                label="Select Batch"
                options={[...BATCH_YEARS]}
                onSelect={(value) => setSelectedBatch(value as BatchYear)}
                value={selectedBatch}
              />
              <Dropdown
                label="Select Stream"
                options={getAvailableStreams()}
                onSelect={setSelectedStream}
                disabled={isStreamDisabled}
                value={selectedStream}
              />
              <Dropdown
                label="Select Section"
                options={["1", "2", "3", "4"]}
                onSelect={setSelectedSection}
                disabled={isSectionDisabled}
                value={selectedSection}
              />
            </div>

            {/* Calendar options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {["Google Calendar", "iCal", "Outlook", "Suggest More..."].map(
                (calendar) => {
                  const isDisabled =
                    calendar !== "Google Calendar" &&
                    calendar !== "Suggest More..." &&
                    calendar !== "iCal";

                  const handleClick = async (calendar: string) => {
                    switch (calendar) {
                      case "Google Calendar":
                        if (isGoogleSuccess) return;
                        setIsGoogleLoading(true); // Set loading state
                        try {
                          const response = await fetch("/api/auth/google");
                          const data = await response.json();
                          if (data.url) {
                            const authWindow = window.open(
                              data.url,
                              "_blank",
                              "width=600,height=600"
                            );
                            const handleMessage = (e: MessageEvent) => {
                              if (e.data.type === "GOOGLE_AUTH_SUCCESS") {
                                setIsGoogleLoading(false);
                                setIsGoogleSuccess(true);
                                window.removeEventListener(
                                  "message",
                                  handleMessage
                                );
                              }
                              if (e.data.type === "GOOGLE_AUTH_ERROR") {
                                setIsGoogleLoading(false);
                                setIsGoogleSuccess(false);
                                window.removeEventListener(
                                  "message",
                                  handleMessage
                                );
                              }
                            };
                            window.addEventListener("message", handleMessage);
                          } else {
                            throw new Error("Google auth URL not found");
                          }
                        } catch (error) {
                          setIsGoogleLoading(false);
                          setIsGoogleSuccess(false);
                          console.error("Google auth error:", error);
                        }
                        break;
                      case "iCal":
                        try {
                          const calendarData = {
                            school: selectedSchool,
                            batch: selectedBatch,
                            stream: selectedStream,
                            section: selectedSection,
                            calendarType: "ical",
                          };

                          const response = await fetch(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/calendar/ical`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(calendarData),
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to generate iCal file");
                          }

                          // Download the iCal file
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "mucalendar.ics";
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          console.error("Failed to generate iCal file:", error);
                          // Handle error - show error message to user
                        }
                        break;
                      case "Outlook":
                        console.log("Outlook clicked");
                        break;
                      case "Suggest More...":
                        window.open(
                          "https://github.com/MarkVI2/MUCalSync/issues/new",
                          "_blank"
                        );
                        break;
                      default:
                        break;
                    }
                  };
                  return (
                    <button
                      key={calendar}
                      className={`group relative overflow-hidden rounded-xl p-4 
                      transition-all duration-185 ${
                        isDisabled
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : calendar === "Google Calendar"
                          ? isGoogleSuccess
                            ? "bg-green-400 text-white cursor-default"
                            : "bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white shadow-md"
                          : "bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white shadow-md"
                      }`}
                      disabled={isDisabled || isGoogleSuccess}
                      onClick={() => handleClick(calendar)}
                    >
                      <div className="flex flex-col items-center gap-3">
                        {/* Shine effect */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 
                        transition-all duration-300 bg-gradient-to-r from-transparent 
                        via-white to-transparent -translate-x-full group-hover:translate-x-full"
                        />

                        {/* Icons */}
                        {calendar === "Google Calendar" && (
                          <>
                            {isGoogleLoading ? (
                              <div className="w-8 h-8 animate-spin rounded-full border-2 border-t-transparent border-indigo-500" />
                            ) : isGoogleSuccess ? (
                              <IconCheck className="w-8 h-8 text-white" />
                            ) : (
                              <IconBrandGoogleFilled className="w-8 h-8 transition-colors duration-300" />
                            )}
                          </>
                        )}
                        {calendar === "iCal" && (
                          <IconBrandApple className="w-8 h-8 transition-colors duration-300" />
                        )}
                        {calendar === "Outlook" && (
                          <IconBrandTeams className="w-8 h-8 transition-colors duration-300" />
                        )}
                        {calendar === "Suggest More..." && (
                          <IconCalendarPlus className="w-8 h-8 transition-colors duration-300" />
                        )}
                        <span className="font-medium">{calendar}</span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              <div className="text-gray-600 text-center dark:text-gray-400">
                <a
                  href="https://buildandship.org/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
              <div className="text-gray-600 text-center dark:text-gray-400">
                Made with 🦖 by{" "}
                <a
                  href="https://github.com/MarkVI2"
                  className="text-blue-600 hover:text-blue-800"
                >
                  AviatorGator
                </a>
              </div>
              <div className="text-gray-600 text-center dark:text-gray-400">
                v1.2.0-alpha
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
