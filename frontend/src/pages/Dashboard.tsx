import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, CheckCircle, Clock, Trophy, Upload, Loader2, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getStudyCalendar, getQuizHistory } from "../lib/api";
import { cn } from "../lib/utils";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    topicsMastered: 0,
    studyHours: 0,
    tasksCompleted: 0,
    streak: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const calendarRes = await getStudyCalendar();
        if (calendarRes.success && calendarRes.data) {
          const events = calendarRes.data.slice(0, 5);
          setUpcomingTasks(events.map((e: any) => ({
            title: e.topic || e.title,
            date: new Date(e.start).toLocaleDateString('en-US', { 
              weekday: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: e.type || 'Study'
          })));

          const completed = calendarRes.data.filter((e: any) => e.completed).length;
          setStats(prev => ({
            ...prev,
            tasksCompleted: completed,
            topicsMastered: Math.floor(completed / 3)
          }));
        }

        const quizRes = await getQuizHistory();
        if (quizRes.success && quizRes.data) {
          setStats(prev => ({
            ...prev,
            streak: quizRes.data.length > 0 ? Math.min(quizRes.data.length, 7) : 0
          }));
        }
      } catch (err) {
        setUpcomingTasks([
          { title: "Quantum Physics Basics", date: "Today, 2:00 PM", type: "Study" },
          { title: "Organic Chemistry Quiz", date: "Tomorrow, 10:00 AM", type: "Exam" },
          { title: "Calculus Limits", date: "Wed, 4:00 PM", type: "Review" },
        ]);
        setStats({
          topicsMastered: 12,
          studyHours: 45,
          tasksCompleted: 28,
          streak: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-brand-text pt-24 pb-12 font-inter px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-brand-text-muted">Overview of your learning progress.</p>
          </div>
          <Link to="/upload">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-semibold">
              <Upload className="w-4 h-4 mr-2" /> New Syllabus
            </Button>
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Stat Card: Streak */}
          <div className="bg-brand-dark border border-brand-gray rounded-3xl p-6 flex flex-col justify-between h-48 group hover:border-brand-text-muted/20 transition-colors">
             <div className="flex justify-between items-start">
               <div className="p-3 bg-brand-gray/50 rounded-2xl">
                 <Trophy className="text-white w-6 h-6" />
               </div>
               <span className="text-xs font-mono text-brand-text-muted bg-brand-black px-2 py-1 rounded-md">STREAK</span>
             </div>
             <div>
               <div className="text-4xl font-bold mb-1">{stats.streak}</div>
               <div className="text-sm text-brand-text-muted">Days on fire</div>
             </div>
          </div>

          {/* Stat Card: Progress */}
          <div className="bg-brand-dark border border-brand-gray rounded-3xl p-6 flex flex-col justify-between h-48 group hover:border-brand-text-muted/20 transition-colors">
             <div className="flex justify-between items-start">
               <div className="p-3 bg-brand-gray/50 rounded-2xl">
                 <CheckCircle className="text-white w-6 h-6" />
               </div>
               <span className="text-xs font-mono text-brand-text-muted bg-brand-black px-2 py-1 rounded-md">DONE</span>
             </div>
             <div>
               <div className="text-4xl font-bold mb-1">{stats.tasksCompleted}</div>
               <div className="text-sm text-brand-text-muted">Missions completed</div>
             </div>
          </div>

           {/* Stat Card: Hours */}
           <div className="bg-brand-dark border border-brand-gray rounded-3xl p-6 flex flex-col justify-between h-48 group hover:border-brand-text-muted/20 transition-colors">
             <div className="flex justify-between items-start">
               <div className="p-3 bg-brand-gray/50 rounded-2xl">
                 <Clock className="text-white w-6 h-6" />
               </div>
               <span className="text-xs font-mono text-brand-text-muted bg-brand-black px-2 py-1 rounded-md">TIME</span>
             </div>
             <div>
               <div className="text-4xl font-bold mb-1">{stats.studyHours}h</div>
               <div className="text-sm text-brand-text-muted">Total focus time</div>
             </div>
          </div>

          {/* Quick Action: AI Tutor */}
          <Link to="/tutor" className="bg-brand-dark border border-brand-gray rounded-3xl p-6 flex flex-col justify-between h-48 group cursor-pointer hover:bg-brand-gray/30 transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight className="w-5 h-5 text-brand-text-muted" />
             </div>
             <div className="p-3 bg-brand-gray/50 rounded-2xl w-fit">
               <BookOpen className="text-white w-6 h-6" />
             </div>
             <div>
               <div className="text-xl font-bold mb-1 group-hover:text-white transition-colors">AI Tutor</div>
               <div className="text-sm text-brand-text-muted">Get help now</div>
             </div>
          </Link>

          {/* Large Card: Upcoming Tasks */}
          <div className="md:col-span-3 bg-brand-dark border border-brand-gray rounded-3xl p-8 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-text-muted" /> 
                Upcoming Schedule
              </h3>
              <Link to="/planner">
                <Button variant="ghost" size="sm" className="text-brand-text-muted hover:text-white">View All</Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-gray" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTasks.length > 0 ? upcomingTasks.map((task, i) => (
                  <div key={i} className="bg-brand-black/50 border border-brand-gray/50 rounded-2xl p-5 hover:border-brand-text-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                        task.type === 'Exam' ? "bg-red-500/10 text-red-500" :
                        task.type === 'Review' ? "bg-purple-500/10 text-purple-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {task.type}
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-brand-text-muted cursor-pointer hover:text-white" />
                    </div>
                    <h4 className="font-semibold text-lg mb-1 truncate">{task.title}</h4>
                    <p className="text-sm text-brand-text-muted flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {task.date}
                    </p>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-brand-text-muted border-2 border-dashed border-brand-gray rounded-2xl">
                    <p>No upcoming tasks. Enjoy your day off!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Medium Card: Quick Syllabus Upload Call action if needed, or something else. Reusing topics mastered logic */}
           <div className="md:col-span-1 bg-brand-dark border border-brand-gray rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-brand-gray flex items-center justify-center mb-6 relative">
                 <div className="text-3xl font-bold">{stats.topicsMastered}</div>
                 <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin [animation-duration:3s]"></div>
              </div>
              <h3 className="font-bold text-lg">Topics Mastered</h3>
              <p className="text-sm text-brand-text-muted mt-2">Keep pushing your limits!</p>
           </div>
          
        </div>
      </div>
    </div>
  );
}
