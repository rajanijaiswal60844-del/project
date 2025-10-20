
'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasks } from '@/context/TasksContext';
import type { StudyTask } from '@/lib/data';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  color: z.string(),
}).refine(data => data.startTime < data.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingTask?: StudyTask | null;
}

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(210 40% 96.1%)',
  '#84cc16',
  '#f97316',
  '#06b6d4',
  '#d946ef',
];

export default function AddTaskDialog({ isOpen, setIsOpen, existingTask }: AddTaskDialogProps) {
  const { addTask, updateTask } = useTasks();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      startTime: '09:00',
      endTime: '10:00',
      color: colors[0],
    }
  });

  useEffect(() => {
    if (existingTask) {
        reset({
            name: existingTask.name,
            startTime: existingTask.startTime,
            endTime: existingTask.endTime,
            color: existingTask.color,
        });
    } else {
        reset({
            name: '',
            startTime: '09:00',
            endTime: '10:00',
            color: colors[0],
        });
    }
  }, [existingTask, reset, isOpen]);

  const onSubmit = (data: TaskFormData) => {
    if (existingTask) {
        updateTask({ ...existingTask, ...data });
    } else {
        const newTask: StudyTask = {
            id: `task-${Date.now()}`,
            ...data,
        };
        addTask(newTask);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingTask ? 'Edit Task' : 'Add a New Task'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new task to your study plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" {...register('startTime')} />
               {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" {...register('endTime')} />
              {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
                name="color"
                control={control}
                render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                        {colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => field.onChange(color)}
                                className={`w-8 h-8 rounded-full border-2 ${field.value === color ? 'border-ring' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            />
          </div>
          <DialogFooter>
            <Button type="submit">{existingTask ? 'Save Changes' : 'Add Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
