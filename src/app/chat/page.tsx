
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChat from "@/components/chat/AIChat";
import AllUsersChat from "@/components/chat/AllUsersChat";

export default function ChatPage() {
    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col">
            <Tabs defaultValue="ai" className="h-full flex flex-col">
                <div className="flex justify-center">
                    <TabsList>
                        <TabsTrigger value="ai">AI Chat</TabsTrigger>
                        <TabsTrigger value="all">All Users</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="ai" className="flex-1 h-full mt-4">
                    <AIChat />
                </TabsContent>
                <TabsContent value="all" className="flex-1 h-full mt-4">
                    <AllUsersChat />
                </TabsContent>
            </Tabs>
        </div>
    )
}
