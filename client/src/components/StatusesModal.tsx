import { Button, Flex, Input, Modal, Popconfirm, Typography } from 'antd';
import { useState } from 'react';
import type { Status } from '../api/types';
import { useAddStatus, useDeleteStatus, useRenameStatus } from '../hooks/useStatuses';

interface Props {
  boardId: string;
  statuses: Status[];
  onClose: () => void;
}

export default function StatusesModal({ boardId, statuses, onClose }: Props) {
  const [title, setTitle] = useState('');
  const add = useAddStatus(boardId);
  const rename = useRenameStatus(boardId);
  const remove = useDeleteStatus(boardId);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    add.mutate(trimmed, { onSuccess: () => setTitle('') });
  };

  return (
    <Modal title="Колонки доски" open footer={null} onCancel={onClose}>
      <Flex vertical gap={8}>
        {statuses.map((status) => (
          <Flex key={status._id} justify="space-between" align="center">
            <Typography.Text
              editable={{
                tooltip: 'Переименовать',
                onChange: (value) => {
                  const trimmed = value.trim();
                  if (trimmed && trimmed !== status.title) {
                    rename.mutate({ statusId: status._id, title: trimmed });
                  }
                },
              }}
            >
              {status.title}
            </Typography.Text>

            <Popconfirm
              title={`Удалить колонку «${status.title}»?`}
              description="Колонку можно удалить, только если в ней нет задач"
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true }}
              onConfirm={() => remove.mutate(status._id)}
            >
              <Button type="text" danger>
                Удалить
              </Button>
            </Popconfirm>
          </Flex>
        ))}
      </Flex>

      <Flex gap={8} style={{ marginTop: 16 }}>
        <Input
          placeholder="Новая колонка"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button type="primary" onClick={handleAdd} loading={add.isPending}>
          Добавить
        </Button>
      </Flex>
    </Modal>
  );
}