import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, ScrapeTask, tasksApi } from '../api/client';

const POLLING_STATUSES: ScrapeTask['status'][] = ['queued', 'running'];
const POLL_INTERVAL_MS = 5000;

interface UseTasksResult {
  tasks: ScrapeTask[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<ScrapeTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list();
      if (!mountedRef.current) return;

      setTasks(data);
      setError(null);

      const hasActiveTasks = data.some((task) => POLLING_STATUSES.includes(task.status));
      clearTimer();

      if (hasActiveTasks) {
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            void fetchTasks();
          }
        }, POLL_INTERVAL_MS);
      }
    } catch (error) {
      if (!mountedRef.current) return;

      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to load tasks',
      );

      clearTimer();
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          void fetchTasks();
        }
      }, POLL_INTERVAL_MS);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    clearTimer();
    setIsLoading(true);
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchTasks();

    return () => {
      mountedRef.current = false;
      clearTimer();
    };
  }, [fetchTasks]);

  return { tasks, isLoading, error, refresh };
}
