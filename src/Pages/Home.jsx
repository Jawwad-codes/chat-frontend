/** @format */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, logoutUser } from "@/api/auth";
import {
  getConversations,
  createConversation,
  deleteConversation,
} from "@/api/chat";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  MessageSquare,
  LogOut,
  Plus,
  Search,
  Menu,
  Settings,
  X,
  Home as HomeIcon,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
} from "lucide-react";

// Components
import ConversationCard from "@/components/ConversationCard";
import CreateConversationModal from "@/components/CreateConversationModal";
import EditProfile from "@/components/EditProfile";

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Queries
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const user = profileData?.data?.user;

  const { data: convData, isLoading: loadingConvos } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
  const conversations = convData?.data?.conversations || [];

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.clear();
      navigate("/");
    },
  });

  const createConvMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      toast.success("Conversation created");
      queryClient.invalidateQueries(["conversations"]);
      setIsCreateModalOpen(false);
      if (data?.data?._id) navigate(`/chat/${data.data._id}`);
    },
    onError: () => toast.error("Failed to create conversation"),
  });

  const deleteconvMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      toast.success("Conversation deleted");
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: () => toast.error("Failed to delete conversation"),
  });

  // Handlers
  const handleConversationClick = (conversation) => {
    navigate(`/chat/${conversation._id}`);
    setMobileMenuOpen(false);
  };

  if (loadingProfile || loadingConvos) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out z-20 shadow-xl
        ${sidebarExpanded ? "w-64" : "w-20"}`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800/50">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarExpanded ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-3">
          <NavItem
            icon={<HomeIcon size={22} />}
            label="Home"
            expanded={sidebarExpanded}
            active
            onClick={() => {}}
          />
          <NavItem
            icon={<MessageSquare size={22} />}
            label="Chats"
            expanded={sidebarExpanded}
            onClick={() => {}}
          />
          <div className="my-2 border-t border-slate-800/50" />
          <NavItem
            icon={<Settings size={22} />}
            label="Settings"
            expanded={sidebarExpanded}
            onClick={() => setIsEditModalOpen(true)}
          />
        </nav>

        <div className="p-3 border-t border-slate-800/50 bg-slate-900/50">
          <div
            className={`flex items-center gap-3 ${
              sidebarExpanded ? "justify-start px-2" : "justify-center"
            }`}
          >
            <img
              src={
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-600 cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            />

            {sidebarExpanded && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            )}

            {sidebarExpanded && (
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>

          {!sidebarExpanded && (
            <button
              onClick={() => logoutMutation.mutate()}
              className="mt-4 w-full flex justify-center text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <MessageCircle size={18} className="fill-current" />
            </div>
            <span className="font-semibold text-slate-800">ChatApp</span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 bg-gray-50 rounded-full hover:bg-emerald-50 text-gray-600 hover:text-emerald-600"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full lg:w-[380px] flex flex-col bg-white border-r border-gray-200 h-full">
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Messages
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 h-8 px-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus size={16} className="mr-1.5" /> New Chat
                </Button>
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {conversations.length > 0 ? (
                <div className="flex flex-col">
                  {conversations.map((conv) => (
                    <ConversationCard
                      key={conv._id}
                      conversation={conv}
                      onClick={handleConversationClick}
                      onDelete={deleteconvMutation.mutate}
                      user={user}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Start a new conversation to connect with people.
                  </p>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Start Conversation
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gray-50/50 relative overflow-hidden">
            <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>

            <div className="relative z-10 text-center max-w-md px-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto w-24 h-24 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-6">
                <MessageCircle
                  size={48}
                  className="text-emerald-500 fill-emerald-50"
                />
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">
                Welcome, {user?.username}!
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Select a chat from the left or start a new one. <br />
                Connect instantly, share freely.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-8 py-6 text-base rounded-xl"
                >
                  <Plus size={20} className="mr-2" /> Start New Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden bg-white border-t border-gray-200 pb-safe">
          <div className="flex justify-around items-center h-16">
            <MobileNavItem
              icon={<HomeIcon size={24} />}
              label="Home"
              active
              onClick={() => {}}
            />
            <MobileNavItem
              icon={<MessageSquare size={24} />}
              label="Chats"
              onClick={() => setMobileMenuOpen(true)}
            />
            <div className="relative -top-5">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
              >
                <Plus size={28} />
              </button>
            </div>
            <MobileNavItem
              icon={<Settings size={24} />}
              label="Settings"
              onClick={() => setIsEditModalOpen(true)}
            />
            <MobileNavItem
              icon={<Menu size={24} />}
              label="Menu"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* mobile menu modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            <div className="flex items-center gap-4 mb-8">
              <img
                src={
                  user?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="User"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {user?.username}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <MenuButton
                icon={<Settings size={20} />}
                label="Account Settings"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
              />
              <MenuButton
                icon={<LogOut size={20} />}
                label="Log Out"
                color="text-red-600"
                onClick={() => logoutMutation.mutate()}
              />
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 py-6 rounded-xl border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Close Menu
            </Button>
          </div>
        </div>
      )}

      <CreateConversationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createConvMutation.mutate}
        isLoading={createConvMutation.isPending}
        user={user}
      />

      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
}

const NavItem = ({ icon, label, expanded, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
            flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
            ${
              active
                ? "bg-emerald-600/10 text-emerald-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }
            ${expanded ? "w-full" : "justify-center w-full"}
        `}
    title={!expanded ? label : ""}
  >
    <span className={active ? "text-emerald-400" : "group-hover:text-white"}>
      {icon}
    </span>
    {expanded && (
      <span className="font-medium text-sm whitespace-nowrap">{label}</span>
    )}
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-16 gap-1"
  >
    <span
      className={`transition-colors ${
        active ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      {icon}
    </span>
    <span
      className={`text-[10px] font-medium ${
        active ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </button>
);

const MenuButton = ({ icon, label, onClick, color = "text-slate-700" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${color}`}
  >
    <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
    <span className="font-medium">{label}</span>
  </button>
);
