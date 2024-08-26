import {loginAction} from '../actions/login';
import {LoginPage as ClientLoginPage} from './LoginPage';

export default function Login() {
  return <ClientLoginPage loginAction={loginAction} />;
}
