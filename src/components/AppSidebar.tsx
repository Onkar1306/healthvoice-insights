import { LayoutDashboard, Upload, HelpCircle, LogOut, Activity, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Audio", url: "/upload", icon: Upload },
  { title: "Top Questions", url: "/top-questions", icon: HelpCircle },
  { title: "History", url: "/history", icon: History },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-sidebar-foreground truncate">HealthInsight</h2>
            <p className="text-xs text-sidebar-foreground/60 truncate">Analytics Platform</p>
          </div>
        )}
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/50">Logged in as</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.username}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground/70 hover:text-destructive transition-colors cursor-pointer">
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
