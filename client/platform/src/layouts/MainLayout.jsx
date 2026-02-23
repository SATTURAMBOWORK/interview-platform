import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isDsaSolve = location.pathname.startsWith("/dsa/solve");
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isDsaDashboard = location.pathname.startsWith("/dsa");
  const isFullWidth =
    isDsaSolve ||
    isDashboard ||
    isDsaDashboard ||
    location.pathname.startsWith("/test/") ||
    location.pathname.startsWith("/result/") ||
    location.pathname.startsWith("/attempt/") ||
    location.pathname.startsWith("/star-interview");

  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-800">
      <main
        className={
          isDsaSolve
            ? "w-full max-w-none p-0 h-screen"
            : isFullWidth
            ? "w-full max-w-none p-0"
            : "max-w-6xl mx-auto px-6 py-8"
        }
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
