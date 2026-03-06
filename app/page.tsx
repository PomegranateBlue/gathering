"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { goalsReducer } from "./reducers/goalsReducer";
import { GoalModal } from "./components/GoalModal";
import { styles } from "./styles";

export default function CultGame() {
  const [goals, dispatch] = useReducer(goalsReducer, []);
  const [showModal, setShowModal] = useState(false);
  const [isNearObject, setIsNearObject] = useState(false);

  const handleSpacebar = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " && isNearObject && !showModal) {
        setShowModal(true);
      }
    },
    [isNearObject, showModal],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleSpacebar);
    return () => window.removeEventListener("keydown", handleSpacebar);
  }, [handleSpacebar]);

  const activeGoal = goals.length > 0 ? goals[goals.length - 1] : null;

  return (
    <div style={styles.container}>
      {activeGoal && (
        <div style={styles.hud}>
          <div style={styles.hudInner}>
            <span style={styles.hudLabel}>☽ 현재 목표</span>
            <span style={styles.hudText}>{activeGoal.text}</span>
          </div>
        </div>
      )}

      {isNearObject && !showModal && (
        <div style={styles.interactionHint}>
          <span style={styles.hintKey}>SPACE</span>
          <span style={styles.hintText}>제단에 접근</span>
        </div>
      )}

      <div style={styles.controlsHint}>
        <span style={styles.controlsText}>↑ ↓ ← → 이동</span>
      </div>

      <GameCanvas onNearChange={setIsNearObject} />

      {showModal && (
        <GoalModal
          goals={goals}
          dispatch={dispatch}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
