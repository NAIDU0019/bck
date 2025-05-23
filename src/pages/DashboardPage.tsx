import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  if (!user) {
    return <div className="text-center mt-10">Loading user...</div>;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.imageUrl}
            alt="User Avatar"
            className="w-28 h-28 rounded-full object-cover shadow-md border-4 border-white"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user.fullName || user.username}!
            </h2>
            <p className="text-gray-500">
              Email: {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-200">
            Add Mobile Number
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-200">
            Order History
          </button>
          <Link to="/">
            <button className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg shadow-md transition duration-200 w-full">
              Go to Home
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
