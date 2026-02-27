export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="text-lg text-gray-600">This is a protected route. Only authenticated users can see this.</p>
    </div>
  );
}