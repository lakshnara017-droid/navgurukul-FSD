import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { adminAPI } from "../../api";

const Upload = () => {
  const [importType, setImportType] = useState("students");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  const handleUploadSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      let res;
      if (importType === "students") res = await adminAPI.uploadStudents(formData);
      else if (importType === "courses") res = await adminAPI.uploadCourses(formData);
      else if (importType === "lessons") res = await adminAPI.uploadLessons(formData);
      else if (importType === "progress") res = await adminAPI.uploadProgress(formData);

      if (res.data.success) {
        setResult(res.data.results);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "File upload failed. Please verify format schema.");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateFields = () => {
    switch (importType) {
      case "students":
        return ["name", "email", "password (optional)"];
      case "courses":
        return ["title", "description", "category", "difficulty", "totalLessons", "duration"];
      case "lessons":
        return ["title", "courseTitle", "duration (mins)", "order", "type (optional)", "content (optional)", "pdfUrl (optional)", "videoUrl (optional)"];
      case "progress":
        return ["studentEmail", "lessonTitle", "completed (true/false)", "timeSpent (mins)"];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-violet-955 leading-tight">Data Importer</h2>
        <p className="text-violet-400 text-xs font-bold mt-1">Bulk upload educational datasets via spreadsheets or JSON.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Settings Column */}
        <div className="md:col-span-1 bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md space-y-5 shadow-sm">
          <div>
            <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-2">
              Import Type
            </label>
            <div className="space-y-1">
              {[
                { id: "students", label: "👥 Import Students" },
                { id: "courses", label: "📚 Import Courses" },
                { id: "lessons", label: "📖 Import Lessons" },
                { id: "progress", label: "📈 Import Progress" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setImportType(item.id);
                    setFile(null);
                    setResult(null);
                    setError("");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition border
                    ${importType === item.id
                      ? "bg-violet-600 border-violet-600 text-white shadow-glow"
                      : "bg-transparent border-transparent text-violet-750 hover:text-violet-950 hover:bg-violet-100/50"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-violet-955 text-xs font-bold mb-2">Schema Headers Template</h4>
            <p className="text-[10px] text-violet-450 mb-3 font-bold leading-relaxed">
              Your uploaded sheet columns must exactly match these header fields:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {getTemplateFields().map((field) => (
                <span
                  key={field}
                  className="px-2.5 py-1 rounded bg-cyan-50 border border-cyan-100 text-[9px] text-cyan-700 font-extrabold uppercase tracking-wider shadow-sm"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dropzone Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md space-y-5 shadow-sm">
            <h3 className="text-violet-955 font-bold text-sm">Upload Spreadsheet</h3>

            {/* Dropzone container */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? "border-violet-600 bg-violet-100/40 shadow-glow"
                  : "border-violet-200 bg-violet-100/15 hover:border-violet-300 hover:bg-violet-100/30"
                }`}
            >
              <input {...getInputProps()} />
              <span className="text-4xl mb-4 block animate-bounce">📤</span>
              {file ? (
                <div>
                  <p className="text-violet-950 font-bold text-xs">{file.name}</p>
                  <p className="text-violet-450 text-[10px] font-bold mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : isDragActive ? (
                <p className="text-violet-600 text-xs font-black">Drop the spreadsheet here...</p>
              ) : (
                <div>
                  <p className="text-violet-900 text-xs font-bold">Drag & drop your CSV, Excel or JSON here</p>
                  <p className="text-violet-450 text-[10px] mt-1 font-bold">Supported files: .xlsx, .csv, .json up to 10MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError("");
                  }}
                  className="text-xs font-bold text-violet-450 hover:text-violet-750 transition"
                >
                  Clear File
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={handleUploadSubmit}
                disabled={loading || !file}
                className="btn btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                ) : (
                  "Sync Dataset"
                )}
              </button>
            </div>
          </div>

          {/* Results preview panel */}
          {result && (
            <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">📊</span>
                <div>
                  <h4 className="text-violet-955 font-bold text-sm">Sync Metrics</h4>
                  <p className="text-violet-500/70 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                    Successful: <span className="text-emerald-600 font-extrabold">{result.success}</span> | Failed:{" "}
                    <span className="text-rose-600 font-extrabold">{result.failed}</span>
                  </p>
                </div>
              </div>

              {/* Errors array box */}
              {result.errors && result.errors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-2">
                  <h5 className="text-rose-650 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Validation Issues / Duplicate Log ({result.errors.length})
                  </h5>
                  <ul className="text-[10px] text-violet-900/80 space-y-1 overflow-y-auto max-h-[120px] font-mono select-text list-disc pl-4">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview records table */}
              {result.preview && result.preview.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-violet-500 text-[11px] font-black uppercase tracking-wider">Dataset preview (First {result.preview.length} lines)</h5>
                  <div className="overflow-x-auto border border-violet-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-[10px] text-violet-900 bg-violet-100/10">
                      <thead>
                        <tr className="bg-violet-100/40 border-b border-violet-100 font-bold">
                          {Object.keys(result.preview[0]).map((key) => (
                            <th key={key} className="p-2 capitalize">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-100 font-medium">
                        {result.preview.map((row, i) => (
                          <tr key={i} className="hover:bg-violet-100/20">
                            {Object.values(row).map((val, idx) => (
                              <td key={idx} className="p-2 max-w-[120px] truncate">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
