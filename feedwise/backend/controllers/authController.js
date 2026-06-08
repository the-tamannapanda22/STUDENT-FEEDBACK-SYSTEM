const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');


const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: `Account role mismatch. Expected ${user.role}, but tried logging in as ${role}.` });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, branch: user.branch, semester: user.semester, section: user.section, enrollmentId: user.enrollmentId } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, name, enrollmentId, branch, semester, section } = req.body;

    if (!email || !password || !name || !enrollmentId) {
      return res.status(400).json({ error: 'Email, password, name, and Enrollment ID are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        name,
        enrollmentId,
        branch,
        semester: semester ? parseInt(semester) : null,
        section,
        role: 'STUDENT', // Default to student
      },
    });

    res.status(201).json({ message: 'User registered successfully. Please login.' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User with this Email or Enrollment ID already exists' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, branch: true, semester: true, section: true, enrollmentId: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

module.exports = { login, signup, getProfile };
