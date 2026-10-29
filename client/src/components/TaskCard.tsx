import { Card, Flex, Tag, Typography } from 'antd';
import type { Task } from '../api/types';
import { PRIORITY_META } from '../constants/priorities';

export default function TaskCard({ task }: { task: Task }) {
  const priority = PRIORITY_META[task.priority];

  return (
    <Card size="small">
      <Flex justify="space-between" align="start" gap={8}>
        <Typography.Text strong>{task.title}</Typography.Text>
        <Tag color={priority.color} style={{ margin: 0 }}>
          {priority.label}
        </Tag>
      </Flex>

      {task.description && (
        <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '8px 0 0' }}>
          {task.description}
        </Typography.Paragraph>
      )}

      {task.tags.length > 0 && (
        <Flex wrap gap={4} style={{ marginTop: 8 }}>
          {task.tags.map((tag) => (
            <Tag key={tag._id} style={{ margin: 0 }}>
              {tag.name}
            </Tag>
          ))}
        </Flex>
      )}
    </Card>
  );
}