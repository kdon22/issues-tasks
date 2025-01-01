export function AboutCard() {
  return (
    <div className="max-w-md p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome to IssuesTasks</h2>
      <p className="text-gray-300 mb-4">
        A modern issue tracking system designed for teams. Manage projects, track issues, 
        and collaborate effectively.
      </p>
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-center">
          <i className="fas fa-check-circle text-orange-500 mr-2" />
          Streamlined issue management
        </li>
        <li className="flex items-center">
          <i className="fas fa-check-circle text-orange-500 mr-2" />
          Team collaboration tools
        </li>
        <li className="flex items-center">
          <i className="fas fa-check-circle text-orange-500 mr-2" />
          Real-time updates
        </li>
      </ul>
    </div>
  )
} 