import React, { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import type { PrepTask } from '../types';
import { Loader2 } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Button, Card, PageHeader, Badge } from '../components/ui';

const PrepList: React.FC = () => {
  const [tasks, setTasks] = useState<PrepTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const fetchTasks = async () => {
    try {
      const records = await pb.collection('prep_tasks').getFullList<PrepTask>({
        expand: 'meal_plan.meal',
        sort: 'due_date',
      });
      setTasks(records);
    } catch (error) {
      console.error('Failed to fetch prep tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchTasks();
    };
    init();
    
    const unsubscribe = pb.collection('prep_tasks').subscribe('*', fetchTasks);
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, []);

  const toggleComplete = async (task: PrepTask) => {
    try {
      await pb.collection('prep_tasks').update(task.id, {
        completed: !task.completed,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskDescription.trim()) return;
    try {
      await pb.collection('prep_tasks').create({
        description: newTaskDescription.trim(),
        completed: false,
        due_date: new Date().toISOString(),
      });
      setNewTaskDescription('');
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const todayTasks = tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)));
  const tomorrowTasks = tasks.filter(t => t.due_date && isTomorrow(parseISO(t.due_date)));
  const otherTasks = tasks.filter(t => !t.due_date || (!isToday(parseISO(t.due_date)) && !isTomorrow(parseISO(t.due_date))));

  const completedCount = tasks.filter(t => t.completed && t.due_date && isToday(parseISO(t.due_date))).length;
  const todayTotal = todayTasks.length;
  const progressPercent = todayTotal > 0 ? (completedCount / todayTotal) * 100 : 0;

  return (
    <div className="space-y-lg">
      <PageHeader 
        title="Prep List" 
        description="Stay ahead of your week." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-8 space-y-lg">
          {/* Quick Add Section */}
          <Card className="p-md">
            <div className="flex flex-col md:flex-row gap-base items-center">
              <div className="relative flex-1 w-full">
                <input 
                  className="w-full bg-surface border border-outline-variant rounded-lg px-md py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline transition-all" 
                  placeholder="What needs prepping? (e.g., Wash kale)" 
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
              </div>
              <Button 
                onClick={addTask}
                className="w-full md:w-auto flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined">add</span>
                Add Prep Task
              </Button>
            </div>
          </Card>

          {/* Tasks by Priority/Day */}
          <section>
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Upcoming Tasks</h2>
              <div className="flex gap-xs">
                <Button variant="tonal" size="sm">Active</Button>
                <Button variant="ghost" size="sm">Completed</Button>
              </div>
            </div>

            <div className="space-y-md">
              {/* Group: Today */}
              {todayTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-base mb-sm px-base">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">Today</span>
                  </div>
                  <div className="space-y-base">
                    {todayTasks.map(task => (
                      <Card key={task.id} className={`p-md flex items-center gap-md border-l-4 border-l-secondary ${task.completed ? 'opacity-60' : ''}`} hoverable>
                        <input 
                          className="w-6 h-6 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleComplete(task)}
                        />
                        <div className="flex-1">
                          <h3 className={`font-label-md text-label-md text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.description}</h3>
                          {task.expand?.meal_plan?.expand?.meal && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{task.expand.meal_plan.expand.meal.name}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Tomorrow */}
              {tomorrowTasks.length > 0 && (
                <div className="pt-md">
                  <div className="flex items-center gap-base mb-sm px-base">
                    <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Tomorrow</span>
                  </div>
                  <div className="space-y-base">
                    {tomorrowTasks.map(task => (
                      <Card key={task.id} className={`p-md flex items-center gap-md border-l-4 border-l-outline-variant ${task.completed ? 'opacity-60' : ''}`} hoverable>
                        <input 
                          className="w-6 h-6 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleComplete(task)}
                        />
                        <div className="flex-1">
                          <h3 className={`font-label-md text-label-md text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.description}</h3>
                          {task.expand?.meal_plan?.expand?.meal && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{task.expand.meal_plan.expand.meal.name}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Other */}
              {otherTasks.length > 0 && (
                <div className="pt-md">
                  <div className="flex items-center gap-base mb-sm px-base">
                    <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Upcoming</span>
                  </div>
                  <div className="space-y-base">
                    {otherTasks.map(task => (
                      <Card key={task.id} className={`p-md flex items-center gap-md border-l-4 border-l-outline-variant ${task.completed ? 'opacity-60' : ''}`} hoverable>
                        <input 
                          className="w-6 h-6 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleComplete(task)}
                        />
                        <div className="flex-1">
                          <h3 className={`font-label-md text-label-md text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.description}</h3>
                          <div className="flex gap-2">
                            {task.due_date && (
                              <p className="font-body-sm text-body-sm text-primary">{format(parseISO(task.due_date), 'MMM d')}</p>
                            )}
                            {task.expand?.meal_plan?.expand?.meal && (
                              <p className="font-body-sm text-body-sm text-on-surface-variant">{task.expand.meal_plan.expand.meal.name}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="text-center py-xl bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
                  <p className="text-on-surface-variant font-body-lg">No prep tasks found. Add one above!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar / Insights */}
        <div className="lg:col-span-4 space-y-lg">
          {/* Progress Card */}
          <section className="bg-tertiary-fixed-dim/20 p-md rounded-xl border border-tertiary-fixed">
            <h3 className="font-headline-sm text-headline-sm text-tertiary mb-sm">Preparation Progress</h3>
            <div className="space-y-md">
              <div className="flex items-center justify-between font-label-md text-label-md">
                <span>Today's Completion</span>
                <span>{completedCount}/{todayTotal} Tasks</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant italic">
                {progressPercent === 100 ? "You're all caught up for today!" : progressPercent > 50 ? "You're more than halfway there!" : "Keep it up, you've got this!"}
              </p>
            </div>
          </section>

          {/* Visual Inspiration */}
          <Card className="overflow-hidden">
            <img 
              alt="Fresh chopped vegetables" 
              className="w-full h-48 object-cover" 
              src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=400"
            />
            <div className="p-md">
              <h4 className="font-label-md text-label-md text-on-surface mb-xs">Pro-Tip</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Pre-chopping vegetables on Sundays can save you up to 3 hours of kitchen time during the work week.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrepList;
