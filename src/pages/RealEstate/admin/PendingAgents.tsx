import { RootState } from "@store/index";
import { useGetPendingAgentApplicationsQuery } from "@store/slices/realEstate";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

interface Agent {
  id: number;
  user: User;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: string;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
}

interface PendingAgentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Agent[];
}

const AgentVerificationPending = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';
  const [currentPage, setCurrentPage] = useState(1);
   const navigate = useNavigate();

  const { data, isLoading, error } = useGetPendingAgentApplicationsQuery({
    token,
    page: currentPage
  });

  const pendingAgents: PendingAgentsResponse | undefined = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePreviousPage = () => {
    if (pendingAgents?.previous && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pendingAgents?.next) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading pending applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">Error loading applications</div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Agents</h1>
        <p className="text-gray-600">
          Total pending applications: {pendingAgents?.count || 0}
        </p>
      </div>

      {pendingAgents?.results && pendingAgents.results.length > 0 ? (
        <>
          <div className="grid gap-6">
            {pendingAgents.results.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {agent.user.username}
                    </h3>
                    <p className="text-gray-600">{agent.agency_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied: {formatDate(agent.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Contact Info</p>
                    <p className="text-sm text-gray-600">{agent.user.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">License Number</p>
                    <p className="text-sm text-gray-600">{agent.licence_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Years of Experience</p>
                    <p className="text-sm text-gray-600">{agent.years_experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Sales</p>
                    <p className="text-sm text-gray-600">{agent.total_sales}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Specialization</p>
                  <p className="text-sm text-gray-600">{agent.specialization}</p>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(pendingAgents.previous || pendingAgents.next) && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={!pendingAgents.previous}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!pendingAgents.next}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No pending applications found</div>
          <p className="text-gray-400 mt-2">All agent applications have been processed</p>
        </div>
      )}
    </div>
  );
};

export default AgentVerificationPending;
