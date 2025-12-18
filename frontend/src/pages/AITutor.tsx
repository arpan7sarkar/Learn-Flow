import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Bot, Send, User, Trophy, Loader2, CheckCircle, XCircle, Plus, MessageSquare, Trash2, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { explainTopic, generateQuiz, submitQuiz, getChatSessions, getChatSession, deleteChatSession } from "../lib/api";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const PREDEFINED_TOPICS = [
  "Quantum Mechanics",
  "Organic Chemistry",
  "Calculus: Derivatives",
  "European History",
  "Macroeconomics"
];

const ANALOGIES = [
  { id: "marvel", label: "Marvel Universe", icon: "🛡️" },
  { id: "football", label: "Football", icon: "⚽" },
  { id: "cricket", label: "Cricket", icon: "🏏" },
  { id: "scifi", label: "Sci-Fi Movies", icon: "🚀" },
  { id: "reallife", label: "Real Life", icon: "🌍" },
  { id: "Custom", label: "Custom", icon: "✨" },
];

interface Message {
  role: 'ai' | 'user';
  content: string;
  keyPoints?: string[];
}

interface ChatSession {
  _id: string;
  topic: string;
  lastUpdated: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

export function AITutor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // New Chat State
  const [isNewChat, setIsNewChat] = useState(true);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(""); // If empty, using custom

  const [selectedAnalogy, setSelectedAnalogy] = useState(ANALOGIES[0].id);
  const [customAnalogy, setCustomAnalogy] = useState("");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your cosmic tutor. Pick a topic (or type your own) and an analogy style to start!" }
  ]);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load Sessions List
  useEffect(() => {
    loadSessions();
  }, []);

  // Check URL for session
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const loadSessions = async () => {
    try {
      const response = await getChatSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await getChatSession(sessionId);
      if (response.success) {
        setCurrentSessionId(sessionId);
        setIsNewChat(false);
        setMessages(response.data.map((m: any) => ({
          role: m.role === 'model' ? 'ai' : m.role,
          content: m.content,
          keyPoints: m.keyPoints
        })));

        // Find topic from session list if possible
        const session = sessions.find(s => s._id === sessionId);
        if (session) {
          setSelectedTopic(PREDEFINED_TOPICS.includes(session.topic) ? session.topic : 'Custom');
          if (!PREDEFINED_TOPICS.includes(session.topic)) setCustomTopic(session.topic);
        }

        setShowQuiz(true);
      }
    } catch (err) {
      console.error("Failed to load session", err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;

    try {
      const response = await deleteChatSession(sessionId);
      if (response.success) {
        // Remove from list
        setSessions(prev => prev.filter(s => s._id !== sessionId));

        // If current session was deleted, go to new chat
        if (currentSessionId === sessionId) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const startNewChat = () => {
    setIsNewChat(true);
    setCurrentSessionId(null);
    setMessages([{ role: "ai", content: "Hello! I'm your cosmic tutor. Pick a topic (or type your own) and an analogy style to start!" }]);
    setSelectedTopic("");
    setCustomTopic("");
    setSearchParams({});
    setShowQuiz(false);
    setQuiz(null);
  };

  const handleSend = async () => {
    if (loading) return;

    // If new chat, we need a topic
    const topicToSend = isNewChat ? (selectedTopic || customTopic) : null;
    const messageToSend = input || `Explain ${topicToSend}`;

    if (isNewChat && !topicToSend) {
      alert("Please select or enter a topic first!");
      return;
    }

    if (!messageToSend.trim()) return;

    const userMsg: Message = { role: "user", content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Determine analogy (Custom or ID)
    const effectiveAnalogy = selectedAnalogy === 'Custom' ? (customAnalogy || 'Creative') : selectedAnalogy;

    try {
      // If continuing session, use current topic from session (user didn't change it)
      // If new session, topicToSend is set.
      const response = await explainTopic(
        isNewChat ? topicToSend! : input,
        effectiveAnalogy,
        currentSessionId || undefined
      );

      if (response.success) {
        const aiResponse: Message = {
          role: "ai",
          content: response.data.analogyExplanation || response.data.simpleExplanation,
          keyPoints: response.data.keyPoints
        };
        setMessages(prev => [...prev, aiResponse]);

        if (response.data.sessionId) {
          setCurrentSessionId(response.data.sessionId);
          setSearchParams({ session: response.data.sessionId });
          setIsNewChat(false);
          loadSessions(); // Refresh sidebar
        }
        setShowQuiz(true);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        role: "ai",
        content: `Sorry, I couldn't process that. ${err.message || 'Please try again.'}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    try {
      // Use current session topic if available, or selected
      const topic = sessions.find(s => s._id === currentSessionId)?.topic || selectedTopic || customTopic;
      const response = await generateQuiz(topic, 5);
      if (response.success && response.data.questions) {
        setQuiz(response.data.questions);
      }
    } catch (err) {
      console.error('Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    const topic = sessions.find(s => s._id === currentSessionId)?.topic || selectedTopic || customTopic;

    const formattedAnswers = quiz.map(q => {
      const selected = quizAnswers[q.id] || "";
      const match = selected.match(/^([A-Da-d])[\)\.]/);
      const selectedLetter = match ? match[1].toUpperCase() : "";
      const isCorrect = selectedLetter === q.correctAnswer;
      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect: isCorrect
      };
    });

    try {
      const response = await submitQuiz(topic, formattedAnswers);
      if (response.success) {
        setQuizResult(response.data);
        setQuizSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit quiz", err);
    }
  };

  const isNewChatReady = (selectedTopic && selectedTopic !== 'Custom') || (customTopic && customTopic.trim().length > 0);
  const isSendDisabled = loading || (isNewChat ? !isNewChatReady : !input.trim());

  return (
    <>
      {/* Quiz Modal Overlay */}
      {quiz && quiz.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-7xl bg-brand-black border-brand-gray shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-brand-gray flex justify-between items-center bg-brand-dark">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6" /> Quick Quiz
              </h4>
              <button onClick={() => setQuiz(null)} className="p-1 hover:bg-white/10 rounded-full">
                <XCircle className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-brand-black">
              {/* Quiz Result Summary */}
              {quizResult && (
                <div className={cn("p-4 rounded-xl border mb-6 animate-in slide-in-from-top-2", quizResult.passed ? "bg-green-500/20 border-green-500/50 text-green-200" : "bg-red-500/20 border-red-500/50 text-red-200")}>
                  <div className="flex items-center gap-3">
                    {quizResult.passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    <div>
                      <h3 className="font-bold text-lg">{quizResult.passed ? "excellent Work!" : "Keep Learning!"}</h3>
                      <p className="text-sm opacity-90">
                        You scored <span className="font-bold">{quizResult.score}%</span> ({quizResult.correctAnswers} out of {quizResult.totalQuestions} correct).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Content Reused from previous version */}
              {quiz.map((q, i) => (
                <div key={q.id} className="mb-8">
                  <div className="text-base font-medium text-white text-left mb-2">
                    <span className="font-bold mr-2">{i + 1}.</span>
                    <span className="inline-block">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: ({ children }) => <span className="inline">{children}</span> }}>{q.question}</ReactMarkdown>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, j) => {
                      let btnClass = "bg-brand-dark border-brand-gray text-gray-300 hover:border-white/30 hover:bg-white/5";
                      const match = opt.match(/^([A-Da-d])[\)\.]/);
                      const optLetter = match ? match[1].toUpperCase() : "";
                      const isCorrectOption = optLetter === q.correctAnswer;
                      const isSelected = opt === quizAnswers[q.id];

                      if (quizSubmitted) {
                        if (isCorrectOption) btnClass = "bg-green-500/10 border-green-500/40 text-green-300";
                        else if (isSelected) btnClass = "bg-red-500/10 border-red-500/40 text-red-300 opacity-80";
                        else btnClass = "opacity-40 grayscale";
                      } else if (isSelected) {
                        btnClass = "bg-white/10 border-white text-white";
                      }

                      return (
                        <button key={j} onClick={() => handleOptionSelect(q.id, opt)} disabled={quizSubmitted} className={cn("text-left text-sm p-4 rounded-xl border transition-all flex justify-between items-center group", btnClass)}>
                          <div className="flex-1 pr-2"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: ({ children }) => <span className="inline">{children}</span> }}>{opt}</ReactMarkdown></div>
                          {quizSubmitted && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {quizSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 animate-in fade-in slide-in-from-top-1">
                      <p className="font-bold mb-1 flex items-center gap-2"><Bot className="w-4 h-4" /> Explanation:</p>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!quizSubmitted && (
              <div className="p-4 border-t border-brand-gray bg-brand-dark flex justify-end">
                <Button className="bg-white text-black hover:bg-gray-200" onClick={handleSubmitQuiz} disabled={Object.keys(quizAnswers).length !== quiz.length}>Submit Answers</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="h-[calc(100vh-1rem)] pt-24 flex max-w-7xl mx-auto px-4 pb-8 gap-6 justify-center">
        {/* Sidebar - Chat Session History */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4 hidden md:flex">
          <Card className="bg-brand-dark border-brand-gray flex-1 overflow-auto flex flex-col">
            <div className="p-4 border-b border-brand-gray">
              <Button onClick={startNewChat} className="w-full justify-center gap-2 bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4" /> New Chat
              </Button>
            </div>
            <CardContent className="p-2 space-y-1 overflow-y-auto flex-1">
              <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Chats</p>
              {sessions.map(session => (
                <div
                  key={session._id}
                  className={cn(
                    "group w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between gap-3 cursor-pointer",
                    currentSessionId === session._id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  )}
                  onClick={() => loadSession(session._id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{session.topic}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-4 max-w-4xl">
          <Card className="flex-1 bg-brand-dark border-brand-gray flex flex-col overflow-hidden relative">
            {/* Header / Config (Only show config if New Chat) */}
            <div className="p-4 border-b border-brand-gray flex flex-col gap-4 bg-brand-dark backdrop-blur-md">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isNewChat ? "Start a New Session" : (sessions.find(s => s._id === currentSessionId)?.topic || "Chat Session")}
                  </h2>
                </div>
                {!isNewChat && showQuiz && (
                  <Button variant="outline" size="sm" className="gap-2 text-white border-white/50 hover:bg-white/10" onClick={handleGenerateQuiz} disabled={quizLoading}>
                    {quizLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />} Micro-Quiz
                  </Button>
                )}
              </div>

              {isNewChat && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Topic</label>
                    <div className="space-y-2">
                      {/* Custom Topic Dropdown */}
                      <div className="relative">
                        <button
                          className="w-full flex items-center justify-between bg-brand-black border border-brand-gray rounded-lg p-2 text-sm text-white focus:outline-none focus:border-white transition-all"
                          onClick={() => {
                            const dropdown = document.getElementById("topic-dropdown");
                            if (dropdown) dropdown.classList.toggle("hidden");
                          }}
                          onBlur={() => setTimeout(() => document.getElementById("topic-dropdown")?.classList.add("hidden"), 200)}
                        >
                          <span>{selectedTopic || "Select a topic..."}</span>
                          <ChevronDown className="w-4 h-4 opacity-70" />
                        </button>

                        <div id="topic-dropdown" className="hidden absolute z-50 mt-2 w-full bg-brand-dark border border-brand-gray rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                          {PREDEFINED_TOPICS.map(t => (
                            <div
                              key={t}
                              className="px-4 py-2 hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-gray-300 text-sm border-b border-brand-gray last:border-0"
                              onClick={() => {
                                setSelectedTopic(t);
                                setCustomTopic("");
                                document.getElementById("topic-dropdown")?.classList.add("hidden");
                              }}
                            >
                              {t}
                            </div>
                          ))}
                          <div
                            className="px-4 py-2 hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-white/50 text-sm font-medium"
                            onClick={() => {
                              setSelectedTopic("Custom");
                              // Input handles the rest
                              document.getElementById("topic-dropdown")?.classList.add("hidden");
                            }}
                          >
                            Custom Topic...
                          </div>
                        </div>
                      </div>
                      {(selectedTopic === "Custom" || (selectedTopic === "" && customTopic)) && (
                        <Input
                          placeholder="Enter your custom topic..."
                          value={customTopic}
                          onChange={(e) => {
                            setCustomTopic(e.target.value);
                            setSelectedTopic(""); // Clear dropdown visual if typing custom
                          }}
                          className="bg-brand-black border-brand-gray"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Analogy Style</label>
                    <div className="flex gap-2 flex-wrap">
                      {ANALOGIES.map(analogy => (
                        <button
                          key={analogy.id}
                          onClick={() => setSelectedAnalogy(analogy.id)}
                          className={cn("px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1",
                            selectedAnalogy === analogy.id ? "bg-white text-black border-white" : "bg-brand-black border-brand-gray text-gray-400"
                          )}
                        >
                          <span>{analogy.icon}</span> {analogy.label}
                        </button>
                      ))}
                    </div>
                    {selectedAnalogy === 'Custom' && (
                      <Input
                        placeholder="e.g., Harry Potter, Cooking, Cars..."
                        value={customAnalogy}
                        onChange={(e) => setCustomAnalogy(e.target.value)}
                        className="mt-2 bg-brand-black border-brand-gray h-8 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", msg.role === "ai" ? "bg-brand-gray/20 text-white" : "bg-white text-black")}>
                    {msg.role === "ai" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={cn("p-4 rounded-2xl shadow-lg transition-all w-full", msg.role === "user" ? "bg-white text-black border border-white" : "bg-brand-black text-gray-200 border border-brand-gray")}>
                    <div className="text-left prose prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.keyPoints && msg.keyPoints.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-bold text-gray-400 mb-2">Key Points:</p>
                        <ul className="text-xs space-y-1">
                          {msg.keyPoints.map((point, j) => (
                            <li key={j} className="flex gap-2">
                              <span>•</span>
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: ({ children }) => <span className="inline">{children}</span> }}>{point}</ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 mr-auto max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-gray/20 text-white"><Bot className="w-5 h-5" /></div>
                  <div className="p-3 rounded-lg bg-brand-dark border border-brand-gray"><Loader2 className="w-5 h-5 animate-spin text-white" /></div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-brand-gray bg-brand-dark backdrop-blur-md">
              <div className="flex gap-4">
                <Input
                  placeholder={isNewChat ? "Start the conversation..." : "Ask a follow up question..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                  className="bg-brand-black border-brand-gray focus-visible:ring-brand-gray"
                />
                <Button className="bg-white text-black hover:bg-gray-200" size="icon" onClick={handleSend} disabled={isSendDisabled}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
