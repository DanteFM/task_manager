import { Flex, theme, Typography } from 'antd';
import type { Status, Task } from '../api/types';
import TaskCard from './TaskCard';

interface Props {
  status: Status;
  tasks: Task[];
}

export default function BoardColumn({ status, tasks }: Props) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        flex: '0 0 300px',
        background: token.colorFillQuaternary,
        borderRadius: token.borderRadiusLG,
        padding: 12,
      }}
    >
      <Flex justify="space-between" style={{ marginBottom: 12 }}>
        <Typography.Text strong>{status.title}</Typography.Text>
        <Typography.Text type="secondary">{tasks.length}</Typography.Text>
      </Flex>

      <Flex vertical gap={8}>
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
        {tasks.length === 0 && <Typography.Text type="secondary">Нет задач</Typography.Text>}
      </Flex>
    </div>
  );
}