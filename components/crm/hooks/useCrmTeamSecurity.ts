'use client';

import { useState } from 'react';

export function useCrmTeamSecurity() {
  // Team Management & RBAC State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'owner' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer'>('support_agent');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  // 2FA / Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{ secret: string; otpUrl: string; recoveryCodes: string[] } | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Security Audit Trail State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isSyncingAudit, setIsSyncingAudit] = useState(false);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (e) {}
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setIsAddingTeamMember(true);
    setTeamError(null);
    setTeamSuccess(null);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          email: newMemberEmail.trim(),
          role: newMemberRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamSuccess(
          data.temporaryPassword
            ? `Invited ${newMemberName} as ${newMemberRole.replace('_', ' ')}. Temporary password (share securely, shown only once): ${data.temporaryPassword}`
            : `Invited ${newMemberName} as ${newMemberRole.replace('_', ' ')}.`
        );
        setNewMemberName('');
        setNewMemberEmail('');
        setShowAddTeamModal(false);
        await fetchTeamMembers();
      } else {
        setTeamError(data.error || 'Failed to add team member');
      }
    } catch (err: any) {
      setTeamError(err.message || 'Network error adding member');
    } finally {
      setIsAddingTeamMember(false);
    }
  };

  const handleUpdateTeamMemberRole = async (id: string, role: string) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      });
      if (res.ok) {
        await fetchTeamMembers();
      }
    } catch (e) {}
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTeamMembers();
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    setIsSyncingAudit(true);
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {} finally {
      setIsSyncingAudit(false);
    }
  };

  const fetch2faStatus = async () => {
    try {
      const res = await fetch('/api/auth/2fa');
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(Boolean(data.enabled));
      }
    } catch (e) {}
  };

  const handleStart2faSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa?action=setup');
      const data = await res.json();
      if (res.ok) {
        setTwoFactorSetupData(data);
      } else {
        setTwoFactorError(data.error || 'Failed to initiate 2FA setup');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Network error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirm2faEnable = async () => {
    if (!twoFactorSetupData || !twoFactorCodeInput.trim()) return;
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    setTwoFactorSuccess(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enable',
          secret: twoFactorSetupData.secret,
          code: twoFactorCodeInput.trim(),
          recoveryCodes: twoFactorSetupData.recoveryCodes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorSuccess('Two-factor authentication is now active and protecting your account.');
        setTwoFactorSetupData(null);
        setTwoFactorCodeInput('');
      } else {
        setTwoFactorError(data.error || 'Invalid code');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Error enabling 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2fa = async () => {
    const code = prompt('To turn off two-factor authentication, enter a current 6-digit code from your authenticator app (or a recovery code).');
    if (!code || !code.trim()) return;
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', code: code.trim() }),
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        setTwoFactorSuccess('Two-factor authentication disabled.');
      } else {
        const data = await res.json().catch(() => ({}));
        setTwoFactorError(data.error || 'Could not turn off two-factor authentication.');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Error disabling 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return {
    teamMembers,
    isAddingTeamMember,
    showAddTeamModal,
    setShowAddTeamModal,
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    newMemberRole,
    setNewMemberRole,
    teamError,
    teamSuccess,
    fetchTeamMembers,
    handleAddTeamMember,
    handleUpdateTeamMemberRole,
    handleDeleteTeamMember,
    twoFactorEnabled,
    twoFactorSetupData,
    twoFactorCodeInput,
    setTwoFactorCodeInput,
    twoFactorLoading,
    twoFactorSuccess,
    twoFactorError,
    fetch2faStatus,
    handleStart2faSetup,
    handleConfirm2faEnable,
    handleDisable2fa,
    auditLogs,
    isSyncingAudit,
    fetchAuditLogs,
  };
}
