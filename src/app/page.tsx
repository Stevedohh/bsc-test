'use client'

import { ConnectButton } from "@/components/core/ConnectButton";
import { SwapForm } from "@/components/core/SwapForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white relative">
      <div className="h-16 flex justify-end items-start p-6 pb-0">
        <ConnectButton/>
      </div>

      <div className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-2xl">
          <SwapForm/>
        </div>
      </div>
    </div>
  )
}
