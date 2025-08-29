import React, { useState, useEffect } from 'react';
import api from '../../api/apiService';
import styles from './AdminDashboard.module.css';
import { FiUsers, FiClipboard, FiCheckCircle, FiLoader, FiGrid, FiList } from 'react-icons/fi';

// --- NEW: A Modal component for updates ---
const UpdateModal = ({ request, onClose, onUpdate }) => {
    const [status, setStatus] = useState(request.status);
    const [pickupDate, setPickupDate] = useState('');
    const [rejectionReason, setRejectionReason] = useState(request.rejectionReason || '');

    const handleSubmit = () => {
        onUpdate(request.id, status, pickupDate, rejectionReason);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>Update Request #{request.id}</h3>
                <p><strong>Item:</strong> {request.brand} {request.model}</p>
                <div className={styles.inputGroup}>
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {status === 'SCHEDULED' && (
                    <div className={styles.inputGroup}>
                        <label>Pickup Date and Time</label>
                        <input type="datetime-local" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                    </div>
                )}
                
                {status === 'REJECTED' && (
                    <div className={styles.inputGroup}>
                        <label>Reason for Rejection</label>
                        <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button onClick={handleSubmit} className={styles.updateButton}>Update</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};


// --- THIS IS THE MAIN COMPONENT, NOW COMPLETE ---
const AdminDashboard = () => {
    // --- THIS STATE LOGIC WAS MISSING ---
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null); // For the modal

    // --- THIS DATA FETCHING LOGIC WAS MISSING ---
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, requestsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/requests'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setRequests(requestsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setError("Could not load admin data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    // --- THIS UPDATE HANDLER LOGIC WAS MISSING ---
    const handleStatusUpdate = async (requestId, status, pickupDate, rejectionReason) => {
        try {
            await api.put(`/admin/requests/${requestId}/status`, { status, pickupDate, rejectionReason });
            setSelectedRequest(null); // Close modal on success
            fetchData(); // Refresh all data
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Could not update status.");
        }
    };

    if (loading) return <div className={styles.loading}>Loading Admin Panel...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const renderContent = () => {
        switch (view) {
            case 'users':
                return (
                    <div className={styles.tableContainer}>
                        <h2>Manage Users</h2>
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Address</th><th>Role</th></tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.address}</td>
                                        <td><span className={user.role === 'ROLE_ADMIN' ? styles.adminRole : styles.userRole}>{user.role.replace('ROLE_', '')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'requests':
                return (
                    <div className={styles.tableContainer}>
                        <h2>Manage Collection Requests</h2>
                        <table>
                            <thead>
                                <tr><th>ID</th><th>User</th><th>Device</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td>{req.userFullName || 'N/A'}</td>
                                        <td>{req.deviceType}: {req.brand} {req.model}</td>
                                        <td><span className={`${styles.statusBadge} ${styles[req.status.toLowerCase()]}`}>{req.status}</span></td>
                                        <td>
                                            <button className={styles.editButton} onClick={() => setSelectedRequest(req)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: // dashboard view
                return (
                    <div className={styles.statsGrid}>
                        <StatCard icon={<FiUsers />} title="Total Users" value={stats?.totalUsers ?? 0} />
                        <StatCard icon={<FiClipboard />} title="Total Requests" value={stats?.totalRequests ?? 0} />
                        <StatCard icon={<FiLoader />} title="Pending Requests" value={stats?.pendingRequests ?? 0} />
                        <StatCard icon={<FiCheckCircle />} title="Completed Requests" value={stats?.completedRequests ?? 0} />
                    </div>
                );
        }
    };

    return (
        <div className={styles.adminContainer}>
            {selectedRequest && <UpdateModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdate={handleStatusUpdate} />}
            
            <aside className={styles.sidebar}>
                <h2>Admin Panel</h2>
                <nav>
                    <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? styles.active : ''}><FiGrid /> Dashboard</button>
                    <button onClick={() => setView('requests')} className={view === 'requests' ? styles.active : ''}><FiList /> Manage Requests</button>
                    <button onClick={() => setView('users')} className={view === 'users' ? styles.active : ''}><FiUsers /> Manage Users</button>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                {renderContent()}
            </main>
        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className={styles.statCard}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>{title}</span>
            <span className={styles.cardValue}>{value}</span>
        </div>
    </div>
);

export default AdminDashboard;