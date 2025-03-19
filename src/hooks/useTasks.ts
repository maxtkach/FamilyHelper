import { useState, useCallback } from 'react';
import { Task } from '../types';
import { generateId } from '../utils';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }, []);

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((task) => task.id === taskId),
    [tasks]
  );

  const getTasksByStatus = useCallback(
    (status: Task['status']) => tasks.filter((task) => task.status === status),
    [tasks]
  );

  const getTasksByAssignee = useCallback(
    (userId: string) => tasks.filter((task) => task.assignedTo.includes(userId)),
    [tasks]
  );

  const moveTask = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      updateTask(taskId, { status: newStatus });
    },
    [updateTask]
  );

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByStatus,
    getTasksByAssignee,
    moveTask,
  };
}; 