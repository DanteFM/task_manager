import { Alert, Form, Input, Modal, Select, Divider } from 'antd';
import type { Priority, Status, Task } from '../api/types';
import { PRIORITY_META } from '../constants/priorities';
import { useTags } from '../hooks/useTags';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useExecutors } from '../hooks/useUsers';
import { userLabel } from '../utils/userName';
import NewTagInput from './NewTagInput';
import { useState } from 'react';

interface Props {
  onClose: () => void;
  boardId: string;
  statuses: Status[];
  task?: Task; 
}

interface FormValues {
  title: string;
  description?: string;
  priority: Priority;
  statusId: string;
  assigneeId?: string;
  tags?: string[];
}

const PRIORITY_OPTIONS = (Object.keys(PRIORITY_META) as Priority[]).map((value) => ({
  value,
  label: PRIORITY_META[value].label,
}));

export default function CreateTaskModal({ onClose, boardId, statuses, task }: Props) {
  const isEdit = task !== undefined;
  const [form] = Form.useForm<FormValues>();
  const create = useCreateTask(boardId);
  const update = useUpdateTask(boardId);
  const save = isEdit ? update : create;
  // Списки грузятся только пока форма открыта
  const executors = useExecutors(true);
  const tags = useTags(true);
  const [tagsOpenCount, setTagsOpenCount] = useState(0);

  const initialValues: Partial<FormValues> = task
    ? {
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeId: task.assigneeId ?? undefined,
        tags: task.tags.map((tag) => tag._id),
      }
    : // По умолчанию: средний приоритет и первая колонка (как и на сервере)
      { priority: 'medium', statusId: statuses[0]?._id };

  const handleFinish = (values: FormValues) => {
    const title = values.title.trim();
    const description = values.description?.trim() ?? '';

    if (task) {
      update.mutate(
        {
          taskId: task._id,
          data: {
            title,
            ...(description !== (task.description ?? '') && { description }),
            priority: values.priority,
            assigneeId: values.assigneeId ?? null,
            tags: values.tags ?? [],
          },
        },
        { onSuccess: onClose },
      );
      return;
    }

    create.mutate(
      {
        title,
        description: description || undefined,
        priority: values.priority,
        statusId: values.statusId,
        assigneeId: values.assigneeId, // undefined: исполнитель не выбран
        tags: values.tags ?? [],
      },
      { onSuccess: onClose },
    );
  };

  const listsError = executors.error ?? tags.error;

  return (
    <Modal
      title={isEdit ? 'Редактирование задачи' : 'Новая задача'}
      open
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      {save.error && <Alert type="error" showIcon message={save.error.message} style={{ marginBottom: 16 }} />}
      {listsError && (
        <Alert type="warning" showIcon message="Не удалось загрузить исполнителей или теги" style={{ marginBottom: 16 }} />
      )}

      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Form.Item name="title" label="Название" rules={[{ required: true, whitespace: true, message: 'Введите название' }]}>
          <Input autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item name="priority" label="Приоритет">
          <Select options={PRIORITY_OPTIONS} />
        </Form.Item>

        {!isEdit && (
          <Form.Item name="statusId" label="Колонка">
            <Select options={statuses.map((status) => ({ value: status._id, label: status.title }))} />
          </Form.Item>)
        }

        <Form.Item name="assigneeId" label="Исполнитель">
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label"}}
            placeholder="Не назначен"
            loading={executors.isPending}
            options={executors.data?.map((user) => ({ value: user.id, label: userLabel(user) }))}
          />
        </Form.Item>

        <Form.Item name="tags" label="Теги">
          <Select
            mode="multiple"
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            placeholder="Без тегов"
            loading={tags.isPending}
            options={tags.data?.map((tag) => ({ value: tag._id, label: tag.name }))}
            onOpenChange={(open) => open && setTagsOpenCount((count) => count + 1)}
            popupRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <NewTagInput
                  key={tagsOpenCount}
                  onCreated={(tag) => form.setFieldValue('tags', [...(form.getFieldValue('tags') ?? []), tag._id])}
                />
              </>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}