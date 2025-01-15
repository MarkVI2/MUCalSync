"use client";

import { useState } from "react";
import { IconUpload, IconTrash } from "@tabler/icons-react";

export default function TimetableUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload-timetable`,
        {
          method: "POST",
          headers: {
            "X-API-Key": process.env.API_KEY || "",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload timetable");
      }

      // Handle successful upload
      alert("Timetable uploaded successfully!");
    } catch (err) {
      setError("Failed to upload timetable. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete all timetables?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/timetable`,
        {
          method: "DELETE",
          headers: {
            "X-API-Key": process.env.API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete timetables");
      }

      const data = await response.json();
      setSuccess(
        `Successfully deleted ${data.deleted_count} timetable entries`
      );
    } catch (err) {
      setError("Failed to delete timetables. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Timetable Management</h2>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <IconTrash className="w-4 h-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete All"}
        </button>
      </div>

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <IconUpload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">XLSX file only</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      {success && (
        <div className="mt-4 text-center text-green-600">{success}</div>
      )}
      {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      {isUploading && (
        <div className="mt-4 text-center text-gray-600">Uploading...</div>
      )}
    </div>
  );
}
