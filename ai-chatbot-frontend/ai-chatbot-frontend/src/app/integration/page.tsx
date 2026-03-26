import React from "react";

export default function IntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Widget Integration Guide
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How to Integrate the Chatbot Widget
              </h2>
              <p className="text-gray-600 text-lg">
                Follow these simple steps to add the ScopeAIChat to your
                website.
              </p>
            </div>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Add Configuration Script
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Add this configuration script to your website&apos;s HTML,
                preferably in the &lt;head&gt; section:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm">
                  {`<script>
  window.AIChatbotConfig = {
    tenant: 'your-tenant-slug',
    apiUrl: 'https://your-api-domain.com/api',
    customCSS: \`
      .chatbot-widget {
        /* Your custom styles */
      }
    \`,
    onLoad: function() {
      console.log('Chatbot loaded');
    },
    onMessage: function(message, response) {
      // Track analytics
      gtag('event', 'chatbot_message', {
        'message_length': message.length
      });
    }
  };
</script>`}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Load Widget Script
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Add the widget script before the closing &lt;/body&gt; tag:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm">
                  {`<script src="https://your-frontend-domain.com/widget.js" async></script>`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Example
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Here&apos;s a complete HTML example:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm">
                  {`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>

    <!-- ScopeAIChatbot Configuration -->
    <script>
      window.AIChatbotConfig = {
        tenant: 'techcorp',
        apiUrl: 'https://api-scopeaichat.scopethinkers.ai/api/v1'
      };
    </script>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Your website content goes here...</p>

    <!-- ScopeAIChat Widget -->
    <script src="/widget.js" async></script>
</body>
</html>`}
                </pre>
              </div>
            </div>

            {/* Configuration Options */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Configuration Options
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Option
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        tenant
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Your tenant slug identifier
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        apiUrl
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Base URL for the chatbot API
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        customCSS
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Custom CSS styles for the widget
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        onLoad
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        function
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Callback function called when widget loads
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        onMessage
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        function
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Callback function called on message exchange
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        onError
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        function
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Callback function called on errors
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Testing */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Testing Your Integration
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Important:</strong> Make sure your backend API is
                      running and accessible before testing the widget. The
                      widget will show an error if it cannot connect to the API.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600">
                If you encounter any issues during integration, please check:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Your tenant slug is correct and active</li>
                <li>The API URL is reachable from your domain</li>
                <li>CORS is properly configured for your domain</li>
                <li>Your website is served over HTTPS (for production)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
