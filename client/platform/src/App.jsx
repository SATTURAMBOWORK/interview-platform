import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

/* ADMIN PAGES */
import Dashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import UsersPage from "./pages/admin/Users";
import Subjects from "./pages/admin/Subjects";
import Mcqs from "./pages/admin/Mcqs";
import DsaProblems from "./pages/admin/DsaProblems";
import AddDsaProblem from "./pages/admin/AddDsaProblem";
import EditDsaProblem from "./pages/admin/EditDsaProblem";
import StarQuestions from "./pages/admin/StarQuestions";

/* USER PAGES */
import UserDashboard from "./pages/user/Dashboard";
import SubjectDashboard from "./pages/user/SubjectDashboard";
import Test from "./pages/user/Test";
import Result from "./pages/user/Result";
import AttemptReview from "./pages/user/AttemptReview";
import Register from "./pages/Register";
import DsaSolve from "./pages/user/DsaSolve";
import DsaDashboard from "./pages/user/DsaDashboard";
import StarInterview from "./pages/user/StarInterview";
import Leaderboard from "./pages/user/Leaderboard";
import ResumeScore from "./pages/user/ResumeScore";

function App() {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dsa"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DsaProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="dsa/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddDsaProblem />
            </ProtectedRoute>
          }
        />

        <Route
          path="dsa/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditDsaProblem />
            </ProtectedRoute>
          }
        />

        <Route
          path="subjects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="mcqs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Mcqs />
            </ProtectedRoute>
          }
        />

        <Route
          path="star-questions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StarQuestions />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* USER ROUTES */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/subject/:subjectId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SubjectDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/test/:subjectId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Test />
            </ProtectedRoute>
          }
        />

        <Route
          path="/result/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Result />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attempt/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <AttemptReview />
            </ProtectedRoute>
          }
        />

        {/* ✅ DSA USER ROUTES */}
        <Route
          path="/dsa"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DsaDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dsa/solve/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DsaSolve />
            </ProtectedRoute>
          }
        />

        {/* ✅ STAR INTERVIEW ROUTE */}
        <Route
          path="/star-interview"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <StarInterview />
            </ProtectedRoute>
          }
        />

        {/* ✅ LEADERBOARD ROUTE */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ RESUME ATS SCORE ROUTE */}
        <Route
          path="/resume-score"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ResumeScore />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
