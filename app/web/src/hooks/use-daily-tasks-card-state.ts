import { useEffect, useMemo, useState } from 'react';

type DailyTask = {
  rank: string;
  title: string;
  done?: boolean;
};

export function useDailyTasksCardState(inputTasks: DailyTask[]) {
  const normalizedInput = useMemo(() => inputTasks ?? [], [inputTasks]);
  const [tasks, setTasks] = useState<DailyTask[]>(() => normalizedInput);

  useEffect(() => {
    setTasks(normalizedInput);
  }, [normalizedInput]);

  return {
    data: {
      tasks,
    },
    actions: {
      toggleDone: (index: number) => {
        setTasks((prev) => prev.map((task, i) => (i === index ? { ...task, done: !task.done } : task)));
      },
    },
  };
}

