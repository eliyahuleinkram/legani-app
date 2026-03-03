"use client";

import { Chat } from '../components/Chat';
import { Suspense } from 'react';

function ChatContent() {
    return (
        <main className="min-h-[100dvh] bg-black">
            <Chat fullScreen={true} />
        </main>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-[100dvh] bg-black"></div>}>
            <ChatContent />
        </Suspense>
    );
}
