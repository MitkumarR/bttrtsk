import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Monitor, Plus, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';

// --- Theme Configuration ---
const themes = {
  light: {
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    selected: 'bg-blue-50 border-blue-500',
    badge: 'bg-gray-100 text-gray-700',
    badgeSelected: 'bg-blue-100 text-blue-700'
  },
  dark: {
    bg: 'bg-[#0d1117]',
    cardBg: 'bg-[#161b22]',
    text: 'text-[#e6edf3]',
    textSecondary: 'text-[#7d8590]',
    textMuted: 'text-[#6e7681]',
    border: 'border-[#30363d]',
    input: 'bg-[#0d1117] border-[#30363d] text-[#e6edf3] placeholder-[#6e7681] focus:border-[#1f6feb] focus:ring-[#1f6feb]',
    button: 'bg-[#238636] hover:bg-[#2ea043] text-white',
    buttonSecondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3]',
    danger: 'bg-[#da3633] hover:bg-[#b62324] text-white',
    success: 'bg-[#238636] hover:bg-[#2ea043] text-white',
    selected: 'bg-[#1f6feb]/10 border-[#1f6feb]',
    badge: 'bg-[#21262d] text-[#7d8590]',
    badgeSelected: 'bg-[#1f6feb]/20 text-[#58a6ff]'
  }
};

// --- API Helper Function ---
async function apiRequest(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    
    if (response.status === 204 || method === 'DELETE') {
      return { success: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${url} failed:`, error);
    throw error;
  }
}

// --- UI Components ---

function LoadingSpinner({ theme }) {
  const t = themes[theme];
  return (
    <div className="flex justify-center items-center p-10">
      <div className={`w-8 h-8 border-4 ${theme === 'dark' ? 'border-[#58a6ff]' : 'border-blue-500'} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
}

function ErrorModal({ message, onClose, theme }) {
  const t = themes[theme];
  if (!message) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`${t.cardBg} p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 border ${t.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f85149]' : 'text-red-600'}`}>
          Error
        </h3>
        <p className={`${t.textSecondary} mb-6`}>{message}</p>
        <button
          onClick={onClose}
          className={`w-full ${t.danger} px-4 py-2 rounded-md font-medium transition-colors`}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ThemeToggle({ currentTheme, onThemeChange }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const Icon = currentTheme === 'light' ? Sun : currentTheme === 'dark' ? Moon : Monitor;
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-2 rounded-lg transition-colors ${
          currentTheme === 'dark' 
            ? 'bg-[#21262d] hover:bg-[#30363d] text-[#7d8590]' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        title="Change theme"
      >
        <Icon className="w-5 h-5" />
      </button>
      
      {showMenu && (
        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${
          currentTheme === 'dark' 
            ? 'bg-[#161b22] border-[#30363d]' 
            : 'bg-white border-gray-200'
        } py-1 z-10`}>
          <button
            onClick={() => { onThemeChange('light'); setShowMenu(false); }}
            className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
              currentTheme === 'dark' 
                ? 'hover:bg-[#21262d] text-[#e6edf3]' 
                : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Sun className="w-4 h-4" /> Light
          </button>
          <button
            onClick={() => { onThemeChange('dark'); setShowMenu(false); }}
            className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
              currentTheme === 'dark' 
                ? 'hover:bg-[#21262d] text-[#e6edf3]' 
                : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button
            onClick={() => { onThemeChange('system'); setShowMenu(false); }}
            className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
              currentTheme === 'dark' 
                ? 'hover:bg-[#21262d] text-[#e6edf3]' 
                : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" /> System
          </button>
        </div>
      )}
    </div>
  );
}

function TaskCreateForm({ onTaskCreated, theme }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const t = themes[theme];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      await apiRequest('/api/tasks', 'POST', { title, description });
      setTitle('');
      setDescription('');
      onTaskCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${t.cardBg} p-5 rounded-lg border ${t.border}`}>
      <div className="flex items-center gap-2 mb-4">
        <Plus className={`w-5 h-5 ${t.textSecondary}`} />
        <h3 className={`text-lg font-semibold ${t.text}`}>New Task</h3>
      </div>
      {error && <p className={`${theme === 'dark' ? 'text-[#f85149]' : 'text-red-600'} text-sm mb-3`}>{error}</p>}
      <div className="mb-3">
        <label htmlFor="title" className={`block text-sm font-medium ${t.textSecondary} mb-2`}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={`w-full px-3 py-2 border rounded-md ${t.input} focus:outline-none focus:ring-1 transition-colors`}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className={`block text-sm font-medium ${t.textSecondary} mb-2`}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows="3"
          className={`w-full px-3 py-2 border rounded-md ${t.input} focus:outline-none focus:ring-1 transition-colors resize-none`}
        />
      </div>
      <button
        type="submit"
        className={`w-full ${t.button} px-4 py-2 rounded-md font-medium transition-colors `}
      >
        Create Task
      </button>
    </form>
  );
}

function TaskList({ tasks, selectedTask, onSelectTask, theme }) {
  const t = themes[theme];
  
  return (
    <div className={`${t.cardBg} p-5 rounded-lg border ${t.border}`}>
      <h3 className={`text-lg font-semibold ${t.text} mb-4`}>
        Tasks <span className={`${t.textMuted} font-normal text-sm`}>({tasks.length})</span>
      </h3>
      {tasks.length === 0 ? (
        <p className={`${t.textMuted} text-center py-8`}>No tasks yet. Create one above!</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => onSelectTask(task)}
                className={`w-full text-left p-3 rounded-lg transition-all border ${
                  selectedTask?.id === task.id
                    ? t.selected
                    : `${t.cardBg} ${t.border} hover:border-${theme === 'dark' ? '[#30363d]' : 'gray-300'}`
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${selectedTask?.id === task.id ? (theme === 'dark' ? 'text-[#58a6ff]' : 'text-blue-600') : t.text} mb-1`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <p className={`text-sm ${t.textSecondary} truncate`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className={`w-4 h-4 ${t.textMuted}`} />
                    <span className={`text-sm font-medium ${
                      selectedTask?.id === task.id ? t.badgeSelected : t.badge
                    } px-2 py-0.5 rounded-full`}>
                      {task.comment_count}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentAddForm({ taskId, onCommentAdded, theme }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const t = themes[theme];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      await apiRequest(`/api/tasks/${taskId}/comments`, 'POST', { content });
      setContent('');
      onCommentAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {error && <p className={`${theme === 'dark' ? 'text-[#f85149]' : 'text-red-600'} text-sm mb-2`}>{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className={`flex-1 px-3 py-2 border rounded-md ${t.input} focus:outline-none focus:ring-1 transition-colors`}
        />
        <button
          type="submit"
          className={`${t.button} px-4 py-2 rounded-md font-medium transition-colors flex-shrink-0`}
        >
          Comment
        </button>
      </div>
    </form>
  );
}

function CommentItem({ comment, onCommentUpdated, onCommentDeleted, theme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [error, setError] = useState(null);
  const t = themes[theme];

  const handleSave = async () => {
    setError(null);
    if (!editContent.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      await apiRequest(`/api/comments/${comment.id}`, 'PUT', { content: editContent });
      setIsEditing(false);
      onCommentUpdated();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/api/comments/${comment.id}`, 'DELETE');
      onCommentDeleted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <li className={`py-4 border-b ${t.border} last:border-b-0`}>
      {error && <p className={`${theme === 'dark' ? 'text-[#f85149]' : 'text-red-600'} text-sm mb-2`}>{error}</p>}
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${t.input} focus:outline-none focus:ring-1 transition-colors`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`${t.success} px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1`}
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`${t.buttonSecondary} px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1`}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className={`${t.text} mb-2 break-words`}>{comment.content}</p>
            <p className={`text-xs ${t.textMuted}`}>
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className={`${theme === 'dark' ? 'text-[#58a6ff] hover:text-[#79c0ff]' : 'text-blue-600 hover:text-blue-700'} text-sm font-medium transition-colors`}
              title="Edit comment"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className={`${theme === 'dark' ? 'text-[#f85149] hover:text-[#da3633]' : 'text-red-600 hover:text-red-700'} text-sm font-medium transition-colors`}
              title="Delete comment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function App() {
  const [themePreference, setThemePreference] = useState('system');
  const [actualTheme, setActualTheme] = useState('light');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState(null);

  // Theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      if (themePreference === 'system') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setActualTheme(themePreference);
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themePreference]);

  const t = themes[actualTheme];

  const fetchTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const data = await apiRequest('/api/tasks');
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (!selectedTask) {
      setComments([]);
      return;
    }
    
    setIsLoadingComments(true);
    try {
      const data = await apiRequest(`/api/tasks/${selectedTask.id}/comments`);
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingComments(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };
  
  const handleCommentChange = () => {
    fetchComments();
    fetchTasks();
  };

  return (
    <div>
      <ErrorModal message={error} onClose={() => setError(null)} theme={actualTheme} />
      <div className={`${t.bg} min-h-screen transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${t.text} mb-1`}>Task Manager</h1>
              <p className={`text-sm ${t.textSecondary}`}>Flask + React Application</p>
            </div>
            <ThemeToggle currentTheme={themePreference} onThemeChange={setThemePreference} />
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Tasks */}
            <div className="space-y-6">
              <TaskCreateForm onTaskCreated={handleTaskCreated} theme={actualTheme} />
              {isLoadingTasks ? (
                <div className={`${t.cardBg} p-5 rounded-lg border ${t.border}`}>
                  <LoadingSpinner theme={actualTheme} />
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  selectedTask={selectedTask}
                  onSelectTask={handleSelectTask}
                  theme={actualTheme}
                />
              )}
            </div>

            {/* Right Column: Comments */}
            <div className={`${t.cardBg} p-6 rounded-lg border ${t.border} lg:sticky lg:top-6 lg:self-start`}>
              {!selectedTask ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <MessageSquare className={`w-16 h-16 ${t.textMuted} mb-4`} />
                  <p className={`${t.textMuted} text-center`}>Select a task to view and manage comments</p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className={`text-2xl font-bold ${t.text} mb-2`}>
                      {selectedTask.title}
                    </h2>
                    {selectedTask.description && (
                      <p className={`${t.textSecondary}`}>
                        {selectedTask.description}
                      </p>
                    )}
                  </div>
                  
                  <div className={`border-t ${t.border} pt-6`}>
                    <h3 className={`text-lg font-semibold ${t.text} mb-4 flex items-center gap-2`}>
                      <MessageSquare className="w-5 h-5" />
                      Comments
                      <span className={`${t.textMuted} font-normal text-sm`}>
                        ({comments.length})
                      </span>
                    </h3>
                    
                    {isLoadingComments ? (
                      <LoadingSpinner theme={actualTheme} />
                    ) : (
                      <>
                        {comments.length === 0 ? (
                          <p className={`${t.textMuted} text-center py-8`}>No comments yet. Be the first to comment!</p>
                        ) : (
                          <ul>
                            {comments.map((comment) => (
                              <CommentItem
                                key={comment.id}
                                comment={comment}
                                onCommentUpdated={handleCommentChange}
                                onCommentDeleted={handleCommentChange}
                                theme={actualTheme}
                              />
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                    
                    <CommentAddForm 
                      taskId={selectedTask.id}
                      onCommentAdded={handleCommentChange}
                      theme={actualTheme}
                    />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}