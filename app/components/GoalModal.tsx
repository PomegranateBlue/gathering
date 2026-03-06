"use client";

import { useState, useEffect, useRef, Dispatch } from "react";
import { Goal, GoalAction } from "../reducers/goalsReducer";
import { styles } from "../styles";

interface GoalModalProps {
  goals: Goal[];
  dispatch: Dispatch<GoalAction>;
  onClose: () => void;
}

export function GoalModal({ goals, dispatch, onClose }: GoalModalProps) {
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD", payload: trimmed });
    setInputText("");
    inputRef.current?.focus();
  };

  const handleUpdate = (id: number) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    dispatch({ type: "UPDATE", payload: { id, text: trimmed } });
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") onClose();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") handleUpdate(id);
    if (e.key === "Escape") setEditingId(null);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>⛧ 목표 제단 ⛧</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.inputRow}>
          <input
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="새로운 목표를 입력하세요..."
            maxLength={100}
          />
          <button
            style={{
              ...styles.addBtn,
              opacity: inputText.trim() ? 1 : 0.4,
            }}
            onClick={handleAdd}
            disabled={!inputText.trim()}
          >
            봉헌
          </button>
        </div>

        <div style={styles.goalList}>
          {goals.length === 0 && (
            <p style={styles.emptyText}>아직 봉헌된 목표가 없습니다.</p>
          )}
          {goals.map((goal) => (
            <div key={goal.id} style={styles.goalItem}>
              {editingId === goal.id ? (
                <div style={styles.editRow}>
                  <input
                    style={styles.editInput}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, goal.id)}
                    autoFocus
                  />
                  <button
                    style={styles.saveBtn}
                    onClick={() => handleUpdate(goal.id)}
                  >
                    ✓
                  </button>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => setEditingId(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.goalTextWrap}>
                    <span style={styles.goalText}>{goal.text}</span>
                    <span style={styles.goalDate}>{goal.createdAt}</span>
                  </div>
                  <div style={styles.goalActions}>
                    <button
                      style={styles.editBtn}
                      onClick={() => {
                        setEditingId(goal.id);
                        setEditText(goal.text);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() =>
                        dispatch({ type: "DELETE", payload: goal.id })
                      }
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
