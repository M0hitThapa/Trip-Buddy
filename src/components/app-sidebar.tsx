import * as React from "react";
import { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  TicketsPlane,
  Settings,
  Radar,
} from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/create-new-trip",
      icon: LayoutDashboardIcon,
    },

    {
      title: "Trips",
      url: "/trips",
      icon: TicketsPlane,
    },
    {
      title: "Explore",
      url: "/explore",
      icon: Radar,
    },

    {
      title: "Setting",
      url: "/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="border-b">
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="  flex  size-8 items-center justify-center rounded-lg">
                  <div className="">
                    <svg
                      className="w-8 h-8 text-neutral-950"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-black text-2xl text-shadow-2xs">
                    TripBuddy
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem
                  key={item.title}
                  className="hover:bg-neutral-200 py-1 rounded transition duration-200"
                >
                  <Link href={item.url}>
                    <SidebarMenuButton className="text-md font-semibold text-neutral-600">
                      <Icon className="size-5 " />
                      {item.title}{" "}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
