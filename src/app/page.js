"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { db, auth } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LogOut, Plus, Trash2, Edit2, X, Check } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask.trim(),
        completed: false,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "tasks", id), {
        completed: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleUpdateTask = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await updateDoc(doc(db, "tasks", id), {
        title: editTitle.trim(),
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100vh" }}>
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="container animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>My Tasks</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {error && (
        <div className="error-message" style={{ wordBreak: 'break-word', marginBottom: '1.5rem' }}>
          <strong>Database Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-4" style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          className="input"
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={!newTask.trim()}>
          <Plus size={20} />
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ color: "var(--text-muted)" }}>You don't have any tasks yet. Add one above!</p>
        </div>
      ) : (
        <div className="flex-col">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
              {editingId === task.id ? (
                <div className="flex items-center gap-2" style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTask(task.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button onClick={() => handleUpdateTask(task.id)} className="btn-icon" style={{ color: "var(--success)" }}>
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-icon">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id, task.completed)}
                      className="task-checkbox"
                    />
                    <span className="task-text">{task.title}</span>
                  </div>
                  
                  <div className="task-actions">
                    <button onClick={() => startEditing(task)} className="btn-icon" aria-label="Edit task">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="btn-icon" 
                      style={{ color: "var(--danger)" }}
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
