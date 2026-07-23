import { useEffect, useMemo, useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_TASK = { title: '', description: '', dueDate: '', priority: 'medium' };

function formatDate(value) {
  return value ? new Date(value).toISOString().split('T')[0] : '';
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(DEFAULT_TASK);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = '/api/tasks';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (filterBy !== 'all') searchParams.set('filterBy', filterBy);
      if (priorityFilter !== 'all') searchParams.set('priority', priorityFilter);
      searchParams.set('sortBy', sortBy);
      const response = await fetch(`${apiUrl}?${searchParams.toString()}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('タスクの読み込みに失敗しました。');
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_TASK);
    setEditMode(false);
    setSelectedTask(null);
    setError('');
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('タイトルを入力してください。');
      return;
    }

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${apiUrl}/${selectedTask._id}` : apiUrl;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate ? new Date(form.dueDate) : null
        })
      });
      if (!response.ok) throw new Error();
      await fetchTasks();
      resetForm();
    } catch {
      setError('タスクの保存に失敗しました。');
    }
  };

  const handleComplete = async (task) => {
    try {
      await fetch(`${apiUrl}/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, completed: !task.completed })
      });
      fetchTasks();
    } catch {
      setError('完了状態の更新に失敗しました。');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm('本当にこのタスクを削除しますか？')) return;
    try {
      await fetch(`${apiUrl}/${task._id}`, { method: 'DELETE' });
      fetchTasks();
      if (selectedTask?._id === task._id) resetForm();
    } catch {
      setError('タスクの削除に失敗しました。');
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: formatDate(task.dueDate),
      priority: task.priority
    });
    setEditMode(true);
    setError('');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, priorityFilter]);

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <header className="header">
        <div>
          <h1>タスク管理アプリ</h1>
          <p>期限と優先度で管理できるシンプルなタスク管理ツール</p>
        </div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'ライトモード' : 'ダークモード'}
        </button>
      </header>

      <main className="container">
        <section className="panel">
          <h2>タスク追加 / 編集</h2>
          <form className="task-form" onSubmit={handleSave}>
            <label>
              タイトル
              <input
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="タスクのタイトル"
              />
            </label>
            <label>
              詳細
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="タスクの詳細"
              />
            </label>
            <div className="form-row">
              <label>
                期限
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
              </label>
              <label>
                優先度
                <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                  {PRIORITIES.map((level) => (
                    <option key={level} value={level}>
                      {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit">{editMode ? '更新する' : '追加する'}</button>
              <button type="button" className="secondary" onClick={resetForm}>
                リセット
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <section className="panel task-list-panel">
          <div className="task-list-header">
            <h2>タスク一覧</h2>
            <div className="filters">
              <label>
                フィルタ
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                  <option value="all">すべて</option>
                  <option value="today">今日</option>
                  <option value="upcoming">今後</option>
                  <option value="overdue">期限切れ</option>
                </select>
              </label>
              <label>
                優先度
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="all">全て</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </label>
              <label>
                ソート
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="dueDate">期限順</option>
                  <option value="priority">優先度</option>
                </select>
              </label>
            </div>
          </div>

          <div className="task-grid">
            {filteredTasks.length === 0 ? (
              <p className="empty-state">表示するタスクがありません。</p>
            ) : (
              filteredTasks.map((task) => (
                <article key={task._id} className={task.completed ? 'task-card completed' : 'task-card'}>
                  <div className="task-top">
                    <h3>{task.title}</h3>
                    <span className={`badge ${task.priority}`}>{task.priority}</span>
                  </div>
                  <p>{task.description || '説明はありません。'}</p>
                  <div className="task-meta">
                    <span>期限: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ja-JP') : '設定なし'}</span>
                    <span>作成: {new Date(task.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => handleComplete(task)}>{task.completed ? '未完了に戻す' : '完了'}</button>
                    <button className="secondary" onClick={() => handleEdit(task)}>編集</button>
                    <button className="danger" onClick={() => handleDelete(task)}>削除</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
