import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaVoteYea, FaChartLine, FaLock, FaUserShield } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="landing-page" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section className="position-relative py-5 py-lg-6 mb-5">
                {/* Abstract Background Decoration */}
                <div className="position-absolute top-0 end-0 rounded-circle opacity-10" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                <div className="position-absolute bottom-0 start-0 rounded-circle opacity-10" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', transform: 'translate(-30%, 20%)' }}></div>

                <Container className="position-relative">
                    <Row className="align-items-center">
                        <Col lg={7} className="text-center text-lg-start mb-5 mb-lg-0">
                            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                                <motion.div variants={fadeInUp}>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-3 fw-bold">
                                        <FaShieldAlt className="me-2" />
                                        Secure Enterprise Voting
                                    </span>
                                </motion.div>
                                <motion.h1 variants={fadeInUp} className="display-3 fw-bolder mb-4 text-heading" style={{ letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                                    Democracy powered by <br />
                                    <span className="text-gradient">Integrity & Trust</span>
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="lead text-muted mb-5" style={{ fontSize: '1.25rem' }}>
                                    The most secure, transparent, and auditable online voting platform for governments and organizations.
                                </motion.p>
                                <motion.div variants={fadeInUp} className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                                    {user ? (
                                        <Button
                                            as={Link}
                                            to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"}
                                            className="btn-premium btn-lg rounded-pill px-5 py-3 shadow-lg"
                                        >
                                            Go to Dashboard
                                        </Button>
                                    ) : (
                                        <>
                                            <Button as={Link} to="/register" className="btn-premium btn-lg rounded-pill px-5 py-3 shadow-lg">
                                                Start Voting Now
                                            </Button>
                                            <Button as={Link} to="/login" variant="light" className="btn-lg rounded-pill px-5 py-3 border fw-semibold text-primary">
                                                View Elections
                                            </Button>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block position-relative">
                            <motion.div
                                className="animate-float"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="position-relative">
                                    {/* Main Hero Illustration Placeholder */}
                                    <div className="bg-white p-4 rounded-4 shadow-lg border border-light position-relative z-2">
                                        <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '48px', height: '48px' }}><FaVoteYea size={24} /></div>
                                            <div>
                                                <h5 className="fw-bold mb-0">Election 2025</h5>
                                                <small className="text-success fw-bold">● Active Voting</small>
                                            </div>
                                        </div>
                                        <div className="vstack gap-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="d-flex align-items-center gap-3 p-2 rounded bg-light">
                                                    <div className="bg-white border rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                                                    <div className="w-100">
                                                        <div className="bg-secondary opacity-25 rounded mb-1" style={{ height: '10px', width: '60%' }}></div>
                                                        <div className="bg-primary rounded" style={{ height: '6px', width: `${60 - i * 10}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="position-absolute top-0 start-0 translate-middle bg-white p-3 rounded-4 shadow-lg border z-3">
                                        <FaLock className="text-primary fs-3" />
                                    </motion.div>
                                    <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="position-absolute bottom-0 end-0 translate-middle-y bg-white p-3 rounded-4 shadow-lg border z-3">
                                        <FaUserShield className="text-success fs-3" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Grid */}
            <section className="py-6 bg-white border-top border-light">
                <Container className="py-5">
                    <div className="text-center mb-5 mw-md mx-auto" style={{ maxWidth: '700px' }}>
                        <h2 className="fw-bold mb-3">Trusted by Institutions</h2>
                        <p className="text-muted">Built with military-grade encryption and designed for seamless user experience.</p>
                    </div>

                    <Row className="g-4">
                        {[
                            { icon: FaShieldAlt, title: "Unbreakable Security", text: "End-to-end encryption ensures that every vote is cast anonymously and securely recorded.", color: "primary" },
                            { icon: FaVoteYea, title: "Verifiable Integrity", text: "Each vote creates an immutable record, ensuring that election results are 100% auditable.", color: "success" },
                            { icon: FaChartLine, title: "Live Analytics", text: "Monitor election turnout and results in real-time with comprehensive data visualization.", color: "warning" }
                        ].map((feature, idx) => (
                            <Col md={4} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="card-premium h-100 border-0 p-4">
                                        <Card.Body className="d-flex flex-column align-items-center text-center">
                                            <div className={`mb-4 bg-${feature.color} bg-opacity-10 d-inline-flex p-4 rounded-circle text-${feature.color}`}>
                                                <feature.icon size={32} />
                                            </div>
                                            <h4 className="fw-bold mb-3">{feature.title}</h4>
                                            <p className="text-muted mb-0">
                                                {feature.text}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Landing;
