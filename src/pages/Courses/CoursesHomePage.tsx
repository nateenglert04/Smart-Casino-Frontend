import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CourseService, type Course } from '../../services/CourseService';

export default function CoursesHomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await CourseService.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 fade-in-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Academy</h2>
        <p className="text-muted-foreground">Master the games. Earn XP. Level up your strategy.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="group relative overflow-hidden border-sidebar-primary/20 hover:border-sidebar-primary transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 bg-felt-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="font-mono">
                  {course.totalXp} XP
                </Badge>
              </div>
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(course.progressPercent)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                   <CheckCircle2 className="w-3 h-3" />
                   {course.completedLessons} / {course.totalLessons} Lessons
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full font-bold group-hover:translate-x-1 transition-transform">
                <Link to={`/lessons/${course.id}`}>
                  {course.progressPercent > 0 ? 'Continue' : 'Start Course'} <PlayCircle className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
