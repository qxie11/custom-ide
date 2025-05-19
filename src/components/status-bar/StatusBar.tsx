"use client";

import { GitBranch, CheckCircle, AlertTriangle, Bell, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
      }, 1000);

      setCurrentTime(new Date().toLocaleTimeString()); // Initial time

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(timer);
      };
    }
  }, []);


  return (
    <div className="h-6 bg-status-bar-background text-status-bar-foreground flex items-center justify-between px-3 text-xs select-none border-t border-border">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">
          <GitBranch className="h-3.5 w-3.5" />
          <span>main</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">
          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
          <span>No Problems</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">UTF-8</span>
        <span className="hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">LF</span>
        <span className="hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">JavaScript</span>
         <span className="hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">Prettier</span>
        <div className="flex items-center space-x-1 hover:bg-white/10 p-0.5 rounded-sm cursor-pointer" title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5 text-orange-400" />}
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 p-0.5 rounded-sm cursor-pointer">
          <Bell className="h-3.5 w-3.5" />
        </div>
        <div className="w-16 text-right">
          {currentTime}
        </div>
      </div>
    </div>
  );
}
