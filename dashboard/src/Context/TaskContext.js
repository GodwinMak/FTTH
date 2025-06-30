import React, { createContext, useReducer, useEffect } from "react";

const initialState = {
  tasks: [],
  loading: true,
};

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case "SET_TASK":
      localStorage.setItem("tasks", JSON.stringify(action.payload));
      return { ...state, tasks: action.payload, loading: false };
    default:
      return state;
  }
};

const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // ✅ Restore from localStorage on first load
  useEffect(() => {
    const savedTask = localStorage.getItem("tasks");
    if (savedTask) {
      dispatch({ type: "SET_TASK", payload: JSON.parse(savedTask) });
    }
  }, []);
  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskProvider };
