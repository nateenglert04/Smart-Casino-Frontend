import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CourseService, type CourseDetails, type Lesson } from '../../services/CourseService';
import { useGamification } from '../../contexts/GamificationContext';

export default function LessonViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { refreshRank } = useGamification();
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        const data = await CourseService.getCourseById(courseId);
        setCourse(data);
        
        // Find first incomplete lesson or default to first
        const firstIncomplete = data.lessons.find(l => !l.isCompleted) || data.lessons[0];
        setActiveLesson(firstIncomplete);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  const handleComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      await CourseService.completeLesson(activeLesson.id);
      
      // Update local state
      setCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lessons: prev.lessons.map(l => 
            l.id === activeLesson.id ? { ...l, isCompleted: true } : l
          )
        };
      });
      setActiveLesson(prev => prev ? { ...prev, isCompleted: true } : null);
      
      refreshRank(); // Update global XP

      // Auto-advance logic could go here
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleNext = () => {
    if (!course || !activeLesson) return;
    const currentIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      setActiveLesson(course.lessons[currentIndex + 1]);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Course...</div>;
  if (!course || !activeLesson) return <div className="p-10 text-center">Course not found</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar - Lesson List */}
      <Card className="w-80 flex flex-col h-full border-sidebar-border bg-card/50 backdrop-blur-sm md:flex">
        <CardHeader className="pb-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => navigate('/lessons')} className="w-fit mb-2 -ml-2 text-muted-foreground">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <CardDescription className="text-xs">{course.lessons.filter(l => l.isCompleted).length}/{course.lessons.length} Completed</CardDescription>
        </CardHeader>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {course.lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className={`w-full text-left px-3 py-3 rounded-md text-sm flex items-center justify-between transition-colors
                ${activeLesson.id === lesson.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-muted text-muted-foreground'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-50 font-mono w-4">{idx + 1}</span>
                <span className="truncate max-w-[140px]">{lesson.title}</span>
              </div>
              {lesson.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content - Lesson Viewer */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden border-sidebar-primary/20 shadow-xl">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2">Lesson {course.lessons.findIndex(l => l.id === activeLesson.id) + 1}</Badge>
              <CardTitle className="text-2xl">{activeLesson.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
              <Trophy className="w-3 h-3" /> +{activeLesson.xpReward} XP
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
        </CardContent>

        <div className="p-6 border-t bg-muted/20 flex justify-between items-center">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Difficulty: {Array(activeLesson.difficulty).fill('★').join('')}
          </span>

          <div className="flex gap-3 ml-auto">
             {!activeLesson.isCompleted ? (
               <Button onClick={handleComplete} disabled={completing} className="bg-primary hover:bg-primary/90 text-white font-bold min-w-[140px]">
                 {completing ? 'Completing...' : 'Mark Complete'}
               </Button>
             ) : (
               <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 cursor-default">
                 <CheckCircle className="w-4 h-4 mr-2" /> Completed
               </Button>
             )}
             
             {course.lessons.findIndex(l => l.id === activeLesson.id) < course.lessons.length - 1 && (
                <Button variant="ghost" onClick={handleNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
             )}
          </div>
        </div>
      </Card>
    </div>
  );
}
