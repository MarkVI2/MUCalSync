"use client";
import { useState } from "react";
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
  IconCopyPlus,
  IconCalendarPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | "">("");
  const [selectedBatch, setSelectedBatch] = useState<BatchYear | "">("");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const getAvailableStreams = () => {
    if (!selectedSchool || !selectedBatch) return [];

    const school = SCHOOL_OPTIONS[selectedSchool];
    if (!school) return [];

    // Now TypeScript knows selectedBatch is a valid key
    return school.availableByBatch[selectedBatch as BatchYear] || [];
  };

  const isStreamDisabled = !selectedSchool || !selectedBatch;
  const isSectionDisabled = !selectedStream;

  const handleGoogleAuth = async () => {
    await signIn("google", { callbackUrl: "/auth/callback" });
  };

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
          <div className="text-center space-y-5">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-playwrite font-bold 
              bg-gradient-to-r from-indigo-600 to-slate-800 bg-clip-text text-transparent py-5"
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
                    calendar !== "Suggest More...";
                  const handleClick = async () => {
                    switch (calendar) {
                      case "Google Calendar":
                        await signIn("google", { callbackUrl: "/success" });
                        const session = await getSession();
                        if (session) {
                          console.log("Access Token:", session.accessToken);
                        }
                        break;
                      case "iCal":
                        console.log("iCal clicked");
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
                          : "bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white shadow-md"
                      }`}
                      disabled={isDisabled}
                      onClick={handleClick}
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
                          <IconBrandGoogleFilled className="w-8 h-8 transition-colors duration-300" />
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
                v1.2.0-beta
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
