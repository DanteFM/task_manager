import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../api/types';
import TaskCard from './TaskCard';

export default function DraggableTaskCard({ task, onClick }: { task: Task, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task._id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // Оригинал остаётся на месте полупрозрачным, а «в руке» летит копия (DragOverlay)
      style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab'}}
      onClick={onClick}
    >
      <TaskCard task={task} />
    </div>
  );
}