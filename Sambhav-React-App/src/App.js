import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import MyComponent from "./pages/viewDashboard";
import { id as myComponentId } from "./pages/viewDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/home";
import DashboardContainer from "./pages/dashboardContainer";
import ProjectDataLog from "./pages/projectDataLog";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<DashboardContainer />} />
        <Route path="/projectdataLog" element={<ProjectDataLog />} />
        <Route
          path={`/superset/dashboard/${myComponentId}`}
          element={<MyComponent />}
        />
      </Routes>
    </>
  );
}

export default App;
