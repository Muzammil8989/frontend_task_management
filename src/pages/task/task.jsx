import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/task-service";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import "./task.css";

export const useTasks = (params) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => taskService.getTasks(params),
    keepPreviousData: true,
  });
};

const TaskList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    status: "To Do",
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading, isError } = useTasks({
    page,
    limit: 9,
    status: statusFilter,
    search: debouncedSearch,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (newTask) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowCreateModal(false);
      setEditedData({ title: "", description: "", status: "To Do" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) =>
      taskService.updateTask(updatedTask._id, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Edit handlers
  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditedData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({
        ...editingTask,
        ...editedData,
      });
    }
  };

  const handleCreateTask = () => {
    createTaskMutation.mutate(editedData);
  };

  // Status handlers
  const handleStatusUpdate = (task) => {
    const statusOrder = ["To Do", "In Progress", "Done"];
    const currentIndex = statusOrder.indexOf(task.status);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    updateTaskMutation.mutate({ ...task, status: newStatus });
  };

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "success";
      case "In Progress":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (isLoading)
    return (
      <div className="loading-spinner">
        <Spinner animation="border" />
      </div>
    );
  if (isError) return <div className="error-message">Error fetching tasks</div>;

  return (
    <Container className="task-manager-container">
      {/* Search, Filters and Create Button */}
      <div className="task-controls mb-4">
        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="flex-grow-1">
            <Form.Control
              type="search"
              placeholder="🔍 Search tasks..."
              className="task-search shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: "200px" }}>
            <Form.Select
              className="status-filter shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </Form.Select>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="create-task-btn"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Tasks Grid */}
      <Row xs={1} md={2} lg={3} className="g-4 task-grid">
        {data?.tasks?.map((task) => (
          <Col key={task._id} className="task-col">
            <Card
              className={`modern-task-card ${
                task.status === "Done" ? "completed-task" : ""
              }`}
            >
              <Card.Body className="task-card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="task-title mb-0">
                    {task.title}
                  </Card.Title>
                  <Badge
                    bg={getStatusColor(task.status)}
                    className="task-status-badge"
                  >
                    {task.status}
                  </Badge>
                </div>

                <div className="task-dates mb-3">
                  <small className="text-muted">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </small>
                  {task.updatedAt !== task.createdAt && (
                    <small className="text-muted ms-2">
                      Updated: {new Date(task.updatedAt).toLocaleDateString()}
                    </small>
                  )}
                </div>

                <Card.Text className="task-description mb-3">
                  {task.description}
                </Card.Text>

                <div className="task-actions d-flex justify-content-between align-items-center">
                  <div>
                    {task.status !== "Done" && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleStatusUpdate(task)}
                        disabled={updateTaskMutation.isPending}
                      >
                        {updateTaskMutation.isPending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Complete"
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(task._id)}
                      disabled={deleteTaskMutation.isPending}
                    >
                      {deleteTaskMutation.isPending ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit Modal */}
      <Modal show={!!editingTask} onHide={() => setEditingTask(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editedData.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editedData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editedData.status}
                onChange={handleInputChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingTask(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateTask}
            disabled={updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Task Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editedData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editedData.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editedData.status}
                onChange={handleInputChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateTask}
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              "Create Task"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination className="custom-pagination">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            {Array.from({ length: data.totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default TaskList;
