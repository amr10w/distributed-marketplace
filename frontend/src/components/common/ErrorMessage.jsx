const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
      <p className="font-medium">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default ErrorMessage
