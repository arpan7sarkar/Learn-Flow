import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

import { getStudyCalendar, updateCalendarEvent, getAllStudyPlans } from '../lib/api';
import { Loader2, RefreshCw, Upload, BookOpen, Calendar as CalendarIcon, CheckCircle2, Circle, X, Clock, AlignLeft, History, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';


export function StudyPlanner() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const handleLoadPlan = (planId: string) => {
    setCurrentPlanId(planId);
    setHistoryOpen(false);
  };

  const handleViewHistory = async () => {
    if (!userEmail) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const response = await getAllStudyPlans(userEmail);
      if (response.success) {
        setStudyPlans(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getStudyCalendar(userEmail, undefined, undefined, currentPlanId || undefined);
      if (response.success) {
        // FullCalendar accepts standard ISO strings or Date objects  
        // The API returns structured objects or ISO strings.
        // We'll normalize to standard event objects.
        const formattedEvents = response.data.map((event: any) => {
          // Flatten date objects to Date or ISO strings
          // FullCalendar prefers ISO strings for performance/timezone
          let start, end;
          if (typeof event.start === 'object' && event.start.year) {
            start = new Date(event.start.year, event.start.month, event.start.day, event.start.hour, event.start.minute);
          } else {  
            start = new Date(event.start);
          }

          if (typeof event.end === 'object' && event.end.year) {
            end = new Date(event.end.year, event.end.month, event.end.day, event.end.hour, event.end.minute);
          } else {
            end = new Date(event.end);
          }

          return {
            id: event.id,
            title: event.title,
            start: start,
            end: end,
            extendedProps: {
              type: event.type,
              completed: event.completed,
              topic: event.topic,
              description: event.description
            },
            // Props for basic FullCalendar rendering if customContent fails
            backgroundColor: event.type === 'exam' ? '#333333' : '#1A1A1A',
            borderColor: 'transparent',
            textColor: '#FFFFFF'
          };
        });
        setEvents(formattedEvents);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPlanId, userEmail]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (info: any) => {
    const event = info.event;
    const props = event.extendedProps;

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      type: props.type,
      completed: props.completed,
      topic: props.topic,
      description: props.description
    });
  };

  const toggleEventStatus = async () => {
    if (!selectedEvent) return;

    const newCompleted = !selectedEvent.completed;

    // Optimistic Update Local State
    setSelectedEvent((prev: any) => ({ ...prev, completed: newCompleted }));
    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? {
      ...e,
      extendedProps: { ...e.extendedProps, completed: newCompleted }
    } : e));

    try {
      await updateCalendarEvent(selectedEvent.id, newCompleted, userEmail);
    } catch (err) {
      console.error('Failed to update event');
      // Revert on failure
      setSelectedEvent((prev: any) => ({ ...prev, completed: !newCompleted }));
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? {
        ...e,
        extendedProps: { ...e.extendedProps, completed: !newCompleted }
      } : e));
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const isExam = event.extendedProps.type === 'exam';
    const isCompleted = event.extendedProps.completed;

    return (
      <div className={cn(
        "w-full h-full p-1 flex flex-col gap-0.5 overflow-hidden border-l-4 transition-all hover:scale-[1.01] rounded-r-sm",
        isExam ? "bg-red-500/10 border-red-500" : "bg-brand-gray border-white/20",
        isCompleted && "opacity-60 grayscale-[0.5]"
      )}>
        <div className="flex items-start justify-between min-w-0">
          <span className={cn(
            "text-xs font-bold leading-tight break-words pr-1",
            isExam ? "text-red-300" : "text-white",
            isCompleted && "line-through text-brand-text-muted"
          )}>
            {event.title}
          </span>
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3 text-white shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-3 h-3 text-white/20 shrink-0 mt-0.5" />
          )}
        </div>
        <div className="text-[10px] text-brand-text-muted truncate mt-auto">
          {eventInfo.timeText}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-6rem)] flex flex-col bg-brand-black text-brand-text font-inter pt-28">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-white" />
            Study Planner
          </h1>
          <p className="text-brand-text-muted mt-1">
            Track your progress and stay on schedule.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/upload">
            <Button variant="outline" size="sm" className="gap-2 border-brand-gray text-brand-text-muted hover:text-black">
              <Upload className="w-4 h-4" /> New Plan
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleViewHistory} className="gap-2 border-brand-gray text-brand-text-muted hover:text-black">
            <History className="w-4 h-4" /> History
          </Button>
          <Button variant="default" size="sm" onClick={fetchEvents} disabled={loading} className="gap-2 bg-white text-black hover:bg-gray-200">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {error && events.length === 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-fade-in">
          Unable to sync calendar: {error}
        </div>
      )}

      <Card className="flex-1 bg-brand-dark border-brand-gray p-4 overflow-hidden relative shadow-none full-calendar-wrapper">
        {loading && events.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-black/50 z-10">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        ) : events.length === 0 && !loading && !error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-brand-gray/20 rounded-full flex items-center justify-center mb-6 border border-brand-gray/50">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Schedule is Empty</h2>
            <p className="text-brand-text-muted mb-8 max-w-md">
              Ready to start learning? Upload your syllabus to automatically generate a personalized study roadmap.
            </p>
            <Link to="/upload">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-gray-200">
                <Upload className="w-5 h-5" />
                Create Study Plan
              </Button>
            </Link>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={events}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            height="100%"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            scrollTime="08:00:00"
            allDaySlot={false}
            nowIndicator={true}
            dayMaxEvents={true}
          />
        )}
      </Card>

      {/* Task Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="bg-brand-black border border-brand-gray w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={cn(
              "p-6 border-b border-brand-gray",
              selectedEvent.type === 'exam' ? "bg-red-500/10" : "bg-brand-dark"
            )}>
              <div className="flex justify-between items-start gap-4">
                <h3 className={cn(
                  "text-xl font-bold leading-tight",
                  selectedEvent.type === 'exam' ? "text-red-400" : "text-white"
                )}>
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-brand-text-muted">
                <Clock className="w-4 h-4 text-white" />
                <span>
                  {selectedEvent.start && format(selectedEvent.start, 'EEEE, MMM do')} • {selectedEvent.start && format(selectedEvent.start, 'h:mm a')} - {selectedEvent.end && format(selectedEvent.end, 'h:mm a')}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {selectedEvent.topic && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-white" />
                    Topic
                  </div>
                  <p className="text-gray-300 bg-brand-gray/20 p-3 rounded-lg border border-brand-gray/50">
                    {selectedEvent.topic}
                  </p>
                </div>
              )}

              {selectedEvent.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    <AlignLeft className="w-4 h-4 text-white" />
                    Description
                  </div>
                  <p className="text-brand-text-muted leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  variant={selectedEvent.completed ? "outline" : "default"}
                  className={cn(
                    "w-full sm:w-auto gap-2 transition-all duration-300",
                    selectedEvent.completed ? "border-green-500 text-green-500 hover:bg-green-500/10" : "bg-white text-black hover:bg-gray-200"
                  )}
                  onClick={toggleEventStatus}
                >
                  {selectedEvent.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}


      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="bg-brand-black border border-brand-gray w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-brand-gray flex justify-between items-center bg-brand-dark">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-white" /> Upload History
              </h3>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-brand-black">
              {historyLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>
              ) : studyPlans.length === 0 ? (
                <div className="text-center py-10">
                  <FolderOpen className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400">No plan history found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studyPlans.map(plan => (
                    <div
                      key={plan._id}
                      onClick={() => handleLoadPlan(plan._id)}
                      className={cn(
                        "bg-brand-dark border rounded-xl p-4 transition-all group cursor-pointer relative overflow-hidden",
                        currentPlanId === plan._id
                          ? "border-white bg-brand-gray/50"
                          : "border-brand-gray hover:border-white/50"
                      )}
                    >
                      {currentPlanId === plan._id && (
                        <div className="absolute top-0 right-0 p-2">
                          <div className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                            Active
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      {plan.status && plan.status !== 'not_started' && currentPlanId !== plan._id && (
                        <div className="absolute top-0 right-0 p-2">
                          <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider",
                            plan.status === 'completed' ? "bg-green-500 text-black" : "bg-yellow-500 text-black"
                          )}>
                            {plan.status === 'completed' ? 'Done' : 'Active'}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className={cn(
                            "font-bold text-lg transition-colors",
                            currentPlanId === plan._id ? "text-white" : "text-gray-200 group-hover:text-white"
                          )}>
                            {plan.title || "Untitled Plan"}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-brand-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {format(new Date(plan.createdAt), 'MMM do, yyyy')}
                            </p>
                            {plan.daysUntilExam !== null && plan.daysUntilExam !== undefined && (
                              <p className={cn(
                                "text-xs flex items-center gap-1",
                                plan.daysUntilExam < 0 ? "text-gray-500" :
                                plan.daysUntilExam <= 3 ? "text-red-400" : 
                                plan.daysUntilExam <= 7 ? "text-yellow-400" : "text-brand-text-muted"
                              )}>
                                <CalendarIcon className="w-3 h-3" />
                                {plan.daysUntilExam < 0 ? 'Exam passed' : 
                                 plan.daysUntilExam === 0 ? 'Exam today!' : 
                                 `${plan.daysUntilExam} days left`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {plan.totalSessions > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Progress</span>
                            <span className="text-xs font-bold text-white">{plan.completedSessions}/{plan.totalSessions} sessions</span>
                          </div>
                          <div className="w-full h-1.5 bg-brand-gray rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                plan.completionRate === 100 ? "bg-green-500" : "bg-white"
                              )}
                              style={{ width: `${plan.completionRate}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-brand-black p-2 rounded-lg text-center border border-brand-gray">
                          <span className="block text-lg font-bold text-white">{plan.subjectCount}</span>
                          <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Subjects</span>
                        </div>
                        <div className="bg-brand-black p-2 rounded-lg text-center border border-brand-gray">
                          <span className="block text-lg font-bold text-white">{plan.topicCount}</span>
                          <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Topics</span>
                        </div>
                        <div className="bg-brand-black p-2 rounded-lg text-center border border-brand-gray">
                          <span className={cn(
                            "block text-lg font-bold",
                            plan.completionRate === 100 ? "text-green-400" : 
                            plan.completionRate > 50 ? "text-yellow-400" : "text-gray-400"
                          )}>{plan.completionRate}%</span>
                          <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Complete</span>
                        </div>
                        <div className="bg-brand-black p-2 rounded-lg text-center border border-brand-gray">
                          <span className={cn("block text-lg font-bold", plan.readiness > 70 ? "text-green-400" : "text-yellow-400")}>{Math.round(plan.readiness)}%</span>
                          <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Ready</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <style>{`
        .full-calendar-wrapper {
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: rgba(255, 255, 255, 0.05);
          --fc-list-event-hover-bg-color: rgba(255, 255, 255, 0.1);
          --fc-today-bg-color: rgba(255, 255, 255, 0.05);
          --fc-border-color: rgba(255, 255, 255, 0.1);
          --fc-button-bg-color: rgba(255, 255, 255, 0.05);
          --fc-button-border-color: rgba(255, 255, 255, 0.1);
          --fc-button-text-color: #A1A1AA;
          --fc-button-active-bg-color: #ffffff;
          --fc-button-active-border-color: #ffffff;
          --fc-button-active-text-color: black;
          --fc-event-bg-color: transparent;
          --fc-event-border-color: transparent;
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .fc .fc-col-header-cell-cushion {
          color: #A1A1AA;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 12px 0;
        }

        .fc .fc-timegrid-slot-label-cushion {
          color: #71717A;
          font-size: 0.75rem;
        }

        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }

        .fc-theme-standard td, .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }

        /* Remove default event styling to let custom content take over */
        .fc-v-event {
          background-color: transparent;
          border: none;
          box-shadow: none;
        }
        
        /* Buttons */
        .fc .fc-button {
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-transform: capitalize;
          transition: all 0.2s;
        }
        .fc .fc-button:focus {
          box-shadow: none;
        }
        .fc .fc-button-primary:not(:disabled):active, 
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: var(--fc-button-active-bg-color);
          border-color: var(--fc-button-active-border-color);
          color: var(--fc-button-active-text-color);
        }
      `}</style>
    </div>
  );
}
