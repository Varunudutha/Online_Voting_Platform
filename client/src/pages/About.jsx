import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FiShield, FiUsers, FiBox, FiCheckCircle, FiCpu, FiGlobe, FiDatabase, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="fade-in">
            {/* Hero Section */}
            <div className="bg-white py-5 mb-5 border-bottom">
                <Container className="text-center py-5">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="display-4 fw-bold text-heading mb-3"
                    >
                        Secure. Transparent. <span className="text-primary">Digital Voting.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lead text-muted mx-auto"
                        style={{ maxWidth: '700px' }}
                    >
                        We are revolutionizing how elections are conducted. Our platform ensures every vote is counted, every voter is verified, and the results are undeniable.
                    </motion.p>
                </Container>
            </div>

            <Container className="pb-5">
                {/* Mission / Value Props */}
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm card-hover">
                            <Card.Body className="text-center p-4">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FiShield size={32} className="text-primary" />
                                </div>
                                <h4 className="fw-bold mb-3">Unbreakable Security</h4>
                                <p className="text-muted">
                                    Built with industry-standard encryption and secure JWT authentication. Your data and valid votes are protected at every step.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm card-hover">
                            <Card.Body className="text-center p-4">
                                <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FiUsers size={32} className="text-success" />
                                </div>
                                <h4 className="fw-bold mb-3">Role-Based Access</h4>
                                <p className="text-muted">
                                    Distinct workflows for Admins and Voters ensuring that sensitive controls remain in the right hands.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm card-hover">
                            <Card.Body className="text-center p-4">
                                <div className="rounded-circle bg-info bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FiCheckCircle size={32} className="text-info" />
                                </div>
                                <h4 className="fw-bold mb-3">Real-Time Integrity</h4>
                                <p className="text-muted">
                                    Watch closely as votes are cast and tabulated instantly with our live Socket.IO integration. ZERO delay.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Tech Stack Chips */}
                <div className="text-center mb-5">
                    <h6 className="text-uppercase text-muted fw-bold mb-3">Powered By Modern Tech</h6>
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2"><FiCpu /> React</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2"><FiBox /> Node.js</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2"><FiDatabase /> MongoDB</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2"><FiGlobe /> Socket.IO</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2"><FiLock /> JWT Auth</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill d-flex align-items-center gap-2">Bootstrap 5</Badge>
                    </div>
                </div>

                {/* Trust Section */}
                <Card className="bg-dark text-white border-0 overflow-hidden rounded-4">
                    <Card.Body className="p-5 text-center position-relative">
                        <div className="position-relative z-1">
                            <h2 className="fw-bold mb-3">Trustworthy & Scalable</h2>
                            <p className="lead text-white-50 mb-0 mx-auto" style={{ maxWidth: '600px' }}>
                                Designed to handle high-traffic elections with consistent performance. Whether it's a small council vote or a large organization election, we deliver accuracy.
                            </p>
                        </div>
                        {/* Abstract Background Decoration */}
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
                            style={{
                                background: 'radial-gradient(circle at top right, #4361ee, transparent 40%), radial-gradient(circle at bottom left, #7209b7, transparent 40%)',
                                pointerEvents: 'none'
                            }}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default About;
