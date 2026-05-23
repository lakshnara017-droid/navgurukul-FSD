import React, { useState } from "react";
import { certificatesAPI } from "../api";

const QUESTIONS = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Preprocessor",
      "Hyper Text Markup Language",
      "Hyper Text Multiple Language",
      "Hyper Tool Multi Language"
    ],
    answer: 1
  },
  {
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    answer: 3
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Colorful Style Sheets",
      "Computer Style Sheets",
      "Creative Style Sheets"
    ],
    answer: 0
  }
];

const QuizModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleNext = async () => {
    let newScore = score;
    if (selectedOption === QUESTIONS[currentQuestion].answer) {
      newScore += 1;
      setScore(newScore);
    }

    if (currentQuestion + 1 < QUESTIONS.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setError("");
    } else {
      // Finished Quiz
      if (newScore === QUESTIONS.length) {
        // Passed
        setClaiming(true);
        try {
          await certificatesAPI.claim(courseId);
          onSuccess();
        } catch (err) {
          setError(err.response?.data?.message || "Failed to claim certificate");
          setClaiming(false);
        }
      } else {
        setError("You must answer all questions correctly to claim the certificate. Try again!");
        setCurrentQuestion(0);
        setSelectedOption(null);
        setScore(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
        <div className="p-6 bg-gradient-to-r from-violet-600 to-cyan-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>🧠</span> Final Challenge
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-500 text-sm">
            Pass this quick quiz to prove your knowledge and claim your certificate!
          </p>

          <div className="space-y-4">
            <h4 className="text-slate-900 font-bold text-lg">
              {QUESTIONS[currentQuestion].question}
            </h4>
            <div className="space-y-2">
              {QUESTIONS[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                    selectedOption === idx
                      ? "bg-violet-50 border-violet-500 text-violet-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-violet-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl">{error}</p>}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <button
              onClick={handleNext}
              disabled={selectedOption === null || claiming}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl transition flex items-center gap-2"
            >
              {claiming ? "Claiming..." : currentQuestion + 1 === QUESTIONS.length ? "Finish & Claim" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
