import { T } from '@/lib/i18n/context';
import React from 'react';
import {
  UserCheck,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Headphones,
  CreditCard,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
  accessCode?: string;
  password?: string;
}

export interface TeamTabProps {
  teamMembers: TeamMember[];
  teamSuccess: string | null;
  teamError: string | null;
  showAddTeamModal: boolean;
  setShowAddTeamModal: (show: boolean) => void;
  fetchTeamMembers: () => void;
  handleUpdateTeamMemberRole: (id: string, role: string) => void;
  handleDeleteTeamMember: (id: string) => void;
  handleAddTeamMember: (e: React.FormEvent) => void;
  newMemberName: string;
  setNewMemberName: (name: string) => void;
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  newMemberRole: string;
  setNewMemberRole: (role: any) => void;
  isAddingTeamMember: boolean;
}

export const TeamTab: React.FC<TeamTabProps> = ({
  teamMembers,
  teamSuccess,
  teamError,
  showAddTeamModal,
  setShowAddTeamModal,
  fetchTeamMembers,
  handleUpdateTeamMemberRole,
  handleDeleteTeamMember,
  handleAddTeamMember,
  newMemberName,
  setNewMemberName,
  newMemberEmail,
  setNewMemberEmail,
  newMemberRole,
  setNewMemberRole,
  isAddingTeamMember,
}) => {
  return (
    <div className="max-w-5xl space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span><T>Team</T></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <T>Invite team members and manage their access to the dashboard.</T>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddTeamModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span><T>Invite Team Member</T></span>
        </button>
      </div>

      {teamSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{teamSuccess}</span>
        </div>
      )}

      {teamError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{teamError}</span>
        </div>
      )}

      {/* Role Permissions Reference Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span><T>Owner &amp; Admin</T></span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <T>Full administrative control: add/edit assistants, update billing, invite teammates, and view security audits.</T>
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Headphones className="h-4 w-4 text-blue-500" />
            <span><T>Support Agent</T></span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <T>Operational access: take over live chats, manage appointments, and respond to captured visitor leads.</T>
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-purple-500" />
            <span><T>Billing &amp; Viewer</T></span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <T>Specialized access: invoices and payment methods for Billing Managers; read-only analytics for Viewers.</T>
          </p>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            <T>Active Collaborators (</T>{teamMembers.length})
          </h2>
          <button
            type="button"
            onClick={fetchTeamMembers}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span><T>Refresh</T></span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4"><T>Member Name</T></th>
                <th className="py-3 px-4"><T>Email</T></th>
                <th className="py-3 px-4"><T>Assigned Role</T></th>
                <th className="py-3 px-4"><T>2FA Status</T></th>
                <th className="py-3 px-4 text-right"><T>Actions</T></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div><T>{member.name}</T></div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <div>{member.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateTeamMemberRole(member.id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium capitalize"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="support_agent">Support Agent</option>
                      <option value="billing_manager">Billing Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    {member.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span><T>Enabled</T></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]"><T>Not Setup</T></span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Team Member Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white"><T>Invite Team Member</T></h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>Full Name</T></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>Email Address</T></label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>Access Role</T></label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white capitalize"
                >
                  <option value="admin">Admin (Manage bots &amp; settings)</option>
                  <option value="support_agent">Support Agent (Live takeover &amp; appointments)</option>
                  <option value="billing_manager">Billing Manager (Invoices &amp; subscriptions)</option>
                  <option value="viewer">Viewer (Read-only analytics)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <T>Cancel</T>
                </button>
                <button
                  type="submit"
                  disabled={isAddingTeamMember}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {isAddingTeamMember ? <T>{'Inviting...'}</T> : <T>{'Send Invite'}</T>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
