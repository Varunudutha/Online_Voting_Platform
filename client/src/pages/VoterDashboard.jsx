import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiClock, FiCheck, FiXCircle } from 'react-icons/fi';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

const VoterDashboard = () => {
    const { user } = useAuth();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(null); // ID of election currently being voted on
    const [userVotedIds, setUserVotedIds] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'upcoming' | 'history'

    useEffect(() => {
        if (user?.hasVotedIn && Array.isArray(user.hasVotedIn)) {
            setUserVotedIds(user.hasVotedIn);
        }
        fetchElections();
    }, [user]);

    const fetchElections = async () => {
        try {
            const { data } = await api.get('/elections');
            console.log('API Response (Elections):', data); // Debug log

            if (Array.isArray(data)) {
                setElections(data);
            } else {
                console.error('Invalid elections data format:', data);
                setElections([]); // Fallback to empty array
                toast.error('Received invalid data from server');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching elections:', error);
            toast.error('Failed to load elections');
            setLoading(false);
        }
    };

    const handleVote = async (electionId, candidateId) => {
        if (!window.confirm('Confirm your vote? This action cannot be undone.')) return;

        setVoting(electionId);
        try {
            await api.post('/votes', { electionId, candidateId });
            toast.success('Vote cast successfully!');

            // Optimistically update local state
            setUserVotedIds((prev) => [...prev, electionId]);

            // Refresh data to get updated counts
            fetchElections();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cast vote');
        } finally {
            setVoting(null);
        }
    };

    // Filter elections safely
    const safeElections = Array.isArray(elections) ? elections : [];
    const activeElections = safeElections.filter(e => e.status === 'active');
    const upcomingElections = safeElections.filter(e => e.status === 'upcoming');
    const pastElections = safeElections.filter(e => e.status === 'ended');

    // Helper to check if user voted
    const hasVoted = (electionId) => Array.isArray(userVotedIds) && userVotedIds.includes(electionId);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    console.log('Rendering VoterDashboard. Elections:', elections.length);

    return (
        <Container className="py-5">
            <div className="fade-in">
                <div className="mb-5 text-center">
                    <h1 className="fw-bold text-heading mb-2">Voter Dashboard</h1>
                    <p className="text-muted">Participate in democratic elections securely.</p>
                </div>

                {/* Tabs */}
                <div className="d-flex justify-content-center gap-3 mb-5">
                    <Button
                        variant={activeTab === 'active' ? 'primary' : 'outline-light'} // Using outline-light for 'inactive' look if needed, or simple 'light'
                        className={activeTab === 'active' ? 'btn-premium rounded-pill px-4' : 'border-0 bg-transparent text-muted fw-medium'}
                        onClick={() => setActiveTab('active')}
                    >
                        Active ({activeElections.length})
                    </Button>
                    <Button
                        variant={activeTab === 'upcoming' ? 'primary' : 'outline-light'}
                        className={activeTab === 'upcoming' ? 'btn-premium rounded-pill px-4' : 'border-0 bg-transparent text-muted fw-medium'}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming ({upcomingElections.length})
                    </Button>
                    <Button
                        variant={activeTab === 'history' ? 'primary' : 'outline-light'}
                        className={activeTab === 'history' ? 'btn-premium rounded-pill px-4' : 'border-0 bg-transparent text-muted fw-medium'}
                        onClick={() => setActiveTab('history')}
                    >
                        History ({pastElections.length})
                    </Button>
                </div>

                {/* ACTIVE */}
                {activeTab === 'active' && (
                    <Row className="g-4">
                        {activeElections.length === 0 ? (
                            <Col>
                                <Alert variant="light" className="text-center py-5 border-0 shadow-sm">
                                    <h5 className="text-muted mb-0">No active elections at the moment.</h5>
                                </Alert>
                            </Col>
                        ) : (
                            activeElections.map((election) => (
                                <Col lg={12} key={election._id}>
                                    <Card className="card-premium border-0 mb-3">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <h3 className="fw-bold text-heading mb-0">{election.title}</h3>
                                                        <Badge bg="success" className="px-3 py-1 rounded-pill small">LIVE</Badge>
                                                    </div>
                                                    <p className="text-muted mb-0">{election.description}</p>
                                                </div>
                                                {hasVoted(election._id) ? (
                                                    <div className="text-success d-flex align-items-center gap-2 bg-success bg-opacity-10 px-3 py-2 rounded-pill">
                                                        <FiCheckCircle />
                                                        <span className="fw-bold">Voted</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted small d-flex align-items-center gap-2">
                                                        <FiCheckCircle className="text-primary" />
                                                        <span>You are eligible</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Candidates Grid */}
                                            <h6 className="fw-bold text-heading small text-uppercase mb-3">Candidates</h6>
                                            <Row className="g-3">
                                                {election.candidates.map((candidate) => (
                                                    <Col md={6} lg={4} key={candidate._id}>
                                                        <div className={`p-3 rounded-3 border transition-all ${hasVoted(election._id) ? 'bg-light opacity-75' : 'bg-white hover-shadow'
                                                            }`}>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <div
                                                                    className="rounded-circle bg-gray-200 me-3 flex-shrink-0"
                                                                    style={{ width: '48px', height: '48px', overflow: 'hidden' }}
                                                                >
                                                                    {/* Placeholder for candidate image */}
                                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-white fw-bold">
                                                                        {candidate.name.charAt(0)}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h6 className="fw-bold mb-0 text-dark">{candidate.name}</h6>
                                                                    <small className="text-muted">{candidate.party}</small>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant={hasVoted(election._id) ? "outline-secondary" : "primary"}
                                                                className={hasVoted(election._id) ? "w-100 border-0" : "w-100 btn-premium"}
                                                                disabled={hasVoted(election._id) || voting === election._id}
                                                                onClick={() => handleVote(election._id, candidate._id)}
                                                            >
                                                                {hasVoted(election._id) ? 'Voted' : voting === election._id ? 'Voting...' : 'Vote'}
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                )}

                {/* UPCOMING */}
                {activeTab === 'upcoming' && (
                    <Row className="g-4">
                        {upcomingElections.length === 0 ? (
                            <Col>
                                <p className="text-center text-muted">No upcoming elections.</p>
                            </Col>
                        ) : (
                            upcomingElections.map((election) => (
                                <Col md={6} key={election._id}>
                                    <Card className="card-premium h-100 border-0">
                                        <Card.Body className="p-4 d-flex flex-column">
                                            <Badge bg="warning" text="dark" className="align-self-start mb-3 px-3 py-2 rounded-pill">UPCOMING</Badge>
                                            <h4 className="fw-bold text-heading mb-2">{election.title}</h4>
                                            <p className="text-muted mb-4 flex-grow-1">{election.description}</p>
                                            <Alert variant="warning" className="border-0 bg-warning bg-opacity-10 text-dark mb-0 d-flex align-items-center gap-2">
                                                <FiClock />
                                                <span>Waiting for Admin to start</span>
                                            </Alert>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                )}

                {/* HISTORY */}
                {activeTab === 'history' && (
                    <Row className="g-4">
                        {pastElections.length === 0 ? (
                            <Col>
                                <p className="text-center text-muted">No past elections.</p>
                            </Col>
                        ) : (
                            pastElections.map((election) => (
                                <Col md={6} key={election._id}>
                                    <Card className="card-premium h-100 border-0 opacity-75">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between mb-3">
                                                <Badge bg="secondary" className="px-3 py-2 rounded-pill">ENDED</Badge>
                                                {hasVoted(election._id) && <Badge bg="success" className="px-2 py-1">You Voted</Badge>}
                                            </div>
                                            <h4 className="fw-bold text-heading mb-2">{election.title}</h4>
                                            <p className="text-muted mb-0">{election.description}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                )}

            </div>
        </Container>
    );
};

export default VoterDashboard;
