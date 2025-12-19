
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-parallax';

// Initialize Supabase Client with Service Role Key to bypass RLS for custom auth management
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

/**
 * Register a new user
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert into custom users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ email, password_hash: passwordHash }])
      .select()
      .single();

    if (userError) throw userError;

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

/**
 * Login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- DATA ROUTES ---

/**
 * Get User Profile
 */
app.get('/api/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Reading History
 */
app.get('/api/history', authenticateToken, async (req: any, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Save Read Paper
 */
app.post('/api/history', authenticateToken, async (req: any, res: Response) => {
  const { paper } = req.body;
  
  try {
    const { data: historyData, error: historyError } = await supabase
      .from('reading_history')
      .insert([{ user_id: req.user.id, paper_id: paper.id, paper_data: paper }])
      .select()
      .single();

    if (historyError) throw historyError;

    // Increment points
    const { data: profile } = await supabase.from('profiles').select('score').eq('id', req.user.id).single();
    const newScore = (profile?.score || 0) + 100;
    
    await supabase.from('profiles').update({ score: newScore, updated_at: new Date().toISOString() }).eq('id', req.user.id);

    res.json(historyData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`[server]: OpenParallax API running at http://localhost:${port}`);
});
