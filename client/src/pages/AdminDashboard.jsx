import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiXCircle, FiPlay, FiStopCircle, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import ResultsModal from '../components/ResultsModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedElection, setSelectedElection] = useState(null);
    const [manageTab, setManageTab] = useState('details'); // details, candidates, voters
    const [allVoters, setAllVoters] = useState([]);
    const [showResultsModal, setShowResultsModal] = useState(false);

    // RESTORED MISSING STATES
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalElections: 0, activeElections: 0, totalVotes: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newElection, setNewElection] = useState({
        title: '',
        description: ''
    });

    // Form States
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [newCandidate, setNewCandidate] = useState({ name: '', party: '', photoUrl: '' });
    const [selectedVoterIds, setSelectedVoterIds] = useState([]);

    // Fetch Data
    const fetchDashboardData = async () => {
        try {
            const [electionsRes, statsRes, usersRes] = await Promise.all([
                api.get('/elections'),
                api.get('/votes/stats'),
                api.get('/auth/users')
            ]);

            console.log('Admin Data:', electionsRes.data);

            if (Array.isArray(electionsRes.data)) {
                setElections(electionsRes.data);
            } else {
                setElections([]);
            }

            setStats(statsRes.data || { totalElections: 0, activeElections: 0, totalVotes: 0 });
            setAllVoters(usersRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // toast.error('Failed to load dashboard data'); // Silenced for cleaner UX on first load
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handlers
    const handleCreateElection = async (e) => {
        e.preventDefault();
        try {
            await api.post('/elections', newElection);
            toast.success('Election created successfully');
            setShowCreateModal(false);
            setNewElection({ title: '', description: '' });
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create election');
        }
    };

    const handleDeleteElection = async (id) => {
        if (window.confirm('Are you sure you want to delete this election?')) {
            try {
                await api.delete(`/elections/${id}`);
                toast.success('Election deleted');
                fetchDashboardData();
            } catch (error) {
                toast.error('Failed to delete election');
            }
        }
    };

    const handleStartElection = async (id) => {
        if (window.confirm('Start this election? Voters can vote immediately.')) {
            try {
                await api.put(`/elections/${id}/start`);
                toast.success('Election STARTED');
                fetchDashboardData();
            } catch (error) {
                toast.error('Failed to start election');
            }
        }
    };

    const handleEndElection = async (id) => {
        if (window.confirm('End this election? Voting will stop.')) {
            try {
                await api.put(`/elections/${id}/end`);
                toast.success('Election ENDED');
                fetchDashboardData();
            } catch (error) {
                toast.error('Failed to end election');
            }
        }
    };

    // Manage Modal Handlers
    const openManageModal = (election) => {
        setSelectedElection(election);
        setEditForm({ title: election.title, description: election.description });
        // Map eligibleVoters objects to IDs
        const currentAllowed = election.eligibleVoters?.map(v => v._id || v) || [];
        setSelectedVoterIds(currentAllowed);
        setShowManageModal(true);
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/elections/${selectedElection._id}`, editForm);
            toast.success('Election details updated');
            fetchDashboardData(); // Refresh to see changes
        } catch (error) {
            toast.error('Failed to update election');
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/elections/${selectedElection._id}/candidates`, newCandidate);
            toast.success('Candidate added');
            setNewCandidate({ name: '', party: '', photoUrl: '' });
            // Refresh specific election data
            const res = await api.get(`/elections/${selectedElection._id}`);
            setSelectedElection(res.data);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to add candidate');
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm('Remove this candidate?')) return;
        try {
            await api.delete(`/elections/candidates/${candidateId}`); // Check route matches
            toast.success('Candidate removed');
            const res = await api.get(`/elections/${selectedElection._id}`);
            setSelectedElection(res.data);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to delete candidate');
        }
    };

    const handleSaveEligibility = async () => {
        try {
            await api.put(`/elections/${selectedElection._id}`, {
                ...editForm, // Keep existing details
                eligibleVoters: selectedVoterIds
            });
            toast.success('Voter eligibility updated');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to update eligibility');
        }
    };

    const toggleVoter = (voterId) => {
        if (selectedVoterIds.includes(voterId)) {
            setSelectedVoterIds(prev => prev.filter(id => id !== voterId));
        } else {
            setSelectedVoterIds(prev => [...prev, voterId]);
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success" className="px-3 py-2 rounded-pill">LIVE</Badge>;
            case 'upcoming':
                return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">UPCOMING</Badge>;
            case 'ended':
                return <Badge bg="secondary" className="px-3 py-2 rounded-pill">ENDED</Badge>;
            default:
                return <Badge bg="light" text="dark">UNKNOWN</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-bold text-heading mb-1">Admin Dashboard</h1>
                        <p className="text-muted">Manage elections and oversee voting results.</p>
                    </div>
                    <Button
                        className="btn-premium d-flex align-items-center gap-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FiPlus size={20} /> Create Election
                    </Button>
                </div>

                {/* Stats Cards - SAME */}
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className="card-premium h-100 border-0">
                            <Card.Body className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                    <FiEdit2 size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Total Elections</h6>
                                    <h3 className="mb-0 fw-bold text-heading">{stats.totalElections || 0}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="card-premium h-100 border-0">
                            <Card.Body className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                    <FiCheckCircle size={24} className="text-success" />
                                </div>
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Active Elections</h6>
                                    <h3 className="mb-0 fw-bold text-heading">{stats.activeElections || 0}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="card-premium h-100 border-0">
                            <Card.Body className="d-flex align-items-center">
                                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                    <FiCheckCircle size={24} className="text-info" />
                                </div>
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Total Votes</h6>
                                    <h3 className="mb-0 fw-bold text-heading">{stats.totalVotes || 0}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Elections Table */}
                <Card className="card-premium border-0 overflow-hidden">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                        <h4 className="fw-bold text-heading mb-0">All Elections</h4>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table responsive hover className="table-premium mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Title</th>
                                    <th>Status</th>
                                    <th>Voters</th>
                                    <th>Actions</th>
                                    <th className="text-end pe-4">Manage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elections.map((election) => (
                                    <tr key={election._id}>
                                        <td className="ps-4 fw-medium text-heading">{election.title}</td>
                                        <td>{getStatusBadge(election.status)}</td>
                                        <td>
                                            <small className="text-muted">
                                                {election.eligibleVoters && election.eligibleVoters.length > 0
                                                    ? `${election.eligibleVoters.length} Allowed`
                                                    : 'Private (None)'}
                                            </small>
                                        </td>
                                        <td>
                                            {election.status === 'upcoming' && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-2 d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleStartElection(election._id)}
                                                >
                                                    <FiPlay /> Start
                                                </Button>
                                            )}
                                            {election.status === 'active' && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="me-2 d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleEndElection(election._id)}
                                                >
                                                    <FiStopCircle /> End
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                className="me-2 d-inline-flex align-items-center gap-1"
                                                onClick={() => {
                                                    setSelectedElection(election);
                                                    setShowResultsModal(true);
                                                }}
                                            >
                                                <FiBarChart2 /> Results
                                            </Button>
                                        </td>
                                        <td className="text-end pe-4">
                                            {election.status === 'upcoming' ? (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => openManageModal(election)}
                                                    >
                                                        Manage
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => handleDeleteElection(election._id)}
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </Button>
                                                </>
                                            ) : (
                                                <small className="text-muted fw-bold">
                                                    {election.status === 'active' ? 'IN PROGRESS' : 'COMPLETED'}
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>

            {/* Create Election Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-heading">Create New Election</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={handleCreateElection}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Election Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={newElection.title}
                                onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={newElection.description}
                                onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" className="btn-premium btn-lg">Create</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Manage Election Modal */}
            <Modal show={showManageModal} onHide={() => setShowManageModal(false)} centered size="lg">
                {selectedElection && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Manage: {selectedElection.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="d-flex gap-2 mb-4">
                                <Button variant={manageTab === 'details' ? 'primary' : 'light'} onClick={() => setManageTab('details')}>Details</Button>
                                <Button variant={manageTab === 'candidates' ? 'primary' : 'light'} onClick={() => setManageTab('candidates')}>Candidates</Button>
                                <Button variant={manageTab === 'voters' ? 'primary' : 'light'} onClick={() => setManageTab('voters')}>Voters</Button>
                            </div>

                            {/* DETAILS TAB */}
                            {manageTab === 'details' && (
                                <Form onSubmit={handleUpdateDetails}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Button type="submit" variant="success">Save Changes</Button>
                                </Form>
                            )}

                            {/* CANDIDATES TAB */}
                            {manageTab === 'candidates' && (
                                <div>
                                    <div className="mb-4">
                                        <h6 className="fw-bold">Add Candidate</h6>
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                placeholder="Name"
                                                value={newCandidate.name}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                                            />
                                            <Form.Control
                                                placeholder="Party"
                                                value={newCandidate.party}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                                            />
                                            <Button onClick={handleAddCandidate}>Add</Button>
                                        </div>
                                    </div>
                                    <h6 className="fw-bold">Current Candidates</h6>
                                    <div className="list-group">
                                        {selectedElection.candidates?.map(c => (
                                            <div key={c._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{c.name}</strong> <small className="text-muted">({c.party})</small>
                                                </div>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCandidate(c._id)}>Remove</Button>
                                            </div>
                                        ))}
                                        {(!selectedElection.candidates || selectedElection.candidates.length === 0) && (
                                            <p className="text-muted">No candidates yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* VOTERS TAB */}
                            {manageTab === 'voters' && (
                                <div>
                                    <p className="text-muted small">Select voters eligible for this election. Only selected voters will see this election.</p>
                                    <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {allVoters.map(user => (
                                            <Form.Check
                                                key={user._id}
                                                type="checkbox"
                                                id={`voter-${user._id}`}
                                                label={`${user.name} (${user.email})`}
                                                checked={selectedVoterIds.includes(user._id)}
                                                onChange={() => toggleVoter(user._id)}
                                                className="mb-2"
                                            />
                                        ))}
                                        {allVoters.length === 0 && <p>No registered voters found.</p>}
                                    </div>
                                    <div className="mt-3">
                                        <Button variant="primary" onClick={handleSaveEligibility}>Save Eligibility</Button>
                                        <span className="ms-3 text-muted">
                                            Selected: {selectedVoterIds.length} / {allVoters.length}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                    </>
                )}
            </Modal>

            {/* Results Modal - Conditionally rendered to prevent crash on close */}
            {showResultsModal && selectedElection && (
                <ResultsModal
                    show={true}
                    onHide={() => setShowResultsModal(false)}
                    electionId={selectedElection._id}
                />
            )}
        </Container>
    );
};

export default AdminDashboard;
