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
  Toast,
  Alert,
} from "react-bootstrap";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaArrowRight,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    status: "To Do",
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading, isError } = useTasks({
    page,
    limit: 9,
    status: statusFilter,
    search: debouncedSearch,
  });

  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (newTask) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowCreateModal(false);
      setEditedData({ title: "", description: "", status: "To Do" });
      showToastMessage("Task created successfully!");
    },
    onError: (error) => {
      showToastMessage(
        error.response?.data?.message || "Failed to create task",
        "danger"
      );
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) =>
      taskService.updateTask(updatedTask._id, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
      showToastMessage("Task updated successfully!");
    },
    onError: (error) => {
      showToastMessage(
        error.response?.data?.message || "Failed to update task",
        "danger"
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowDeleteModal(false);
      showToastMessage("Task deleted successfully!");
    },
    onError: (error) => {
      showToastMessage(
        error.response?.data?.message || "Failed to delete task",
        "danger"
      );
    },
  });

  // Handlers
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

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete._id);
    }
  };

  const handleStatusUpdate = (task) => {
    updateTaskMutation.mutate({ ...task, status: "Done" });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Done":
        return <FaCheckCircle className="me-1" />;
      case "In Progress":
        return <FaSpinner className="me-1 spin" />;
      default:
        return <FaArrowRight className="me-1" />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading tasks...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-message text-danger p-3 bg-light rounded">
        <FaTimes className="me-2" />
        Error fetching tasks. Please try again.
      </div>
    );
  }

  return (
    <Container className="task-manager-container">
      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        className="position-fixed top-0 end-0 m-3"
        bg={toastVariant}
        delay={3000}
        autohide
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">
            {toastVariant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
      </Toast>

      {/* Controls Section */}
      <div className="task-controls mb-4">
        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="flex-grow-1 position-relative">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <Form.Control
              type="search"
              placeholder="Search tasks..."
              className="task-search shadow-sm ps-5"
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
            className="create-task-btn d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {data?.tasks?.length === 0 ? (
        <div className="no-records-found text-center py-5">
          <FaSearch className="display-4 text-muted mb-3" />
          <h4>No tasks found</h4>
          <p className="text-muted">
            {debouncedSearch || statusFilter
              ? "No tasks match your search or filter criteria"
              : "You don't have any tasks yet"}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setPage(1);
              setShowCreateModal(true);
            }}
            className="mt-3"
          >
            {debouncedSearch || statusFilter
              ? "Clear filters and create task"
              : "Create your first task"}
          </Button>
        </div>
      ) : (
        <>
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
                      <Card.Title
                        className={`task-title mb-0 text-truncate ${
                          task.status === "Done"
                            ? "text-decoration-line-through text-muted"
                            : ""
                        }`}
                      >
                        {task.title}
                      </Card.Title>
                      <Badge
                        pill
                        bg={getStatusColor(task.status)}
                        className="task-status-badge d-flex align-items-center"
                      >
                        {getStatusIcon(task.status)}
                        {task.status}
                      </Badge>
                    </div>

                    <div className="task-dates mb-3">
                      <small className="text-muted">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </small>
                      {task.updatedAt !== task.createdAt && (
                        <small className="text-muted ms-2">
                          Updated:{" "}
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </small>
                      )}
                    </div>

                    <Card.Text
                      className={`task-description mb-3 ${
                        task.status === "Done"
                          ? "text-decoration-line-through text-muted"
                          : ""
                      }`}
                    >
                      {task.description || (
                        <span className="text-muted">No description</span>
                      )}
                    </Card.Text>

                    <div className="task-actions d-flex justify-content-between align-items-center">
                      <div>
                        {task.status !== "Done" && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2 d-flex align-items-center"
                            onClick={() => handleStatusUpdate(task)}
                            disabled={
                              updateTaskMutation.isPending &&
                              updateTaskMutation.variables?._id === task._id
                            }
                          >
                            {updateTaskMutation.isPending &&
                            updateTaskMutation.variables?._id === task._id ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FaCheck className="me-1" />
                                Complete
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-flex align-items-center"
                          onClick={() => handleEditClick(task)}
                          disabled={
                            updateTaskMutation.isPending &&
                            updateTaskMutation.variables?._id === task._id
                          }
                        >
                          {updateTaskMutation.isPending &&
                          updateTaskMutation.variables?._id === task._id ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Editing...
                            </>
                          ) : (
                            <>
                              <FaEdit className="me-1" />
                              Edit
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="d-flex align-items-center"
                          onClick={() => handleDeleteClick(task)}
                          disabled={
                            deleteTaskMutation.isPending &&
                            deleteTaskMutation.variables === task._id
                          }
                        >
                          {deleteTaskMutation.isPending &&
                          deleteTaskMutation.variables === task._id ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <FaTrash className="me-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="mt-4 d-flex justify-content-center">
              <Pagination className="custom-pagination">
                <Pagination.Prev
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Pagination.Prev>
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
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                >
                  Next
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal show={!!editingTask} onHide={() => setEditingTask(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
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
                className="modern-input"
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
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editedData.status}
                onChange={handleInputChange}
                className="modern-input"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={() => setEditingTask(null)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateTask}
            disabled={updateTaskMutation.isPending}
            className="px-4 d-flex align-items-center"
          >
            {updateTaskMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
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
                className="modern-input"
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
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editedData.status}
                onChange={handleInputChange}
                className="modern-input"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={() => setShowCreateModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateTask}
            disabled={createTaskMutation.isPending}
            className="px-4 d-flex align-items-center"
          >
            {createTaskMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <FaExclamationTriangle className="text-danger me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-0">
            <p>
              Are you sure you want to delete the task{" "}
              <strong>"{taskToDelete?.title}"</strong>? This action cannot be
              undone.
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteTaskMutation.isPending}
            className="px-4 d-flex align-items-center"
          >
            {deleteTaskMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Task"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskList;
