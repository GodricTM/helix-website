import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, UserPermissions } from '../types';

interface TeamManagementProps {
    currentUserRole: UserRole | null;
}

const defaultPermissions: UserPermissions = {
    manage_team: false,
    manage_content: false,
    manage_projects: true,
    manage_services: false,
    manage_reviews: false,
    view_messages: false,
    manage_messages: false
};

const TeamManagement: React.FC<TeamManagementProps> = ({ currentUserRole }) => {
    const [users, setUsers] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [editingUser, setEditingUser] = useState<UserRole | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as UserRole[]);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword) return;

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPassword,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Failed to create user');

            // 2. Create Role Entry
            const newRole: UserRole = {
                user_id: authData.user.id,
                email: newUserEmail,
                role: 'editor',
                permissions: defaultPermissions,
                created_at: new Date().toISOString()
            };

            const { error: roleError } = await supabase
                .from('user_roles')
                .insert([newRole]);

            if (roleError) throw roleError;

            showNotification(`User ${newUserEmail} created successfully!`);
            setIsAdding(false);
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();

        } catch (err: any) {
            console.error('Error creating user:', err);
            showNotification(err.message, 'error');
        }
    };

    const handleUpdatePermissions = async () => {
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('user_roles')
                .update({
                    role: editingUser.role,
                    permissions: editingUser.permissions
                })
                .eq('user_id', editingUser.user_id);

            if (error) throw error;

            showNotification('Permissions updated successfully');
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            console.error('Error updating permissions:', err);
            showNotification(err.message, 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;

        try {
            // Note: This only deletes the role entry. 
            // Deleting the actual Auth user requires a backend function (Service Role).
            // For now, we just remove their access role.
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            showNotification('User access removed');
            fetchUsers();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            showNotification(err.message, 'error');
        }
    };

    if (loading) return <div className="text-white">Loading team...</div>;

    return (
        <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm">
            {notification && (
                <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-sm border shadow-2xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-garage-900 border-bronze-500 text-white' : 'bg-red-950/90 border-red-500 text-white'}`}>
                    <span className="font-bold uppercase text-sm tracking-wider">{notification.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Team Management</h2>
                    <p className="text-garage-400 text-sm mt-1">Manage access for Anthony, Liam, and Alec.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-xs tracking-wider"
                >
                    + Add Team Member
                </button>
            </div>

            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-garage-900 border border-garage-700 p-6 rounded-sm w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4 uppercase">Add New Member</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs text-garage-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                                    placeholder="user@helixmotorcycles.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-garage-500 uppercase mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-garage-400 hover:text-white uppercase text-xs font-bold">Cancel</button>
                                <button type="submit" className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 uppercase text-xs font-bold rounded-sm">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {
                editingUser && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-garage-900 border border-garage-700 p-6 rounded-sm w-full max-w-lg">
                            <h3 className="text-lg font-bold text-white mb-4 uppercase">Edit Permissions: <span className="text-bronze-500">{editingUser.email}</span></h3>

                            <div className="mb-6">
                                <label className="block text-xs text-garage-500 uppercase mb-2">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                                    className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                                >
                                    <option value="editor">Editor (Restricted)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                    <option value="super_admin">Super Admin (Can Manage Team)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs text-garage-500 uppercase mb-2">Specific Permissions</label>
                                {Object.keys(defaultPermissions).map((key) => (
                                    <label key={key} className="flex items-center space-x-3 p-3 bg-garage-950 border border-garage-800 rounded-sm cursor-pointer hover:border-garage-600">
                                        <input
                                            type="checkbox"
                                            checked={editingUser.permissions[key as keyof UserPermissions]}
                                            onChange={e => setEditingUser({
                                                ...editingUser,
                                                permissions: {
                                                    ...editingUser.permissions,
                                                    [key]: e.target.checked
                                                }
                                            })}
                                            className="form-checkbox h-5 w-5 text-bronze-600 rounded bg-garage-900 border-garage-700 focus:ring-bronze-500"
                                        />
                                        <span className="text-white text-sm uppercase font-bold">{key.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-garage-400 hover:text-white uppercase text-xs font-bold">Cancel</button>
                                <button onClick={handleUpdatePermissions} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 uppercase text-xs font-bold rounded-sm">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* User List */}
            <div className="grid gap-4">
                {users.map(user => (
                    <div key={user.user_id} className="bg-garage-950 border border-garage-800 p-4 flex items-center justify-between group hover:border-bronze-500/30 transition-colors">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-white">{user.email}</h3>
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold ${user.role === 'super_admin' ? 'bg-bronze-500/20 text-bronze-500' :
                                    user.role === 'admin' ? 'bg-blue-500/20 text-blue-500' :
                                        'bg-garage-800 text-garage-400'
                                    }`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {Object.entries(user.permissions).filter(([_, v]) => v).map(([k]) => (
                                    <span key={k} className="text-[10px] text-garage-500 uppercase border border-garage-800 px-1 rounded">
                                        {k.split('_')[1]}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingUser(user)}
                                className="p-2 text-garage-400 hover:text-white bg-garage-900 hover:bg-garage-800 rounded-sm border border-garage-700"
                            >
                                Edit
                            </button>
                            {user.role !== 'super_admin' && (
                                <button
                                    onClick={() => handleDeleteUser(user.user_id)}
                                    className="p-2 text-red-400 hover:text-red-300 bg-garage-900 hover:bg-red-900/20 rounded-sm border border-garage-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default TeamManagement;
