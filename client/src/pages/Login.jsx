import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% -20%, var(--primary-light) 0%, transparent 60%)' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={5}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="card-premium border-0 p-4">
                                <Card.Body>
                                    <div className="text-center mb-5">
                                        <h3 className="fw-bold mb-1 text-heading">Welcome Back</h3>
                                        <p className="text-secondary small">Securely sign in to your dashboard.</p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <Alert variant="danger" className="py-2 small text-center shadow-sm border-0 mb-4">{error}</Alert>
                                        </motion.div>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3 form-floating">
                                            <Form.Control
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-light border-light"
                                                id="loginEmail"
                                            />
                                            <label htmlFor="loginEmail">Email Address</label>
                                        </Form.Group>

                                        <Form.Group className="mb-4 form-floating">
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-light border-light"
                                                id="loginPassword"
                                            />
                                            <label htmlFor="loginPassword">Password</label>
                                        </Form.Group>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button variant="primary" type="submit" className="w-100 btn-premium py-2 mb-4 shadow-md">
                                                Sign In
                                            </Button>
                                        </motion.div>

                                        <div className="text-center">
                                            <small className="text-muted">
                                                Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none hover-lift d-inline-block">Create Account</Link>
                                            </small>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
