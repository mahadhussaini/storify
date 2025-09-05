'use client'

import { useSocket } from '@/lib/socket-context'
import { useEffect, useState } from 'react'

export function ConnectionStatus() {
  const { isConnected, socket } = useSocket()
  const [serverHealth, setServerHealth] = useState<'checking' | 'healthy' | 'unhealthy'>('checking')

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/health')
        if (response.ok) {
          setServerHealth('healthy')
        } else {
          setServerHealth('unhealthy')
        }
      } catch (error) {
        setServerHealth('unhealthy')
      }
    }

    checkServerHealth()
    const interval = setInterval(checkServerHealth, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!isConnected || serverHealth === 'unhealthy') return 'bg-red-500'
    if (serverHealth === 'healthy') return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const getStatusText = () => {
    if (serverHealth === 'checking') return 'Checking server...'
    if (!isConnected) return 'Disconnected'
    if (serverHealth === 'unhealthy') return 'Server offline'
    return 'Connected'
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 dark:bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm">{getStatusText()}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Socket: {isConnected ? '✅' : '❌'} | Server: {
          serverHealth === 'healthy' ? '✅' :
          serverHealth === 'unhealthy' ? '❌' : '⏳'
        }
      </div>
    </div>
  )
}
