import { Button, Flex, Input, Typography } from 'antd';
import { useState } from 'react';
import type { Tag } from '../api/types';
import { useCreateTag } from '../hooks/useTags';

export default function NewTagInput({ onCreated }: { onCreated: (tag: Tag) => void }) {
  const [name, setName] = useState('');
  const create = useCreateTag();

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(trimmed, {
      onSuccess: (tag) => {
        setName('');
        onCreated(tag);
      },
    });
  };

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Flex gap={8}>
        <Input
          placeholder="Новый тег"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            create.reset();
          }}
          onPressEnter={submit}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <Button onClick={submit} loading={create.isPending}>
          Создать
        </Button>
      </Flex>
      {create.error && <Typography.Text type="danger">{create.error.message}</Typography.Text>}
    </div>
  );
}