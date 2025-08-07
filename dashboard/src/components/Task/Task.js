import React, { useState, useEffect } from "react";
import { useTaskContext } from "../../hooks/useTaskContext";
import axios from "axios"
import {PRODUCTION_URL} from "../../utils/Api"
import {useAuthContext} from "../../hooks/useAuthContext"

const Task = () => {
  const { state } = useTaskContext();
  const {state: authState} = useAuthContext();

  console.log(authState.userData)
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    task_type: "",
    date: "",
    contractor_name: "",
    time_elapsed: "",
    customer_name: "",
    account_number: "",
    building_name: "",
    house_no: "",
    building_location: "",
    status: "",
    notes: [],
    task_completion: [],
  });

  function getElapsedTime(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / 1000);

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (days > 0) {
      return `${days}day${days > 1 ? "s" : ""} ${
        hours > 0 ? `${hours}hr${hours > 1 ? "s" : ""}` : ""
      }`;
    } else if (hours > 0) {
      return `${hours}hr${hours > 1 ? "s" : ""} ${
        minutes > 0 ? `${minutes}min` : ""
      }`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    } else {
      return `${seconds}sec`;
    }
  }
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  useEffect(() => {
    setData({
      task_type: state.tasks.task_type,
      date: formatDate(state.tasks.createdAt),
      contractor_name: state.tasks.contractor?.contractor_company_name ?? "",
      time_elapsed: getElapsedTime(state.tasks.createdAt),
      customer_name: state.tasks.customer_name,
      account_number: state.tasks.account_number,
      building_location: state.tasks.building_location,
      building_name: state.tasks.building_name,
      house_no: state.tasks.house_no,
      status: state.tasks.status,
      notes:Array.isArray(state.tasks.notes)
      ? [...state.tasks.notes].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      : [],
      task_completion: state.tasks.task_completion,
    });
  }, [state.tasks]);

  if (!state.tasks || !state.tasks.contractor) {
    return (
      <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen dark:text-gray-300">
        Loading task...
      </div>
    );
  }

  const handleUpdate = async () => {
    if (!newStatus || !comment) return;
  
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${state.tasks._id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, note_text: comment }),
      });
  
      if (res.ok) {
        window.location.reload(); // Refresh the page
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <div className="text-gray-700 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
        <div className="flex justify-end p-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
        <h2 className="text-xl mb-4">Task Information:</h2>
        <div className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Each input box */}
            {[
              { label: "Task", value: data.task_type },
              { label: "Created At", value: data.date },
              { label: "Contractor", value: data.contractor_name },
              { label: "Time Elapsed", value: data.time_elapsed },
              { label: "Customer", value: data.customer_name },
              { label: "Account No", value: data.account_number },
              { label: "Building Name", value: data.building_name },
              { label: "Building Location", value: data.building_location},
              { label: "House Number", value: data.house_no },
              { label: "Status", value: data.status },
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}:
                </label>
                <input
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={field.value}
                  disabled
                />
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl mt-4">Notes:</h2>
        {data.notes.map((note, index) => (
          <div
            key={index}
            className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comments By
                </label>
                <input
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={note.user.full_name}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <input
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formatDate(note.createdAt)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note:</label>
                <textarea
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={note.note_text}
                  disabled
                />
              </div>
            </div>
          </div>
        ))}

        {data.task_completion && (
          <>
        <h2 className="text-xl mt-4">Completion:</h2>

            {data.task_completion.map((completion, index) => (
              <div
                className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow"
                key={index}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Serial Number:
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.serial_number}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      No Sleeve:
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.no_sleeve}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cable Type:
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.cable_type}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cable Length (m):
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.cable_length}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      No ATB:
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.no_atb}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status:
                    </label>
                    <input
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={completion.status}
                      disabled
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Update Task
            </h3>

            <label className="block text-sm font-medium mb-1 dark:text-white">
              Status
            </label>
            <select
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="pending">Rejected</option>
              <option value="in_progress">On Hold</option>
              <option value="completed">Closed</option>
              {/* Add more statuses as needed */}
            </select>

            <label className="block text-sm font-medium mb-1 dark:text-white">
              Comment
            </label>
            <textarea
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Updating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
