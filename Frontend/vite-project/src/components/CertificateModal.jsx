import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificateModal = ({ isOpen, onClose, studentName, courseTitle, completionDate }) => {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const element = certificateRef.current;
      // High-quality canvas capture
      const canvas = await html2canvas(element, {
        scale: 3, // higher scale for better resolution
        useCORS: true,
        backgroundColor: "#0f172a", // slate-900
      });
      const imgData = canvas.toDataURL("image/png");

      // Create PDF in landscape orientation
      // A4 landscape size: 297mm x 210mm
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName.replace(/\\s+/g, "_")}_Certificate.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate certificate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-w-[1000px] w-full flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>🎖️</span> Course Certificate
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Scrollable area for the certificate preview */}
        <div className="p-8 overflow-auto flex justify-center bg-slate-800/50">
          {/* Certificate Container - Fixed Aspect Ratio (approx A4 landscape 1.414 ratio) */}
          <div
            ref={certificateRef}
            className="relative bg-slate-900 w-[900px] h-[636px] flex-shrink-0 shadow-2xl overflow-hidden text-center flex flex-col items-center justify-center font-serif"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {/* Ornate Gold Border Container */}
            <div className="absolute inset-4 border-[6px] border-double border-amber-600/80 m-2 rounded-sm" />
            <div className="absolute inset-6 border border-amber-500/30 m-2 rounded-sm" />
            
            {/* Background embellishments */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 w-full px-16 space-y-6">
              {/* Logo / Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-glow">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: "sans-serif" }}>NG</span>
                </div>
                <h1 className="text-amber-500 tracking-[0.2em] uppercase text-sm font-bold" style={{ fontFamily: "sans-serif" }}>
                  NavGurukul Academy
                </h1>
              </div>

              {/* Title */}
              <h2 className="text-5xl font-extrabold text-white tracking-wide mb-2">
                Certificate of Completion
              </h2>
              <p className="text-slate-400 italic text-lg mb-8">
                This is to proudly certify that
              </p>

              {/* Student Name */}
              <div className="py-4 border-b border-slate-700 mx-auto w-3/4 mb-8">
                <h3 className="text-5xl font-black text-amber-400 capitalize tracking-tight drop-shadow-md">
                  {studentName}
                </h3>
              </div>

              {/* Course Title */}
              <p className="text-slate-300 text-lg mb-2">
                has successfully completed the comprehensive course
              </p>
              <h4 className="text-3xl font-bold text-cyan-400 mb-8 max-w-2xl mx-auto leading-snug">
                {courseTitle}
              </h4>

              {/* Footer Signatures */}
              <div className="flex justify-between items-end w-4/5 mx-auto mt-12 pt-8">
                <div className="text-center w-48">
                  <div className="border-b border-slate-600 pb-2 mb-2 text-amber-500 italic text-xl">
                    {formattedDate}
                  </div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold" style={{ fontFamily: "sans-serif" }}>
                    Date Issued
                  </p>
                </div>
                
                {/* Center Badge */}
                <div className="w-24 h-24 rounded-full border-4 border-amber-600 flex items-center justify-center bg-slate-900 shadow-xl relative -top-6">
                  <span className="text-amber-500 text-4xl">🏅</span>
                </div>

                <div className="text-center w-48">
                  <div className="border-b border-slate-600 pb-2 mb-2 text-white italic text-2xl font-light" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    NavGurukul
                  </div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold" style={{ fontFamily: "sans-serif" }}>
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-6 py-2.5 rounded-xl font-bold text-slate-900 transition flex items-center gap-2
              ${downloading ? "bg-amber-600/50 cursor-wait" : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow"}`}
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span>📥</span> Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
