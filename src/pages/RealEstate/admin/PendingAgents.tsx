import { RootState } from "@store/index";
import {
  useGetPendingAgentApplicationsQuery,
  useVerifyAgentMutation,
} from "@store/slices/realEstate";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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
  const [verify_agent] = useVerifyAgentMutation();
  const token = userInfo?.token || "";
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, refetch } =
    useGetPendingAgentApplicationsQuery({
      token,
      page: currentPage,
    });
  const { t, i18n } = useTranslation();
  const pendingAgents: PendingAgentsResponse | undefined = data;

  const formatDate = (dateString: string) => {
    const locale =
      i18n.language === "ru"
        ? "ru-RU"
        : i18n.language === "uz"
        ? "uz-UZ"
        : "en-US";

    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const handleApproveAgent = async (agentId: string, action: string) => {
    const token = userInfo?.token;

    if (!token) {
      toast.error(t("errors.authentication_required"), { autoClose: 3000 });
      return;
    }

    if (agentId === "" || action === "") {
      toast.error(t("errors.missing_required_fields"), { autoClose: 3000 });
      return;
    }

    try {
      // Convert agentId to number if your API expects it
      const agentIdNumber = parseInt(agentId, 10);

      if (isNaN(agentIdNumber)) {
        toast.error(t("errors.invalid_agent_id"), { autoClose: 3000 });
        return;
      }

      await verify_agent({
        agentId: agentIdNumber,
        action,
        token,
      }).unwrap();

      // Show success message based on action
      if (action === "approve") {
        toast.success(t("success.agent_approved"), { autoClose: 3000 });
      } else if (action === "reject") {
        toast.success(t("success.agent_rejected"), { autoClose: 3000 });
      }

      // Refresh the data to update the list
      refetch();
    } catch (error: any) {
      // Handle error
      "Error verifying agent:", error;
      toast.error(
        error?.data?.message || t("errors.agent_verification_failed"),
        { autoClose: 3000 }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">{t("loading_pending_applications")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">
          {t("error_loading_applications")}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t("pending_agents")}
        </h1>
        <p className="text-gray-600">
          {t("total_pending_applications")}
          {pendingAgents?.count || 0}
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
                      {t("pending_verification")}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("applied_date")}
                      {formatDate(agent.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("contact_info")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {agent.user.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("license_number")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {agent.licence_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("years_experience")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {agent.years_experience}
                      {t("years_suffix")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("total_sales")}
                    </p>
                    <p className="text-sm text-gray-600">{agent.total_sales}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {t("specialization")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {agent.specialization}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleApproveAgent(agent.id.toString(), "approve")
                    }
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    {t("approve")}
                  </button>
                  <button
                    onClick={() =>
                      handleApproveAgent(agent.id.toString(), "reject")
                    }
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    {t("reject")}
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
                {t("previous")}
              </button>

              <span className="text-sm text-gray-600">
                {t("page")}
                {currentPage}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!pendingAgents.next}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("next")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {t("no_pending_applications")}
          </div>
          <p className="text-gray-400 mt-2">
            {t("all_applications_processed")}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentVerificationPending;
