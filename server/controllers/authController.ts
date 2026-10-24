import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../database/db';
import { generateToken, AuthUser } from '../middleware/auth';
import type { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'staff' | 'resident';
  is_active: number;
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
    return;
  }

  try {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = ?',
      [username.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name
    };

    const token = generateToken(authUser);

    // Also set httpOnly cookie for secure persistence
    res.cookie('brgy_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name
      }
    });
  } catch (err: any) {
    console.error('[AUTH LOGIN ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred during authentication.'
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('brgy_token');
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated.'
    });
    return;
  }

  try {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username, full_name, role, is_active FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'User session is no longer active.'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name
      }
    });
  } catch (err: any) {
    console.error('[AUTH ME ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
}
