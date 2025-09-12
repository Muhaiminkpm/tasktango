
'use client';

import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/app/providers";
import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Columns = Record<TaskStatus, { name: string; items: Task[] }>;

const statusMap: Record<TaskStatus, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

export function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const tasksQuery = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksFromDb = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: (doc.data().dueDate as any).toDate().toISOString(),
        createdAt: (doc.data().createdAt as any).toDate().toISOString(),
      } as Task));
      setTasks(tasksFromDb);
    });

    return () => unsubscribe();
  }, [user]);

  const columns = useMemo((): Columns => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const initialColumns: Columns = {
      todo: { name: "To Do", items: [] },
      inProgress: { name: "In Progress", items: [] },
      done: { name: "Done", items: [] },
    };

    sortedTasks.forEach(task => {
        const status = task.status || 'todo';
        if (initialColumns[status]) {
            initialColumns[status].items.push(task);
        }
    });

    return initialColumns;
  }, [tasks]);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
        const sourceColumn = columns[source.droppableId as TaskStatus];
        const destColumn = columns[destination.droppableId as TaskStatus];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);
        
        const newStatus = destination.droppableId as TaskStatus;

        updateTaskStatus(removed.id, newStatus).catch(() => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update task status.",
            });
        });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "bg-secondary/50 rounded-lg p-4 transition-colors",
                    snapshot.isDraggingOver && "bg-secondary"
                  )}
                >
                  <h2 className="text-lg font-semibold font-headline mb-4">{column.name}</h2>
                  <div className="space-y-4 min-h-[400px]">
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                           <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                                snapshot.isDragging && "opacity-80 shadow-lg"
                            )}
                          >
                            <TaskCard task={item} onEdit={() => handleEdit(item)} onUpdate={() => {}} />
                           </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
      />
    </>
  );
}