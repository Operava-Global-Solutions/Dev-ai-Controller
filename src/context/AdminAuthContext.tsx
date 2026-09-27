import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminAuthUser } from '../types/index.js';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  currentUser: AdminAuthUser;
  token: string | null;
  logout: () => void;
  setAuthenticatedUser: (user: AdminAuthUser, token: string) => void;
}

const defaultUser: AdminAuthUser = {
  id: 'usr-sb-7782194',
  email: 'secured.jelvan@gmail.com',
  name: 'Jelvan',
  role: 'Developer / Operator',
  sessionValid: true,
  lastSignInAt: new Date().toISOString(),
};

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  currentUser: defaultUser,
  token: null,
  logout: () => {},
  setAuthenticatedUser: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);
