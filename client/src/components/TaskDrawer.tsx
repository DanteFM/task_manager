import { Descriptions, Drawer, Flex, Tag, Typography, Button, Popconfirm, Space } from 'antd';
import { useState } from 'react';
import type { Status, Task } from '../api/types';
import { PRIORITY_META } from '../constants/priorities';
import { useMe } from '../hooks/useMe';

interface Props {
  task: Task | null;
  statuses: Status[];
  onClose: () => void;
  canManage: boolean; // admin: показываем «Редактировать» и «Удалить»
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString("ru-RU");

export default function TaskDrawer({ task, statuses, onClose, canManage, onEdit, onDelete, deleting }: Props) {
  const { data: user } = useMe();
  const [lastTask, setLastTask] = useState<Task | null>(task);
  if (task && task !== lastTask) setLastTask(task);
  const view = task ?? lastTask;

    return (
    <Drawer
      open={task !== null}
      onClose={onClose}
      title={view?.title}
      size={480}
      extra={
        canManage && (
          <Space>
            <Button onClick={onEdit}>Редактировать</Button>
            <Popconfirm
              title="Удалить задачу?"
              description="Действие нельзя отменить"
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true }}
              onConfirm={onDelete}
            >
              <Button danger loading={deleting}>
                Удалить
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    >
      {view && (
        <>
          <Descriptions
            column={1}
            size="small"
            items={[
              {
                key: 'status',
                label: 'Статус',
                children: statuses.find((s) => s._id === view.statusId)?.title ?? '—',
              },
              {
                key: 'priority',
                label: 'Приоритет',
                children: (
                  <Tag color={PRIORITY_META[view.priority].color} style={{ margin: 0 }}>
                    {PRIORITY_META[view.priority].label}
                  </Tag>
                ),
              },
              {
                key: 'assignee',
                label: 'Исполнитель',
                // Имя появится, когда у клиента будет список пользователей
                children: !view.assigneeId ? 'Не назначен' : view.assigneeId === user?.id ? 'Вы' : 'Назначен',
              },
              {
                key: 'tags',
                label: 'Теги',
                children:
                  view.tags.length > 0 ? (
                    <Flex wrap gap={4}>
                      {view.tags.map((tag) => (
                        <Tag key={tag._id} style={{ margin: 0 }}>
                          {tag.name}
                        </Tag>
                      ))}
                    </Flex>
                  ) : (
                    '—'
                  ),
              },
              { key: 'created', label: 'Создана', children: formatDate(view.createdAt) },
              { key: 'updated', label: 'Изменена', children: formatDate(view.updatedAt) },
            ]}
          />

          <Typography.Title level={5}>Описание</Typography.Title>
          {view.description ? (
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{view.description}</Typography.Paragraph>
          ) : (
            <Typography.Text type="secondary">Описания нет</Typography.Text>
          )}
        </>
      )}
    </Drawer>
  );
}