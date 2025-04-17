"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taskService } from "../../services/task-service"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap"
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
  FaCalendarAlt,
  FaFilter,
  FaCalendarCheck,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarTimes,
  FaCalendarDay,
} from "react-icons/fa"
import "./task.css"

export const useTasks = (params) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => taskService.getTasks(params),
    keepPreviousData: true,
  })
}

// Format date with time
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Format date only
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Get relative time (e.g., "2 days ago", "just now")
const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffMinutes < 1) return "just now"
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`

  return formatDate(dateString)
}

const TaskList = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVariant, setToastVariant] = useState("success")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deadlineFilter, setDeadlineFilter] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    status: "To Do",
    deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Default to tomorrow
  })

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data, isLoading, isError } = useTasks({
    page,
    limit: 9,
    status: statusFilter,
    search: debouncedSearch,
    deadline: deadlineFilter,
    sortBy,
    sortOrder,
  })

  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message)
    setToastVariant(variant)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (newTask) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setShowCreateModal(false)
      setEditedData({
        title: "",
        description: "",
        status: "To Do",
        deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      })
      showToastMessage("Task created successfully!")
    },
    onError: (error) => {
      showToastMessage(error.response?.data?.message || "Failed to create task", "danger")
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) =>
      taskService.updateTask(updatedTask._id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        deadline: updatedTask.deadline,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setEditingTask(null)
      showToastMessage("Task updated successfully!")
    },
    onError: (error) => {
      showToastMessage(error.response?.data?.message || "Failed to update task", "danger")
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (taskId) =>
      taskService.updateTask(taskId, {
        status: "Done",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      showToastMessage("Task marked as complete!")
    },
    onError: (error) => {
      showToastMessage(error.response?.data?.message || "Failed to update task status", "danger")
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setShowDeleteModal(false)
      showToastMessage("Task deleted successfully!")
    },
    onError: (error) => {
      showToastMessage(error.response?.data?.message || "Failed to delete task", "danger")
    },
  })

  // Handlers
  const handleEditClick = (task) => {
    setEditingTask(task)
    setEditedData({
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : new Date(Date.now() + 86400000).toISOString().split("T")[0],
    })
  }

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({
        ...editingTask,
        ...editedData,
      })
    }
  }

  const handleCreateTask = () => {
    createTaskMutation.mutate(editedData)
  }

  const handleDeleteClick = (task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete._id)
    }
  }

  // Update the handleStatusUpdate function to:
  const handleStatusUpdate = (task) => {
    updateStatusMutation.mutate(task._id)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "success"
      case "In Progress":
        return "warning"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Done":
        return <FaCheckCircle className="me-1" />
      case "In Progress":
        return <FaSpinner className="me-1 spin" />
      default:
        return <FaArrowRight className="me-1" />
    }
  }

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    const deadlineDateOnly = new Date(deadlineDate)
    deadlineDateOnly.setHours(0, 0, 0, 0)


    const isToday = deadlineDateOnly.getTime() === today.getTime()


    const isPast = deadlineDateOnly < today

    return { isToday, isPast }
  }

  const getDeadlineClass = (deadline) => {
    if (!deadline) return ""

    const status = getDeadlineStatus(deadline)

    if (status.isPast) return "deadline-overdue"
    if (status.isToday) return "deadline-today"

    // Calculate days until deadline
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    const diffTime = Math.abs(deadlineDate - today)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 3) return "deadline-soon" // Within 3 days
    if (diffDays <= 7) return "deadline-upcoming" // Within a week

    return "deadline-future"
  }

  const getCardBorderColor = (task) => {
    // If task is completed, keep the success border
    if (task.status === "Done") return "success"

    // If no deadline, assign a default color based on status
    if (!task.deadline) {
      return task.status === "In Progress" ? "warning" : "primary"
    }

    const { isToday, isPast } = getDeadlineStatus(task.deadline)

    if (isPast) return "danger"
    if (isToday) return "warning"

  
    const idSum = task._id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colors = ["primary", "info", "secondary", "dark"]
    return colors[idSum % colors.length]
  }

  const getDeadlineIcon = (deadline) => {
    if (!deadline) return <FaCalendarAlt className="me-1" />

    const status = getDeadlineStatus(deadline)

    if (status.isPast) return <FaCalendarTimes className="me-1 text-danger" />
    if (status.isToday) return <FaCalendarDay className="me-1 text-warning" />

    return <FaCalendarCheck className="me-1 text-success" />
  }

  
  const resetFilters = () => {
    setSearchQuery("")
    setDebouncedSearch("")
    setStatusFilter("")
    setDeadlineFilter("")
    setSortBy("createdAt")
    setSortOrder("desc")
    setPage(1)
  }

  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const taskVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  }

  if (isLoading) {
    return (
      <motion.div
        className="loading-spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-content">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading tasks...</span>
        </div>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <motion.div
        className="error-message"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="error-content">
          <FaTimes className="me-2" />
          Error fetching tasks. Please try again.
        </div>
      </motion.div>
    )
  }

  return (
    <Container className="task-manager-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="position-fixed top-0 end-0 p-3"
            style={{
              zIndex: 9999, 
              pointerEvents: 'none' 
            }}
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 },
              exit: { opacity: 0, x: 50 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
          >
            <Toast
              onClose={() => setShowToast(false)}
              bg={toastVariant}
              delay={3000}
              autohide
              className="modern-toast"
              style={{
                pointerEvents: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              <Toast.Header
                closeButton={false}
                className={`bg-${toastVariant} text-white border-bottom-0`}
              >
                <strong className="me-auto">
                  {toastVariant === "success" ? (
                    <FaCheckCircle className="me-2" />
                  ) : (
                    <FaExclamationTriangle className="me-2" />
                  )}
                  {toastVariant === "success" ? "Success" : "Error"}
                </strong>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowToast(false)}
                  aria-label="Close"
                />
              </Toast.Header>
              <Toast.Body className="text-white">
                <div className="d-flex align-items-center">
                  {toastVariant === "success" ? (
                    <FaCheck className="me-2 flex-shrink-0" />
                  ) : (
                    <FaExclamationCircle className="me-2 flex-shrink-0" />
                  )}
                  <span>{toastMessage}</span>
                </div>
              </Toast.Body>
            </Toast>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.div
        className="task-controls mb-4 mt-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex flex-column gap-3">

          <div className="d-flex flex-column flex-md-row gap-3">
            <div className="flex-grow-1 position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <Form.Control
                type="search"
                placeholder="Search tasks..."
                className="task-search ps-5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="create-task-btn d-flex align-items-center"
              >
                <FaPlus className="me-2" />
                Create Task
              </Button>
            </motion.div>
          </div>


          <div className="d-flex flex-column flex-md-row gap-3">

            <div className="filter-group">
              <Form.Select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </Form.Select>
            </div>


            <div className="filter-group">
              <Form.Select
                className="deadline-filter"
                value={deadlineFilter}
                onChange={(e) => {
                  setDeadlineFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Deadlines</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </Form.Select>
            </div>


            <div className="d-flex gap-2 ms-md-auto">
              <div className="filter-group">
                <Form.Select
                  className="sort-by-filter"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="createdAt">Sort by: Created</option>
                  <option value="deadline">Sort by: Deadline</option>
                  <option value="title">Sort by: Title</option>
                </Form.Select>
              </div>

              <Button
                variant="outline-secondary"
                className="sort-order-btn"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  setPage(1)
                }}
              >
                {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </Button>


              {(searchQuery || statusFilter || deadlineFilter || sortBy !== "createdAt" || sortOrder !== "desc") && (
                <Button variant="outline-danger" onClick={resetFilters} className="reset-filters-btn">
                  <FaTimes className="me-1" />
                </Button>
              )}
            </div>
          </div>


          {(searchQuery || statusFilter || deadlineFilter || sortBy !== "createdAt" || sortOrder !== "desc") && (
            <div className="active-filters p-2 rounded-3">
              <small className="text-muted d-flex align-items-center">
                <FaFilter className="me-1" /> Active filters:
                {searchQuery && (
                  <Badge bg="light" text="dark" className="ms-2 filter-badge">
                    Search: {searchQuery}
                  </Badge>
                )}
                {statusFilter && (
                  <Badge bg="light" text="dark" className="ms-2 filter-badge">
                    Status: {statusFilter}
                  </Badge>
                )}
                {deadlineFilter && (
                  <Badge bg="light" text="dark" className="ms-2 filter-badge">
                    Deadline: {deadlineFilter === "upcoming" ? "Upcoming" : "Past"}
                  </Badge>
                )}
                {sortBy !== "createdAt" && (
                  <Badge bg="light" text="dark" className="ms-2 filter-badge">
                    Sort by: {sortBy === "deadline" ? "Deadline" : "Title"}
                  </Badge>
                )}
                {sortOrder !== "desc" && (
                  <Badge bg="light" text="dark" className="ms-2 filter-badge">
                    Order: Ascending
                  </Badge>
                )}
              </small>
            </div>
          )}
        </div>
      </motion.div>


      {data?.tasks?.length === 0 ? (
        <motion.div
          className="no-records-found text-center py-5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaSearch className="display-4 text-muted mb-3" />
          <h4>No tasks found</h4>
          <p className="text-muted">
            {debouncedSearch || statusFilter || deadlineFilter
              ? "No tasks match your search or filter criteria"
              : "You don't have any tasks yet"}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              onClick={() => {
                resetFilters()
                setShowCreateModal(true)
              }}
              className="mt-3"
            >
              {debouncedSearch || statusFilter || deadlineFilter
                ? "Clear filters and create task"
                : "Create your first task"}
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Row xs={1} md={2} lg={3} className="g-4 task-grid">
              <AnimatePresence>
                {data?.tasks?.map((task) => (
                  <Col key={task._id} className="task-col">
                    <motion.div variants={taskVariants} layout whileHover={{ y: -5 }}>
                      <Card
                        className={`modern-task-card border-${getCardBorderColor(task)} ${task.status === "Done" ? "completed-task" : ""}`}
                        style={{ borderLeftWidth: "5px" }}
                      >
                        <Card.Body className="task-card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title
                              className={`task-title mb-0 text-truncate ${task.status === "Done" ? "text-decoration-line-through text-muted" : ""
                                }`}
                            >
                              {task.title}
                            </Card.Title>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Badge
                                pill
                                bg={getStatusColor(task.status)}
                                className="task-status-badge d-flex align-items-center"
                              >
                                {getStatusIcon(task.status)}
                                {task.status}
                              </Badge>
                            </motion.div>
                          </div>

                          <div className="task-dates mb-3">
                            <div className="date-badges">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>{formatDateTime(task.createdAt)}</Tooltip>}
                              >
                                <Badge bg="light" text="dark" className="date-badge me-2">
                                  <FaCalendarAlt className="me-1 text-primary" />
                                  <span className="date-label">Created:</span> {getRelativeTime(task.createdAt)}
                                </Badge>
                              </OverlayTrigger>

                              {task.updatedAt && task.updatedAt !== task.createdAt && (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>{formatDateTime(task.updatedAt)}</Tooltip>}
                                >
                                  <Badge bg="light" text="dark" className="date-badge">
                                    <FaEdit className="me-1 text-info" />
                                    <span className="date-label">Updated:</span> {getRelativeTime(task.updatedAt)}
                                  </Badge>
                                </OverlayTrigger>
                              )}
                            </div>

                            {task.deadline && (
                              <div className={`deadline-indicator ${getDeadlineClass(task.deadline)} mt-2`}>
                                {getDeadlineIcon(task.deadline)}
                                <span className="fw-medium">{formatDate(task.deadline)}</span>
                                {getDeadlineStatus(task.deadline)?.isPast && (
                                  <span className="ms-2 badge bg-danger">OVERDUE</span>
                                )}
                                {getDeadlineStatus(task.deadline)?.isToday &&
                                  !getDeadlineStatus(task.deadline)?.isPast && (
                                    <span className="ms-2 badge bg-warning text-dark">TODAY</span>
                                  )}
                                {!getDeadlineStatus(task.deadline)?.isToday &&
                                  !getDeadlineStatus(task.deadline)?.isPast && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip>
                                          {(() => {
                                            const today = new Date()
                                            today.setHours(0, 0, 0, 0)
                                            const deadlineDate = new Date(task.deadline)
                                            deadlineDate.setHours(0, 0, 0, 0)
                                            const diffTime = Math.abs(deadlineDate - today)
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                            return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`
                                          })()}
                                        </Tooltip>
                                      }
                                    >
                                      <span className="ms-2 badge bg-info">
                                        {(() => {
                                          const today = new Date()
                                          today.setHours(0, 0, 0, 0)
                                          const deadlineDate = new Date(task.deadline)
                                          deadlineDate.setHours(0, 0, 0, 0)
                                          const diffTime = Math.abs(deadlineDate - today)
                                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                          return `${diffDays}d`
                                        })()}
                                      </span>
                                    </OverlayTrigger>
                                  )}
                              </div>
                            )}
                          </div>

                          <Card.Text
                            className={`task-description mb-3 ${task.status === "Done" ? "text-decoration-line-through text-muted" : ""
                              }`}
                          >
                            {task.description || <span className="text-muted">No description</span>}
                          </Card.Text>

                          <div className="task-actions d-flex justify-content-between align-items-center">
                            <div>
                              {task.status !== "Done" && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="me-2 d-flex align-items-center"
                                    onClick={() => handleStatusUpdate(task)}
                                    disabled={
                                      updateStatusMutation.isPending && updateStatusMutation.variables === task._id
                                    }
                                  >
                                    {updateStatusMutation.isPending && updateStatusMutation.variables === task._id ? (
                                      <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Completing...
                                      </>
                                    ) : (
                                      <>
                                        <FaCheck className="me-1" />
                                        Complete
                                      </>
                                    )}
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  onClick={() => handleEditClick(task)}
                                  disabled={
                                    updateTaskMutation.isPending && updateTaskMutation.variables?._id === task._id
                                  }
                                >
                                  {updateTaskMutation.isPending && updateTaskMutation.variables?._id === task._id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Editing...
                                    </>
                                  ) : (
                                    <>
                                      <FaEdit className="me-1" />
                                      Edit
                                    </>
                                  )}
                                </Button>
                              </motion.div>

                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  onClick={() => handleDeleteClick(task)}
                                  disabled={deleteTaskMutation.isPending && deleteTaskMutation.variables === task._id}
                                >
                                  {deleteTaskMutation.isPending && deleteTaskMutation.variables === task._id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <FaTrash className="me-1" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </AnimatePresence>
            </Row>
          </motion.div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <motion.div
              className="mt-4 d-flex justify-content-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Pagination className="custom-pagination">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </Pagination.Prev>
                </motion.div>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <motion.div key={i + 1} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Pagination.Item active={i + 1 === page} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </Pagination.Item>
                  </motion.div>
                ))}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Pagination.Next
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  >
                    Next
                  </Pagination.Next>
                </motion.div>
              </Pagination>
            </motion.div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {!!editingTask && (
          <Modal show={!!editingTask} onHide={() => setEditingTask(null)} centered className="modern-modal">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      name="deadline"
                      value={editedData.deadline}
                      onChange={handleInputChange}
                      className="modern-input"
                      min={new Date().toISOString().split("T")[0]}
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="light" onClick={() => setEditingTask(null)} className="px-4">
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>
              </Modal.Footer>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered className="modern-modal">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      name="deadline"
                      value={editedData.deadline}
                      onChange={handleInputChange}
                      className="modern-input"
                      min={new Date().toISOString().split("T")[0]}
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="light" onClick={() => setShowCreateModal(false)} className="px-4">
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>
              </Modal.Footer>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modern-modal">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                    Are you sure you want to delete the task <strong>"{taskToDelete?.title}"</strong>? This action
                    cannot be undone.
                  </p>
                </Alert>
              </Modal.Body>
              <Modal.Footer className="border-0 pt-0">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="light" onClick={() => setShowDeleteModal(false)} className="px-4">
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>
              </Modal.Footer>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default TaskList
