import { Alert, Button, Card, Col, Empty, Flex, Row, Skeleton, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import { useMe } from '../hooks/useMe';
import { useState } from 'react';
import CreateBoardModal from '../components/CreateBoardModal';

export default function BoardsPage() {
  const { data: user } = useMe();
  const { data: boards, isPending, error } = useBoards();
  const [modalOpen, setModalOpen] = useState(false)
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Доски
        </Typography.Title>
        {isAdmin && (
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Создать доску
          </Button>
        )}
      </Flex>

      {error && <Alert type="error" showIcon title={error.message} />}
      {isPending && <Skeleton active />}

      {boards?.length === 0 && (
        <Empty
          description={isAdmin ? 'Досок пока нет' : 'Вам пока не назначены задачи ни на одной доске'}
        />
      )}

      {boards && boards.length > 0 && (
        <Row gutter={[16, 16]}>
          {boards.map((board) => (
            <Col key={board._id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/boards/${board._id}`}>
                <Card hoverable>
                  <Card.Meta
                    title={board.title}
                    description={`Создана ${new Date(board.createdAt).toLocaleDateString('ru-RU')}`}
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      <CreateBoardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}