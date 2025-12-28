import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaColumns } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import voteLogo from '../assets/vote.png';

const AppNavbar = React.memo(() => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkStyle = (path) => ({
        color: location.pathname === path ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: location.pathname === path ? '600' : '500',
        position: 'relative'
    });

    return (
        <Navbar
            expand="lg"
            fixed="top"
            className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                    <motion.img
                        src={voteLogo}
                        alt="Logo"
                        height="32"
                        initial={{ opacity: 0, rotate: -20 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.span
                        className="fw-bold fs-5"
                        style={{ color: 'var(--text-heading)', letterSpacing: '-0.03em' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        VoteSecure
                    </motion.span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Centered Navigation */}
                    <Nav className="mx-auto align-items-center gap-4 d-none d-lg-flex">
                        <Nav.Link as={Link} to="/" style={navLinkStyle('/')}>Home</Nav.Link>
                        {user && (
                            <Nav.Link
                                as={Link}
                                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                style={navLinkStyle(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                            >
                                Dashboard
                            </Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/about" style={navLinkStyle('/about')}>About</Nav.Link>
                    </Nav>

                    {/* Right Side - Profile / Auth */}
                    <Nav className="ms-auto align-items-center gap-3">
                        {!user ? (
                            <motion.div
                                className="d-flex gap-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Button as={Link} to="/login" variant="link" className="text-decoration-none fw-semibold" style={{ color: 'var(--primary)' }}>
                                    Sign In
                                </Button>
                                <Button as={Link} to="/register" className="btn-premium rounded-pill px-4">
                                    Get Started
                                </Button>
                            </motion.div>
                        ) : (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    className="d-flex align-items-center gap-2 text-decoration-none border p-1 rounded-pill pe-3 bg-white"
                                    id="user-dropdown"
                                    style={{ borderColor: 'var(--border-light)' }}
                                >
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: '32px', height: '32px' }}>
                                        <FaUserCircle size={20} />
                                    </div>
                                    <span className="fw-semibold small text-dark d-none d-sm-block">{user.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu
                                    className="border-0 shadow-lg mt-3 p-2 rounded-4"
                                    style={{ minWidth: '220px', animation: 'fadeIn 0.2s ease' }}
                                >
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <div className="fw-bold text-dark">{user.name}</div>
                                        <div className="small text-muted text-capitalize">{user.role} Account</div>
                                    </div>
                                    <Dropdown.Item
                                        as={Link}
                                        to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                        className="rounded py-2 mb-1 d-flex align-items-center gap-2"
                                    >
                                        <FaColumns className="text-muted" /> Dashboard
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={handleLogout}
                                        className="text-danger rounded py-2 d-flex align-items-center gap-2"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
});

export default AppNavbar;

