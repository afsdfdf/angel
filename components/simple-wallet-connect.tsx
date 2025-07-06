'use client';

import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { useAuth } from "@/lib/auth-context"

interface SimpleWalletConnectProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function SimpleWalletConnect({ onConnect, onDisconnect, className }: SimpleWalletConnectProps) {
  const { isConnected, isLoading, error, connectWallet, disconnectWallet } = useWallet()
  const { user } = useAuth()

  const handleConnect = async () => {
    await connectWallet()
    onConnect?.()
  }

  const handleDisconnect = () => {
    disconnectWallet()
    onDisconnect?.()
  }

  if (isConnected) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className={className}
      >
        <LogOut className="w-4 h-4 mr-2" />
        断开钱包
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className={className}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isLoading ? "连接中..." : "连接钱包"}
    </Button>
  )
} 