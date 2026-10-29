import { Alert, Button, Flex, Result, Skeleton, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/http';
import type { Task } from '../api/types';
import BoardColumn from '../components/BoardColumn';
import { useBoard } from '../hooks/useBoards';
import { useBoardTasks } from '../hooks/useTasks';

export default function BoardPage() {
  const { boardId = '' } = useParams<{ boardId: string }>();
  const boardQuery = useBoard(boardId);
  const tasksQuery = useBoardTasks(boardId);

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

  if (error) return <Alert type='error' showIcon title={error.message}/>;
  if (!boardQuery.data || !tasksQuery.data) return <Skeleton active />;

  const { board, statuses } = boardQuery.data;
  const columns = [...statuses].sort((a, b) => a.order - b.order);

  const tasksByStatus = new Map<string, Task[]>(); // задачи по статусам один раз, а не фильтруем для каждой колонки
  for (const task of tasksQuery.data) {
    const list = tasksByStatus.get(task.statusId) ?? [];
    list.push(task);
    tasksByStatus.set(task.statusId, list);
  }

  return (
    <>
      <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
        <Link to="/">← Доски</Link>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {board.title}
        </Typography.Title>
      </Flex>

      <Flex gap={16} align="flex-start" style={{ overflowX: 'auto', paddingBottom: 8 }}>
        {columns.map((status) => (
          <BoardColumn key={status._id} status={status} tasks={tasksByStatus.get(status._id) ?? []} />
        ))}
      </Flex>
    </>
  );
}