"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is MU Calendar Sync?",
    answer:
      "MU Calendar Sync is a tool that helps you synchronize your MUERP timetable with various calendar platforms like Google Calendar and iCal.",
  },
  {
    question:
      "It shows a green check mark on google calendar but no events are added?",
    answer:
      "This process may take a few minutes. If the events are not added after a while, please clear browser cache and try again.",
  },
  {
    question: "Do my club events show up in the calendar?",
    answer:
      "<strong>Yes!</strong> Absolutely. That is one of the primary reasons we built this.",
  },
  {
    question: "Is it secure?",
    answer:
      "Yes, we use secure authentication and handling methods. Your calendar data is only used for syncing purposes.",
  },
  {
    question: "Which calendar platforms are supported?",
    answer:
      "Currently, we support Google Calendar and iCal. More platforms are coming soon!",
  },
  {
    question: "I have a feature request/issue/rant, how can I submit it?",
    answer:
      'Simply click the "Suggest More..." button and open a github issue.',
  },
];

export default function FAQModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
