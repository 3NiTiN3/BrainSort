'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTaskStore } from '@/hooks/useTaskStore';
import { Priority, Status } from '@/lib/types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: Status;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultStatus = 'todo',
}: CreateTaskModalProps) {
  const addTask = useTaskStore((state) => state.addTask);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: defaultStatus as Status,
    labels: '',
    storyPoints: '',
    assigneeId: '',
  });

  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      // reset status and assignee when opening
      setFormData((prev) => ({
        ...prev,
        status: defaultStatus,
        assigneeId: '',
      }));
      
      // fetch team members
      const fetchTeamMembers = async () => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (data) {
          setTeamMembers(
            data.map((profile) => ({
              id: profile.id,
              name: profile.name || profile.email,
              email: profile.email,
              avatar: profile.avatar_url,
            }))
          );
        } else {
          console.error('Error fetching team members:', error);
        }
      };

      fetchTeamMembers();
    }
  }, [isOpen, defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask = {
      id: `BS-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      labels: formData.labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      storyPoints: formData.storyPoints
        ? parseInt(formData.storyPoints, 10)
        : undefined,
      assigneeId: formData.assigneeId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system', // replace with actual user if available
    };

    addTask(newTask);
    onClose();
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: defaultStatus,
      labels: '',
      storyPoints: '',
      assigneeId: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Task Title
            </label>
            <Input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the task in detail"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-y"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Priority
              </label>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as Priority,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Status,
                  })
                }
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </Select>
            </div>
          </div>

          {/* Labels & Story Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Labels (comma separated)
              </label>
              <Input
                value={formData.labels}
                onChange={(e) =>
                  setFormData({ ...formData, labels: e.target.value })
                }
                placeholder="bug, frontend, urgent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Story Points
              </label>
              <Input
                type="number"
                min="1"
                max="21"
                value={formData.storyPoints}
                onChange={(e) =>
                  setFormData({ ...formData, storyPoints: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assignee
            </label>
            <Select
              value={formData.assigneeId}
              onChange={(e) =>
                setFormData({ ...formData, assigneeId: e.target.value })
              }
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
