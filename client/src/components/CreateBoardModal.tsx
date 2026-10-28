import { Alert, Form, Input, Modal } from 'antd';
import { useCreateBoard } from '../hooks/useBoards';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateBoardModal({ open, onClose }: Props) {
  const [form] = Form.useForm<{ title: string }>();
  const create = useCreateBoard();

  const close = () => {
    form.resetFields();
    create.reset();
    onClose();
  };

  return (
    <Modal
      title="Новая доска"
      open={open}
      okText="Создать"
      cancelText="Отмена"
      confirmLoading={create.isPending}
      onOk={() => form.submit()}
      onCancel={close}
    >
      {create.error && <Alert type="error" showIcon message={create.error.message} style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => create.mutate({ title: values.title.trim() }, { onSuccess: close })}
      >
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, whitespace: true, message: 'Введите название' }]}
        >
          <Input autoFocus maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
