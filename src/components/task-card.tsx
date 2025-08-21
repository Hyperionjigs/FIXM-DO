
"use client";
import { Home, Truck, BookOpen, Calendar, ArrowUpRight, Sparkles, MoreVertical, Flag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Task, TaskCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getPHPSymbol } from '@/lib/currency-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ReportDialog } from './report-dialog';

const categoryIcons: Record<TaskCategory, React.ElementType> = {
  'Home Services': Home,
  'Delivery': Truck,
  'Tutoring': BookOpen,
  'Events': Calendar,
  'Other': Sparkles, 
};

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const Icon = categoryIcons[task.category] || Sparkles;
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
        case 'open': return 'secondary';
        case 'claimed': return 'default';
        case 'completed': return 'outline';
        default: return 'secondary';
    }
  }

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportDialogOpen(true);
  };

  return (
    <div className="flex">
      <Card className="flex flex-col w-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={task.type === 'task' ? 'destructive' : 'secondary'}>
                  {task.type === 'task' ? 'Task' : 'Service'}
                </Badge>
                <Badge variant="outline">{task.category}</Badge>
                 {task.status && <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">{task.status}</Badge>}
              </div>
              <CardTitle className="font-headline text-xl">{task.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/20 p-2 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleReportClick}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>{task.location}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-2">{task.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">{getPHPSymbol()}{task.pay.toLocaleString()}</p>
          <Button variant="outline" asChild>
            <Link href={`/post/${task.id}`}>
              View <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportedTaskId={task.id}
        reportedTaskTitle={task.title}
      />
    </div>
  );
}
