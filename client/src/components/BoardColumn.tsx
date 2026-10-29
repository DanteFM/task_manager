import { useDroppable } from '@dnd-kit/core';
import { Flex, theme, Typography } from 'antd';
import type { Status, Task } from '../api/types';
import DraggableTaskCard from './DraggableTaskCard';

interface Props {
  status: Status;
  tasks: Task[];
}

export default function BoardColumn({ status, tasks }: Props) {
  const { token } = theme.useToken();
  // Колонка принимает карточки; id колонки равен id статуса
  const { setNodeRef, isOver } = useDroppable({ id: status._id });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: '0 0 300px',
        minHeight: 120,
        background: token.colorFillQuaternary,
        borderRadius: token.borderRadiusLG,
        padding: 12,
        margin: 5,
        outline: isOver ? `2px dashed ${token.colorPrimary}` : 'none',
      }}
    >
      <Flex justify="space-between" style={{ marginBottom: 12 }}>
        <Typography.Text strong>{status.title}</Typography.Text>
        <Typography.Text type="secondary">{tasks.length}</Typography.Text>
      </Flex>

      <Flex vertical gap={8}>
        {tasks.map((task) => (
          <DraggableTaskCard key={task._id} task={task} />
        ))}
        {tasks.length === 0 && <Typography.Text type="secondary">Нет задач</Typography.Text>}
      </Flex>
    </div>
  );
}