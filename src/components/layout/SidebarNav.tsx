'use client';

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { LayoutDashboard, ShieldCheck, Smartphone, Settings } from "lucide-react";
import Link from "next/link";

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
    { href: '#', label: 'Handset', icon: Smartphone },
    { href: '#', label: 'Settings', icon: Settings },
]

export default function SidebarNav() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton asChild isActive={pathname === item.href && item.href !== '#'} tooltip={item.label}>
                            <a>
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </a>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}
