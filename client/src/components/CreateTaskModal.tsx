import { Alert, Form, Input, Modal, Select } from 'antd';
import type { Priority, Status } from '../api/types';
import { PRIORITY_META } from '../constants/priorities';
import { useTags } from '../hooks/useTags';
import { useCreateTask } from '../hooks/useTasks';
import { useExecutors } from '../hooks/useUsers';
import { userLabel } from '../utils/userName';

interface Props {
  open: boolean;
  onClose: () => void;
  boardId: string;
  statuses: Status[];
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

export default function CreateTaskModal({ open, onClose, boardId, statuses }: Props) {
  const [form] = Form.useForm<FormValues>();
  const create = useCreateTask(boardId);
  // Списки грузятся только пока форма открыта
  const executors = useExecutors(open);
  const tags = useTags(open);

  // Закрытие с очисткой: введённое и ошибка не должны переходить в следующее открытие
  const close = () => {
    form.resetFields();
    create.reset();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    create.mutate(
      {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        priority: values.priority,
        statusId: values.statusId,
        assigneeId: values.assigneeId, // undefined: исполнитель не выбран
        tags: values.tags ?? [],
      },
      { onSuccess: close },
    );
  };

  const listsError = executors.error ?? tags.error;

  return (
    <Modal
      title="Новая задача"
      open={open}
      okText="Создать"
      cancelText="Отмена"
      confirmLoading={create.isPending}
      onOk={() => form.submit()}
      onCancel={close}
    >
      {create.error && <Alert type="error" showIcon message={create.error.message} style={{ marginBottom: 16 }} />}
      {listsError && (
        <Alert type="warning" showIcon message="Не удалось загрузить исполнителей или теги" style={{ marginBottom: 16 }} />
      )}

      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        // По умолчанию: средний приоритет и первая колонка (как и на сервере)
        initialValues={{ priority: 'medium', statusId: statuses[0]?._id }}
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

        <Form.Item name="statusId" label="Колонка">
          <Select options={statuses.map((status) => ({ value: status._id, label: status.title }))} />
        </Form.Item>

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
            showSearch={{ optionFilterProp: "label"}}
            placeholder="Без тегов"
            loading={tags.isPending}
            options={tags.data?.map((tag) => ({ value: tag._id, label: tag.name }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}