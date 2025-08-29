import { RootState } from '@store/index';
import { useGetAgentInquiriesQuery, useRespondToInquiryMutation } from '@store/slices/realEstate';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface PropertyInquiry {
  id: number;
  property: string;
  property_id: string;
  property_title: string;
  user: {
    id: number;
    username: string;
    phone_number: string;
    user_type: string;
  };
  inquiry_type: string;
  inquiry_type_display: string;
  message: string;
  preferred_contact_time: string;
  offered_price: string;
  is_responded: boolean;
  created_at: string;
}

const AgentInquiries = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [selectedInquiryType, setSelectedInquiryType] = useState<string>('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';

  const { data, isLoading, error, refetch } = useGetAgentInquiriesQuery({ token });
  const [respondToInquiry, { isLoading: isResponding }] = useRespondToInquiryMutation();

  const handleRespond = (inquiryId: number) => {
    setSelectedInquiryId(inquiryId);
    setShowResponseModal(true);
    setResponseMessage('');
  };

  const submitResponse = async () => {
    if (!selectedInquiryId || !responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      await respondToInquiry({
        inquiryId: selectedInquiryId.toString(),
        response: responseMessage,
        token
      }).unwrap();

      refetch();
      setShowResponseModal(false);
      setSelectedInquiryId(null);
      setResponseMessage('');
      alert('Response sent successfully');
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      alert('Error responding to inquiry');
    }
  };

  const closeModal = () => {
    setShowResponseModal(false);
    setSelectedInquiryId(null);
    setResponseMessage('');
  };

  const filteredInquiries = data?.results?.filter((inquiry: PropertyInquiry) => {
    if (filter === 'pending' && inquiry.is_responded) return false;
    if (filter === 'responded' && !inquiry.is_responded) return false;
    if (selectedInquiryType && inquiry.inquiry_type !== selectedInquiryType) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading inquiries. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Agent Inquiries</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'responded')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Inquiries</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inquiry Type
            </label>
            <select
              value={selectedInquiryType}
              onChange={(e) => setSelectedInquiryType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="viewing">Schedule Viewing</option>
              <option value="info">Request Information</option>
              <option value="offer">Make Offer</option>
              <option value="callback">Request Callback</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Total Inquiries</h3>
            <p className="text-2xl font-bold text-blue-700">{data?.count || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900">Pending</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {data?.results?.filter(inquiry => !inquiry.is_responded).length || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Responded</h3>
            <p className="text-2xl font-bold text-green-700">
              {data?.results?.filter(inquiry => inquiry.is_responded).length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No inquiries found matching your filters.</p>
          </div>
        ) : (
          filteredInquiries?.map((inquiry: PropertyInquiry) => (
            <div
              key={inquiry.id}
              className={`bg-white border rounded-lg shadow-sm p-6 ${
                !inquiry.is_responded ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-green-400'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inquiry.property_title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Property ID: {inquiry.property_id}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inquiry.is_responded
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {inquiry.is_responded ? 'Responded' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Contact</p>
                  <p className="text-sm text-gray-900">{inquiry.user.username}</p>
                  <p className="text-sm text-gray-600">{inquiry.user.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Inquiry Type</p>
                  <p className="text-sm text-gray-900">{inquiry.inquiry_type_display}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(inquiry.created_at).toLocaleDateString()} at{' '}
                    {new Date(inquiry.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {inquiry.offered_price && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Offered Price</p>
                    <p className="text-sm text-gray-900">${inquiry.offered_price}</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Message</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {inquiry.message}
                </p>
              </div>

              {inquiry.preferred_contact_time && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Preferred Contact Time</p>
                  <p className="text-sm text-gray-900">{inquiry.preferred_contact_time}</p>
                </div>
              )}

              <div className="flex justify-end">
                {!inquiry.is_responded && (
                  <button
                    onClick={() => handleRespond(inquiry.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Respond to Inquiry
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Respond to Inquiry</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response Message
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response to the client..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={isResponding || !responseMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResponding ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentInquiries;
