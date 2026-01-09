import React, { useState, useRef, useEffect } from 'react';
import { User, Plus, ChevronDown, Check, LogOut } from 'lucide-react';
import { storage } from '../utils/storage';

interface ProfileSelectorProps {
  currentProfile: string;
  onProfileChange: (name: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ currentProfile, onProfileChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [profiles, setProfiles] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfiles(storage.getProfiles());
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      storage.addProfile(newProfileName.trim());
      onProfileChange(newProfileName.trim());
      setNewProfileName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-medium text-slate-200"
      >
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
          {currentProfile.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[100px] truncate">{currentProfile}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">My Accounts</p>
            {isCreating ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Account Name"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newProfileName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-1 disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Create New Account
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile}
                onClick={() => {
                  onProfileChange(profile);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  currentProfile === profile ? 'bg-slate-800/50 text-white' : 'text-slate-400'
                }`}
              >
                <span className="truncate">{profile}</span>
                {currentProfile === profile && <Check className="w-3 h-3 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};