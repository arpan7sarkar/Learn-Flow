import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { CheckCircle, FileText, UploadCloud, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { cn } from "../lib/utils";
import { uploadSyllabus, generateStudyPlan } from "../lib/api";

export function SyllabusUpload() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [timeline, setTimeline] = useState('7-days');
  const [customAmount, setCustomAmount] = useState('3');
  const [customUnit, setCustomUnit] = useState('days');
  const [planName, setPlanName] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    setUploadSuccess(false);
    setProgress(0);
    setError(null);
  };

  const startUpload = async () => {
    if (!file || !userEmail) return;
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      // Upload syllabus with user email
      setProgress(30);
      const uploadResult = await uploadSyllabus(file, planName || undefined, userEmail);
      setProgress(60);

      if (uploadResult.success) {
        // Calculate examDate based on timeline
        const targetDate = new Date();
        if (timeline === 'custom') {
          const amount = parseInt(customAmount) || 1;
          if (customUnit === 'hours') targetDate.setHours(targetDate.getHours() + amount);
          else if (customUnit === 'days') targetDate.setDate(targetDate.getDate() + amount);
          else if (customUnit === 'weeks') targetDate.setDate(targetDate.getDate() + (amount * 7));
        } else {
          const map: Record<string, number> = { '3-days': 3, '7-days': 7, '1-month': 30, '3-months': 90 };
          targetDate.setDate(targetDate.getDate() + (map[timeline] || 7));
        }

        // Generate study plan with user email
        const planResult = await generateStudyPlan(
          uploadResult.data.studyPlanId,
          4,
          targetDate.toISOString(),
          userEmail
        );
        setProgress(100);

        setAnalysisResult({
          ...uploadResult.data,
          ...planResult.data
        });
        setUploadSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process syllabus');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12 pt-24 sm:pt-28">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Upload Your Syllabus</h1>
        <p className="text-gray-400">
          Upload your course PDF or image. Our AI will analyze it and create a personalized study plan.
        </p>
      </div>

      <Card className="bg-cosmic-blue/20 border-white/10 overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {!uploadSuccess ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]",
                dragActive ? "border-highlight-cyan bg-highlight-cyan/5" : "border-gray-600 hover:border-gray-400 bg-space-black/50",
                file ? "border-nebula-purple" : ""
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mb-6 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Plan Name (optional)"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-space-black border border-gray-700 rounded px-4 py-2 text-white text-sm focus:border-nebula-purple outline-none mb-4"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleChange}
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 bg-space-black rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-lg shadow-highlight-cyan/10">
                    <UploadCloud className="w-8 h-8 text-highlight-cyan" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Drag & Drop your file here</h3>
                  <p className="text-gray-400 mb-6">or</p>
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-nebula-purple text-nebula-purple hover:bg-nebula-purple hover:text-black cursor-pointer transition-colors"
                  >
                    Browse Files
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, PNG, JPG (Max 10MB)</p>
                </>
              ) : (
                <div className="w-full max-w-md">
                  <div className="flex items-center p-4 bg-space-black/60 rounded-lg border border-white/10 mb-6">
                    <FileText className="w-8 h-8 text-nebula-purple mr-4" />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={uploading}>Change</Button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Study Timeline</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {['3-days', '7-days', '1-month', '3-months', 'custom'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setTimeline(opt)}
                          className={cn(
                            "px-2 py-2 rounded-md text-xs border transition-colors truncate",
                            timeline === opt
                              ? "bg-nebula-purple border-nebula-purple text-black"
                              : "bg-transparent border-gray-600 text-gray-300 hover:border-gray-400"
                          )}
                        >
                          {opt.replace('-', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {timeline === 'custom' && (
                      <div className="flex gap-4 p-4 bg-space-black/40 rounded-lg border border-white/10 animate-fade-in-up">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Duration</label>
                          <input
                            type="number"
                            min="1"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full bg-space-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-nebula-purple outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Unit</label>
                          <select
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                            className="w-full bg-space-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-nebula-purple outline-none"
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing syllabus with AI...
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-nebula-purple transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full bg-nebula-purple border-nebula-purple text-black hover:bg-gray-300 font-bold transition-all shadow-lg shadow-nebula-purple/20" 
                      onClick={startUpload}
                    >
                      Generate Study Plan
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Syllabus Analyzed!</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                We've identified <span className="text-highlight-cyan font-bold">{analysisResult?.totalTopics || 15}</span> key topics
                and created <span className="text-highlight-cyan font-bold">{analysisResult?.eventsCreated || 0}</span> study sessions.
              </p>
              {analysisResult?.tips && (
                <div className="mb-8 text-left max-w-md mx-auto">
                  <h4 className="text-sm font-bold text-white mb-2">Study Tips:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {analysisResult.tips.slice(0, 3).map((tip: string, i: number) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <Link to="/planner">
                  <Button variant="neon" size="lg" className="gap-2">
                    <Calendar className="w-4 h-4" /> View Study Plan
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => { setFile(null); setUploadSuccess(false); setAnalysisResult(null); }}>
                  Upload Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
