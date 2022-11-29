import { useContext } from 'react';
import { AuthContext } from './context';

export const useAuth = () => useContext(AuthContext);
