/** @format */

import { Routes, Route } from "react-router-dom";
import EmailInputPage from "./Pages/EmailInput";
import RegisterUser from "./Pages/RegisterUser";
import Home from "./Pages/Home";

function App() {
  return (
    <>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<EmailInputPage />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
