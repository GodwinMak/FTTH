import React, { useEffect, useState } from "react";
import UserTable, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
} from "./UserTable";
import { useNavigate } from "react-router-dom";
import { PRODUCTION_URL } from "../../utils/Api";
import axios from "axios";
import EditUserModal from "./EdituserModal";

function User() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = async (user) => {
    const confirm = window.confirm(`Are you sure to delete ${user.name}?`);
    if (!confirm) return;

    try {
      await axios.delete(`${PRODUCTION_URL}/user/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert("Failed to delete user");
      console.error(err);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${PRODUCTION_URL}/user`);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  console.log(users);
  const handleCreateUser = () => {
    navigate("/dashboard/createuser");
  };
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Cell: AvatarCell,
        emailAccessor: "email",
      },
      {
        Header: "Contact",
        accessor: "contact",
      },
      {
        Header: "Role",
        accessor: "role",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => handleDelete(row.original)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    return users
      .filter((user) => user.user_type !== "admin")
      .map((user) => ({
        id: user.id,
        name: user.full_name,
        contact: user.phone_number,
        role: user.user_type,
        email: user.email,
        contractor_id: user.contractor_id || "",
      }));
  }, [users]);

  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 lg:flex-row translate-all duration-300 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">System User Management</h1>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            onClick={handleCreateUser}
          >
            Create User
          </button>
        </div>
        <div className="mt-6">
          <UserTable columns={columns} data={data} />
        </div>
      </main>
      {editModalOpen && (
        <EditUserModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={editUser}
          onUserUpdated={() => {
            // Refresh user list
            axios
              .get(`${PRODUCTION_URL}/user`)
              .then((res) => setUsers(res.data.users));
          }}
        />
      )}
    </div>
  );
}

export default User;
