/** @format */

import { Routes, Route } from "react-router-dom";
import EmailInputPage from "./Pages/EmailInput";
import RegisterUser from "./Pages/RegisterUser";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
function App() {
  return (
    <>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<EmailInputPage />} />
          <Route path="/" element={<EmailInputPage />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
