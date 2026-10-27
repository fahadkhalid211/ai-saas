'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useEffect, useRef } from 'react';
import { showErrorModal } from '@/lib/ui/notify';
import { SaveButton } from '@/components/ui/SaveButton';
import {
  User,
  Shield,
  KeyRound,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Mail,
  Building,
  Calendar,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export interface UserProfileData {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  authProvider?: 'email' | 'google' | 'sso';
  googleConnected?: boolean;
  googleEmail?: string;
  googleId?: string;
  googleConnectedAt?: string;
  hasPassword?: boolean;
}

export interface WorkspaceData {
  id: string;
  name: string;
  planId?: string;
  planName?: string;
}

interface ProfileTabProps {
  currentUser?: UserProfileData | null;
  onProfileUpdated?: (updated: UserProfileData) => void;
}

/** A password box with a button that shows or hides what was typed, so a typo in a new password can be seen and fixed. */
function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
}) {
  const __t = useT();
  const [shown, setShown] = useState(false);
  const label = shown ? __t('Hide password') : __t('Show password');
  return (
    <div className="relative">
      <input
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
        required={required}
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={label}
        aria-pressed={shown}
        title={label}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer"
      >
        {shown ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function ProfileTab({ currentUser, onProfileUpdated }: ProfileTabProps) {
  const __t = useT();
  const [profile, setProfile] = useState<UserProfileData | null>(currentUser || null);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!currentUser);

  // Form states
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [title, setTitle] = useState<string>(currentUser?.title || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.avatarUrl || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPasswordSection, setShowPasswordSection] = useState<boolean>(false);

  // Status feedback
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Delete account
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteEmail, setDeleteEmail] = useState<string>('');
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState<boolean>(false);

  // Check for URL query params on redirect from Google OAuth (e.g. ?connected=google)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('connected') === 'google') {
        setProfileSuccessMsg('Your Google account has been successfully connected for 1-click login!');
        const newUrl = window.location.pathname + (params.get('tab') ? `?tab=${params.get('tab')}` : '');
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => setProfileSuccessMsg(null), 6000);
      } else if (params.get('error')) {
        setProfileErrorMsg(params.get('error'));
        const newUrl = window.location.pathname + (params.get('tab') ? `?tab=${params.get('tab')}` : '');
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => setProfileErrorMsg(null), 6000);
      }
    }
  }, []);

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/oauth/google?action=connect';
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect your Google account from login?')) return;
    setIsDisconnectingGoogle(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect_google' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to disconnect Google account.');
      }
      setProfile(data.member);
      setProfileSuccessMsg('Google account disconnected successfully.');
      if (onProfileUpdated) onProfileUpdated(data.member);
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Error disconnecting Google account.');
      setTimeout(() => setProfileErrorMsg(null), 5000);
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setProfile(data.member);
          setName(data.member.name || '');
          setTitle(data.member.title || '');
          setAvatarUrl(data.member.avatarUrl || '');
          setAvatarPreview(data.member.avatarUrl || '');
        }
        if (data.workspace) {
          setWorkspace(data.workspace);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      fetchProfile();
    } else {
      setProfile(currentUser);
      setName(currentUser.name || '');
      setTitle(currentUser.title || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setAvatarPreview(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  // Handle local image file upload and conversion to base64 data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Selected file must be a valid image (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setProfileErrorMsg('Image size must be smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result);
      setProfileErrorMsg(null);
    };
    reader.onerror = () => {
      setProfileErrorMsg('Failed to process uploaded image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle personal information save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileErrorMsg('Full Name cannot be empty.');
      showErrorModal({ title: 'Name is required', message: 'Full Name cannot be empty.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setProfile(data.member);
      setProfileSuccessMsg('Profile details updated successfully.');
      if (onProfileUpdated) {
        onProfileUpdated(data.member);
      }
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Error updating profile.');
      showErrorModal({ title: "Profile wasn't saved", message: err?.message || 'Error updating profile.' });
      setTimeout(() => setProfileErrorMsg(null), 5000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Delete the account for good (the server wipes the workspace if this is its owner)
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: deleteEmail, password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete the account.');
      window.location.href = '/login?message=' + encodeURIComponent('Your account has been permanently deleted.');
    } catch (err: any) {
      setDeleteError(err?.message || 'Could not delete the account.');
      setIsDeleting(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    if (profile?.hasPassword && !currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPasswordSuccessMsg('Password updated successfully. Use your new password on your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      setPasswordErrorMsg(err?.message || 'Error changing password.');
      setTimeout(() => setPasswordErrorMsg(null), 5000);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getInitials = (text?: string): string => {
    if (!text) return 'U';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium"><T>Loading profile credentials...</T></span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            <T>Account &amp; User Profile</T>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <T>Manage your personal profile, professional role title, avatar, and account authentication credentials.</T>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {profile?.role === 'owner' ? <T>{'Workspace Owner'}</T> : profile?.role === 'admin' ? <T>{'Administrator'}</T> : <T>{'Team Member'}</T>}
          </span>
          {workspace && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <T>{workspace.name}</T>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name || 'User Profile'}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarPreview('')}
                  />
                ) : (
                  <span>{getInitials(name || profile?.name)}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition cursor-pointer"
                title={__t("Upload Profile Picture")}
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {name || profile?.name || <T>{'Your Name'}</T>}
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {title || <T>{profile?.title}</T> || <T>{'Professional Title Not Set'}</T>}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {profile?.email || <T>{'user@crescelo.com'}</T>}
              </p>
            </div>

            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span><T>Remove Profile Picture</T></span>
              </button>
            )}

            <div className="w-full mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <T>Role</T>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {profile?.role || <T>{'Member'}</T>}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  <T>Login Method</T>
                </span>
                {profile?.googleConnected ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    <GoogleIcon className="h-3.5 w-3.5" />
                    <span><T>Connected from Google</T></span>
                  </span>
                ) : (
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    <T>Email &amp; Password</T>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <T>Workspace</T>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={workspace?.name}>
                  {workspace?.name || <T>{'Workspace'}</T>}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <T>Member Since</T>
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : <T>{'Active'}</T>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Security Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  <T>Personal Information</T>
                </h3>
              </div>
              <span className="text-[11px] text-slate-400"><T>Updates reflected across your team</T></span>
            </div>

            {profileSuccessMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Full Name</T>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={__t("e.g. Alex Morgan")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Professional Role / Title</T>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={__t("e.g. Master Barber, Managing Director, Head of Legal")}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-3.5 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    />
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <T>Email Address</T>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 pl-3.5 pr-8 py-2.5 text-xs text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                  />
                  <Mail className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  <T>Account email address is verified and permanently linked to your workspace authorization.</T>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <T>Profile Picture URL (Optional)</T>
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setAvatarPreview(e.target.value);
                  }}
                  placeholder={__t("https://example.com/avatar.jpg or upload via camera icon")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
                <p className="text-[11px] text-slate-400">
                  <T>You can paste a direct web image URL or click the camera button on your avatar to upload from your device.</T>
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <SaveButton type="submit" saving={isSavingProfile} error={profileErrorMsg} idleLabel="Save Profile Changes" savingLabel="Saving Changes…" savedLabel="Profile Saved" className="px-5 py-2.5" />
              </div>
            </form>
          </div>

          {/* Google Sign-In & Connected Accounts Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="h-4 w-4" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  <T>Google Sign-In &amp; Connected Accounts</T>
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                profile?.googleConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {profile?.googleConnected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span><T>Connected</T></span>
                  </>
                ) : (
                  <span><T>Not Connected</T></span>
                )}
              </span>
            </div>

            {profile?.googleConnected ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs shrink-0">
                      <GoogleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Google</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          <T>Connected</T>
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                        {profile.googleEmail || profile.email}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <T>You are connected from Google. 1-click Google Sign-In is active for your account.</T>
                      </p>
                    </div>
                  </div>

                  {profile.hasPassword && (
                    <button
                      type="button"
                      disabled={isDisconnectingGoogle}
                      onClick={handleDisconnectGoogle}
                      className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shrink-0"
                    >
                      {isDisconnectingGoogle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <T>Disconnect</T>}
                    </button>
                  )}
                </div>

                {!profile.hasPassword && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <T>You signed up through Google. If you want to also log in with email and password, you can set a password in the section below.</T>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                      <GoogleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Google</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          <T>Not linked</T>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        <T>Connect your Google account to enable instant, 1-click login without typing your password.</T>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer shrink-0"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    <span><T>Connect Google Account</T></span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Password Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  <T>Security &amp; Password</T>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {showPasswordSection ? (
                  <T>{'Cancel'}</T>
                ) : profile?.hasPassword ? (
                  <T>{'Change Password'}</T>
                ) : (
                  <T>{'Set Password'}</T>
                )}
              </button>
            </div>

            {passwordSuccessMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {showPasswordSection ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {profile?.hasPassword && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <T>Current Password / Admin Key</T>
                    </label>
                    <PasswordField value={currentPassword} onChange={setCurrentPassword} placeholder={__t("Enter your current password")} autoComplete="current-password" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <T>New Password</T>
                    </label>
                    <PasswordField value={newPassword} onChange={setNewPassword} placeholder={__t("Minimum 6 characters")} autoComplete="new-password" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <T>Confirm New Password</T>
                    </label>
                    <PasswordField value={confirmPassword} onChange={setConfirmPassword} placeholder={__t("Confirm new password")} autoComplete="new-password" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span><T>Updating Password...</T></span>
                      </>
                    ) : (
                      <span><T>Update Password</T></span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    <T>Account Password</T>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    <T>Secures your personal login and authorized workspace access.</T>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  {profile?.hasPassword ? <T>Change</T> : <T>Set Password</T>}
                </button>
              </div>
            )}
          </div>

          {/* Delete account */}
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Trash2 className="h-4 w-4 text-rose-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  <T>Delete account</T>
                </h3>
              </div>
              {!showDelete && (
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition cursor-pointer"
                >
                  <T>Delete my account</T>
                </button>
              )}
            </div>
            {!showDelete ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {profile?.role === 'owner' ? <T>Permanently removes this account and all its data.</T> : <T>Permanently removes your sign-in from this workspace.</T>}
              </p>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div role="alert" className="flex gap-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-900 dark:text-rose-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                  <div className="space-y-1.5">
                    <p className="font-bold">
                      <T>This can never be restored.</T>
                    </p>
                    {profile?.role === 'owner' ? (
                      <>
                        <p><T>This permanently deletes the account and everything in it: your assistants, uploaded documents and search index, conversations, leads, appointments, landing pages, team members and settings.</T></p>
                        <p><T>Your team members lose access too. Any paid subscription is cancelled first. Payment records may be kept by our payment provider as the law requires.</T></p>
                      </>
                    ) : (
                      <p><T>Your sign-in is removed from this workspace. The workspace and its data stay with its owner.</T></p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="delete-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Type your e-mail address to confirm</T>
                    {profile?.email ? <span className="ml-1 font-mono text-slate-500">({profile.email})</span> : null}
                  </label>
                  <input
                    id="delete-email"
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-3.5 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Your password (leave empty if you sign in with Google)</T>
                  </label>
                  <PasswordField value={deletePassword} onChange={setDeletePassword} placeholder={__t("Enter your password")} autoComplete="current-password" required={false} />
                </div>

                {deleteError && (
                  <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDelete(false);
                      setDeleteEmail('');
                      setDeletePassword('');
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <T>Cancel</T>
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deleteEmail.trim()}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{isDeleting ? <T>Deleting…</T> : <T>Delete forever</T>}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
