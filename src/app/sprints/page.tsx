'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Target } from 'lucide-react';
import cn from 'classnames';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { format, addDays } from 'date-fns';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  tasks: string[]; // list of task IDs
}

export default function SprintsPage() {
  const { user } = useAuth();
  const { tasks, fetchTasks } = useTaskStore();

  // initial sprint definition without tasks
  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'sprint-1',
      name: 'Sprint 1',
      goal: 'Complete authentication and core UI',
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
      status: 'active',
      tasks: [], 
    },
  ]);

  // fetch tasks once the user is available
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // whenever `tasks` change, update each sprint's task list
  useEffect(() => {
    if (tasks.length && sprints.length) {
      setSprints((prev) =>
        prev.map((s) => ({
          ...s,
          // example: for sprint-1, include all non-todo tasks
          tasks:
            s.id === 'sprint-1'
              ? tasks.filter((t) => t.status !== 'todo').map((t) => t.id)
              : s.tasks,
        }))
      );
    }
  }, [tasks, sprints.length]);

  const getSprintTasks = (sprint: Sprint) =>
    tasks.filter((task) => sprint.tasks.includes(task.id));

  const getSprintProgress = (sprint: Sprint) => {
    const sprintTasks = getSprintTasks(sprint);
    if (!sprintTasks.length) return 0;
    const doneCount = sprintTasks.filter((t) => t.status === 'done').length;
    return Math.round((doneCount / sprintTasks.length) * 100);
  };

  const getSprintVelocity = (sprint: Sprint) =>
    getSprintTasks(sprint)
      .filter((t) => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sprints</h1>
<p className="text-gray-400">Plan and track your team&apos;s sprints</p>
      </div>

      {/* Create button */}
      <div className="mb-6">
        <Button>
          <Plus size={16} />
          Create Sprint
        </Button>
      </div>

      {/* Sprint cards */}
      <div className="grid gap-6">
        {sprints.map((sprint) => {
          const sprintTasks = getSprintTasks(sprint);
          const progress = getSprintProgress(sprint);
          const velocity = getSprintVelocity(sprint);

          return (
            <div
              key={sprint.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              {/* Title & status */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      {sprint.name}
                    </h2>
                    <p className="text-gray-400">{sprint.goal}</p>
                  </div>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      sprint.status === 'active' &&
                        'bg-green-500/20 text-green-400',
                      sprint.status === 'planning' &&
                        'bg-yellow-500/20 text-yellow-400',
                      sprint.status === 'completed' &&
                        'bg-gray-500/20 text-gray-400'
                    )}
                  >
                    {sprint.status.charAt(0).toUpperCase() +
                      sprint.status.slice(1)}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      {format(sprint.startDate, 'MMM d')} –{' '}
                      {format(sprint.endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} />
                    <span>{velocity} points completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{sprintTasks.length} tasks</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Sprint Progress
                  </span>
                  <span className="text-sm font-medium text-white">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Task summary */}
              <div className="grid grid-cols-4 gap-4 text-center">
                {([
                  ['todo', 'To Do'],
                  ['inProgress', 'In Progress'],
                  ['review', 'In Review'],
                  ['done', 'Done'],
                ] as const).map(([statusKey, label]) => (
                  <div
                    key={statusKey}
                    className="bg-gray-800 rounded-lg p-3"
                  >
                    <div className="text-2xl font-bold text-white">
                      {
                        sprintTasks.filter(
                          (t) => t.status === statusKey
                        ).length
                      }
                    </div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="secondary">
                  View Sprint Board
                </Button>
                <Button variant="secondary">
                  Sprint Report
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
