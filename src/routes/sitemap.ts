import { SvgIconProps } from '@mui/material';
import paths, { rootPaths } from './paths';
import DashboardIcon from 'components/icons/DashboardIcon';

export interface MenuItem {
  id: number;
  name: string;
  pathName: string;
  path?: string;
  active?: boolean;
  icon?: string;
  svgIcon?: (props: SvgIconProps) => JSX.Element;
  items?: MenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 1,
    name: 'Dashboard',
    path: rootPaths.root,
    pathName: 'dashboard',
    svgIcon: DashboardIcon,
    active: true,
  },

  {
    id: 7,
    name: 'All users',
    path: rootPaths.users,
    pathName: 'user',
    icon: 'material-symbols:group-rounded',
    active: true,
  },

  {
    id: 5,
    name: 'Access logs',
    path: rootPaths.logs,
    pathName: 'access-log',
    active: true,
    icon: 'ph:chart-line',
  },

  {
    id: 2,
    name: 'Analytics',
    path: rootPaths.analy,
    pathName: 'analytics',
    active: true,
    icon: 'ri:bar-chart-line',
  },

  {
    id: 9,
    name: 'Admin settings',
    pathName: 'authentication',

    icon: 'fluent:settings-24-regular',
    active: true,
    items: [
      {
        id: 10,
        name: 'Sign in',
        path: paths.signin,
        pathName: 'sign-in',
        active: true,
      },
      {
        id: 11,
        name: 'Add admin',
        path: paths.signup,
        pathName: 'sign-up',
        icon: 'material-symbols:security-rounded',
        active: true,
      },
    ],
  },

  {
    id: 8,
    name: 'Sign Out',
    path: paths.signin,
    pathName: 'sign-out',
    icon: 'humbleicons:logout',
    active: true,
  },
];

export default sitemap;
