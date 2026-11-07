import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Alert, Button, Flex, Result, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/http';
import type { Task } from '../api/types';
import BoardColumn from '../components/BoardColumn';
import TaskCard from '../components/TaskCard';
import { useBoard } from '../hooks/useBoards';
import { useBoardTasks, useMoveTask } from '../hooks/useTasks';
import TaskDrawer from '../components/TaskDrawer';
import CreateTaskModal from '../components/CreateTaskModal';
import { useMe } from '../hooks/useMe';
import { isAdmin } from '../utils/permissions';

export default function BoardPage() {
  const { boardId = '' } = useParams<{ boardId: string }>();
  const boardQuery = useBoard(boardId);
  const tasksQuery = useBoardTasks(boardId);
  const moveTask = useMoveTask(boardId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [skipDropAnimation, setSkipDropAnimation] = useState(false);
  // Открытая задача хранится в адресе (?task=id): обновление страницы её не закрывает
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTaskId = searchParams.get('task');

  // Перетаскивание начинается после смещения на 8px: так обычный клик по карточке
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: user } = useMe();
  const admin = isAdmin(user);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const error = boardQuery.error ?? tasksQuery.error;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <Result
        status="404"
        title="Доска не найдена"
        extra={
          <Link to="/">
            <Button type="primary">К доскам</Button>
          </Link>
        }
      />
    );
  }

  if (error) return <Alert type="error" showIcon title={error.message} />;
  if (!boardQuery.data || !tasksQuery.data) return <Skeleton active />;

  const { board, statuses } = boardQuery.data;
  const tasks = tasksQuery.data;
  const columns = [...statuses].sort((a, b) => a.order - b.order);
  // Если задачи с таким id нет в списке (удалена, чужая, опечатка в адресе), панель просто не открывается
  const selectedTask = tasks.find((task) => task._id === selectedTaskId) ?? null;
  // Открываем с новой записью в истории, чтобы «Назад» закрывал панель;
  // закрываем с заменой записи, иначе «Назад» открывал бы её снова.
  const openTask = (taskId: string) => setSearchParams({ task: taskId });
  const closeTask = () => setSearchParams({}, { replace: true });

  // Раскладываем задачи по статусам один раз, а не фильтруем для каждой колонки
  const tasksByStatus = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = tasksByStatus.get(task.statusId) ?? [];
    list.push(task);
    tasksByStatus.set(task.statusId, list);
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((task) => task._id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const task = tasks.find((t) => t._id === active.id);
    const statusId = over ? String(over.id) : null;
    const isMoved = task !== undefined && statusId !== null && task.statusId !== statusId;

    // Карточка сменила колонку: копию просто убираем, оригинал уже в новой колонке.
    // Иначе копия вернётся на старое место: там её и ждёт анимация.
    setSkipDropAnimation(isMoved);
    setActiveTask(null);

    if (isMoved) moveTask.mutate({ taskId: task._id, statusId });
  };

  const handleDragCancel = () => {
    setSkipDropAnimation(false);
    setActiveTask(null);
  };

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={12}>
          <Link to="/">← Доски</Link>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {board.title}
          </Typography.Title>
        </Flex>
        {admin && (
          <Button type="primary" onClick={() => setTaskModalOpen(true)}>
            Новая задача
          </Button>
        )}
      </Flex>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Flex gap={16} align="flex-start" style={{ overflowX: 'auto', paddingBottom: 8 }}>
          {columns.map((status) => (
            <BoardColumn
              key={status._id}
              status={status}
              tasks={tasksByStatus.get(status._id) ?? []}
              onTaskClick={openTask}
            />
          ))}
        </Flex>

        {/* Копия карточки, которая следует за курсором */}
        <DragOverlay dropAnimation={skipDropAnimation ? null : undefined}>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
      <TaskDrawer task={selectedTask} statuses={columns} onClose={closeTask} />
      {admin && (
        <CreateTaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          boardId={boardId}
          statuses={columns}
        />
      )}
    </>
  );
}