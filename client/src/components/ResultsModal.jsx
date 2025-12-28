import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { io } from 'socket.io-client';
import api from '../services/api';

// Socket instance (singleton per session to avoid multiple connections)
// Socket instance (singleton per session to avoid multiple connections)
const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true
});

const ResultsModal = ({ show, onHide, electionId }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Fetch initial results
    const fetchResults = async () => {
        try {
            const res = await api.get(`/votes/results/${electionId}`);
            setResults(res.data);
            const total = res.data.reduce((acc, curr) => acc + curr.voteCount, 0);
            setTotalVotes(total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching results:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && electionId) {
            setLoading(true);
            fetchResults();

            // Join Election Room
            socket.emit('joinElection', electionId);

            // Listen for updates
            socket.on('voteUpdate', (data) => {
                if (data.electionId === electionId) {
                    setResults((prevResults) => {
                        return prevResults.map((candidate) => {
                            if (candidate._id === data.candidateId) {
                                return { ...candidate, voteCount: data.newVoteCount };
                            }
                            return candidate;
                        });
                    });
                    // Re-calc total localy or refetch? Efficient to just add 1 or sum again
                    setResults(current => {
                        const newTotal = current.reduce((acc, c) => acc + c.voteCount, 0);
                        setTotalVotes(newTotal);
                        return current;
                    });
                }
            });

           return () => {
  socket.emit('leaveElection', electionId);
  socket.off('voteUpdate');
};

        }
    }, [show, electionId]);

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Live Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <div>
                        <div className="d-flex justify-content-between mb-4 px-3">
                            <h5 className="mb-0">Total Votes: <span className="fw-bold text-primary">{totalVotes}</span></h5>
                            {results.length > 0 && (
                                <span className="badge bg-success bg-opacity-10 text-success p-2">
                                    Leading: <strong>{results.sort((a, b) => b.voteCount - a.voteCount)[0]?.name}</strong>
                                </span>
                            )}
                        </div>

                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8f9fa' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="voteCount" radius={[4, 4, 0, 0]}>
                                        {results.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ResultsModal;
