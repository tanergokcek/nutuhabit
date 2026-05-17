import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTodoStore } from '../store/useTodoStore';
import { Check, Plus, Trash2, Circle } from 'lucide-react';
import './Views.css';

export default function TodosView() {
  const { user } = useAuthStore();
  const { todos, fetchTodos, addTodo, toggleTodo, deleteTodo, loading } = useTodoStore();
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (user?.id) fetchTodos(user.id);
  }, [user?.id, fetchTodos]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !user?.id) return;
    addTodo(user.id, newTodo.trim(), priority);
    setNewTodo('');
  };

  const priorityColors = {
    high: '#ef4444',
    normal: '#a855f7',
    low: '#3b82f6'
  };

  if (loading) return <div className="view-loading">Yükleniyor...</div>;

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h2 className="section-title">Yapılacaklar</h2>
      </div>

      <form className="add-form" onSubmit={handleAdd}>
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Yeni görev ekle..."
          className="add-input"
        />
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
          style={{ color: priorityColors[priority] }}
        >
          <option value="high" style={{color: priorityColors.high}}>Yüksek</option>
          <option value="normal" style={{color: priorityColors.normal}}>Normal</option>
          <option value="low" style={{color: priorityColors.low}}>Düşük</option>
        </select>
        <button type="submit" className="add-btn" disabled={!newTodo.trim()}>
          <Plus size={20} />
        </button>
      </form>

      <div className="list-container">
        {todos.length === 0 ? (
          <div className="empty-state">Henüz yapılacak bir görev yok.</div>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className={`list-item ${todo.completed ? 'completed' : ''}`}>
              <button 
                className="check-btn" 
                onClick={() => toggleTodo(todo.id, !todo.completed)}
              >
                {todo.completed ? <Check size={20} color="#a855f7" /> : <Circle size={20} color="rgba(255,255,255,0.3)" />}
              </button>
              
              <div className="item-content">
                <span className="item-text">{todo.text}</span>
                <span className="item-badge" style={{ backgroundColor: `${priorityColors[todo.priority]}20`, color: priorityColors[todo.priority] }}>
                  {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'low' ? 'Düşük' : 'Normal'}
                </span>
              </div>

              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
