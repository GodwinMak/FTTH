import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";

const ApproveTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskId = location.state?.id;

  const [taskLoading, setTaskLoading] = useState(true);
  const [data, setData] = useState({
    task_type: "",
    date: "",
    contractor_name: "",
    time_elapsed: "",
    customer_name: "",
    account_number: "",
    building_name: "",
    house_no: "",
    status: "",
    notes: [],
    task_completion: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format elapsed time from date
  function getElapsedTime(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / 1000);

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${
        hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : ""
      }`;
    } else if (hours > 0) {
      return `${hours} hr${hours > 1 ? "s" : ""} ${
        minutes > 0 ? `${minutes} min` : ""
      }`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return `${seconds} sec`;
    }
  }

  // Format date to DD-MM-YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch task by id from API
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      setTaskLoading(true);
      try {
        const res = await axios.get(`${PRODUCTION_URL}/task/${taskId}`);
        const task = res.data;
        console.log(task)
        setData({
          task_type: task.task_type,
          date: formatDate(task.createdAt),
          contractor_name: task.contractor?.contractor_company_name ?? "",
          time_elapsed: getElapsedTime(task.createdAt),
          customer_name: task.customer_name,
          account_number: task.account_number,
          building_location: task.building_location,
          building_name: task.building_name,
          house_no: task.house_no,
          status: task.status,
          notes: Array.isArray(task.notes)
            ? [...task.notes].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )
            : [],
          task_completion: task.task_completion ?? [],
        });
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setTaskLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!taskId) {
    return (
      <div className="text-gray-500 p-4 mt-14 min-h-screen">
        Task ID not found. Please navigate from the tasks list.
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div className="text-gray-500 p-4 mt-14 min-h-screen">
        Loading task data...
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      await axios.post(
        `${PRODUCTION_URL}/task/approve/${data.task_completion.id}`,
        { status: "Accepted" }
      );

      alert("Task approved successfully!");
      navigate("/dashboard/pendingapproval"); // Redirect to tasks list after approval
      // Optionally redirect or show success message
    } catch (error) {
      console.error("Failed to approve task:", error);
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(
        `${PRODUCTION_URL}/task/approve/${data.task_completion.id}`,
        { status: "Rejected" }
      );
      alert("Task rejected successfully!");
      navigate("/dashboard/pendingapproval"); // Redirect to tasks list after rejection
      // Optionally redirect or show success message
    } catch (error) {
      console.error("Failed to reject task:", error);
    }
  };

  const openModal = (imgUrl) => {
    setSelectedImage(imgUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="text-gray-700 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
      <div className="flex justify-end p-4 gap-3">
        <button
          onClick={handleApprove}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reject
        </button>
      </div>

      <h2 className="text-xl mb-4">Task Information:</h2>
      <div className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Task", value: data.task_type },
            { label: "Created At", value: data.date },
            { label: "Contractor", value: data.contractor_name },
            { label: "Time Elapsed", value: data.time_elapsed },
            { label: "Customer", value: data.customer_name },
            { label: "Account No", value: data.account_number },
            { label: "Building Name", value: data.building_name },
            { label: "Building Location", value: data.building_location },
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
      {data.notes.length > 0 ? (
        data.notes.map((note, index) => (
          <div
            key={index}
            className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mb-4"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Note:</label>
                <textarea
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={note.note_text}
                  disabled
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No notes available.</p>
      )}

      <h2 className="text-xl mt-4">Completion:</h2>
      {data.task_completion &&
      typeof data.task_completion === "object" &&
      !Array.isArray(data.task_completion) ? (
        <div className="mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Serial Number:
              </label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.serial_number || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                No Sleeve:
              </label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.no_sleeve || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cable Type:
              </label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.cable_type || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cable Length (m):
              </label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.cable_length || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No ATB:</label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.no_atb || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status:</label>
              <input
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={data.task_completion.status || ""}
                disabled
              />
            </div>
            {Array.isArray(data.task_completion.image_urls) &&
              data.task_completion.image_urls.length > 0 && (
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Uploaded Images:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.task_completion.image_urls.map((url, idx) => (
                      // console.log(`${PRODUCTION_URL}${url}`)
                      <div
                        key={idx}
                        className="border rounded overflow-hidden shadow"
                      >
                        <img
                          src={`${PRODUCTION_URL}${url}`}
                          alt={`Task Image ${idx + 1}`}
                          className="w-full h-80 object-cover"
                          onClick={() => openModal(`${PRODUCTION_URL}/${url}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      ) : (
        <p>Order Not Completed.</p>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-2xl font-bold"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Zoomed"
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveTask;
