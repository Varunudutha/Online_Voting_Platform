import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiCheck, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'sharklasers.com', 'yopmail.com', 'getnada.com', 'throwawaymail.com',
    'temp-mail.org', 'fake-email.com', 'dispostable.com', 'maildrop.cc'
];

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('voter');
    // const [adminSecret, setAdminSecret] = useState(''); // Removed
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validation States
    const [emailValid, setEmailValid] = useState(false);
    const [passCriteria, setPassCriteria] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    // Validations
    React.useEffect(() => {
        // Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const domain = email.split('@')[1];
        const isDisposable = domain && DISPOSABLE_DOMAINS.includes(domain);

        setEmailValid(emailRegex.test(email) && !isDisposable);

        if (isDisposable) {
            setError('Please use a valid personal or work email address.');
        } else {
            setError(''); // Clear error if fixed
        }
    }, [email]);

    React.useEffect(() => {
        setPassCriteria({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(passCriteria).every(Boolean);

    // Timer Logic
    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async () => {
        if (!emailValid) return;
        setLoading(true);
        try {
            setError('');
            await api.post('/auth/send-otp', { email });
            setIsOtpSent(true);
            setTimer(60);
            // toast.success(`OTP Sent to ${email}`); // Removed generic alert, using inline state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isPasswordValid) return;

        try {
            const payload = { name, email, password, role, otp };
            // if (role === 'admin') payload.adminSecret = adminSecret; // Removed

            await api.post('/auth/register', payload);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const PasswordRequirement = ({ met, text }) => (
        <div className={`d-flex align-items-center gap-2 small ${met ? 'text-success' : 'text-muted'}`}>
            {met ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            <span>{text}</span>
        </div>
    );

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
                            <Card className="card-premium border-0 p-4 mt-5">
                                <Card.Body>
                                    <div className="text-center mb-4">
                                        <h3 className="fw-bold mb-1 text-heading">Create Account</h3>
                                        <p className="text-secondary small">Join the secure voting platform today.</p>
                                    </div>

                                    {error && (
                                        <Alert variant="danger" className="py-2 text-center small shadow-sm border-0 d-flex align-items-center justify-content-center gap-2">
                                            <FiAlertCircle /> {error}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3 form-floating">
                                            <Form.Control
                                                type="text"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="bg-light border-light"
                                                id="regName"
                                            />
                                            <label htmlFor="regName">Full Name</label>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <div className="d-flex gap-2 position-relative">
                                                <div className="form-floating flex-grow-1">
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        disabled={isOtpSent}
                                                        className={`bg-light ${email && !emailValid ? 'border-danger' : 'border-light'}`}
                                                        id="regEmail"
                                                    />
                                                    <label htmlFor="regEmail">Email Address</label>
                                                </div>
                                                <Button
                                                    variant={isOtpSent ? "outline-secondary" : "outline-primary"}
                                                    onClick={handleSendOtp}
                                                    disabled={!emailValid || (isOtpSent && timer > 0) || loading}
                                                    className="px-3 fw-medium"
                                                >
                                                    {loading ? 'Sending...' : (isOtpSent ? (timer > 0 ? `${timer}s` : 'Resend') : 'Send OTP')}
                                                </Button>
                                            </div>
                                            {email && !emailValid && (
                                                <div className="text-danger small mt-1 ms-1">
                                                    Please enter a valid email address.
                                                </div>
                                            )}
                                        </Form.Group>

                                        <AnimatePresence>
                                            {isOtpSent && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <Form.Group className="mb-3 form-floating">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter 6-digit OTP"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                            required
                                                            className="bg-light border-primary"
                                                            id="regOtp"
                                                            autoFocus
                                                        />
                                                        <label htmlFor="regOtp">Enter 6-digit OTP</label>
                                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                                            <Form.Text className="text-muted small">
                                                                Code sent to {email}. Valid for 5 minutes.
                                                            </Form.Text>
                                                            {otp.length === 6 && (
                                                                <span className="text-success small fw-bold d-flex align-items-center gap-1">
                                                                    <FiCheckCircle /> Ready to Verify
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Form.Group>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Form.Group className="mb-3 form-floating">
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className={`bg-light ${password && !isPasswordValid ? 'border-warning' : 'border-light'}`}
                                                id="regPassword"
                                            />
                                            <label htmlFor="regPassword">Password</label>
                                        </Form.Group>

                                        {/* Password Strength Indicators - Only show when user starts typing */}
                                        {password && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 bg-light p-3 rounded small"
                                            >
                                                <div className="mb-2 fw-bold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Password Requirements</div>
                                                <Row xs={2} className="g-2">
                                                    <Col><PasswordRequirement met={passCriteria.length} text="8+ Characters" /></Col>
                                                    <Col><PasswordRequirement met={passCriteria.upper} text="1 Uppercase" /></Col>
                                                    <Col><PasswordRequirement met={passCriteria.lower} text="1 Lowercase" /></Col>
                                                    <Col><PasswordRequirement met={passCriteria.number} text="1 Number" /></Col>
                                                    <Col xs={12}><PasswordRequirement met={passCriteria.special} text="1 Special (!@#$%^&*)" /></Col>
                                                </Row>
                                            </motion.div>
                                        )}

                                        {/* Admin Toggle */}
                                        <div className="mb-3 d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                id="adminToggle"
                                                label="Register as Admin"
                                                checked={role === 'admin'}
                                                onChange={(e) => setRole(e.target.checked ? 'admin' : 'voter')}
                                                className="text-muted small"
                                            />
                                        </div>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100 btn-premium py-2 mb-3 shadow-md"
                                                disabled={!isOtpSent || otp.length !== 6 || !isPasswordValid}
                                            >
                                                Verify & Register
                                            </Button>
                                        </motion.div>

                                        <div className="text-center">
                                            <small className="text-muted">
                                                Already have an account? <Link to="/login" className="text-decoration-none fw-bold text-primary hover-lift">Log In</Link>
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

export default Register;