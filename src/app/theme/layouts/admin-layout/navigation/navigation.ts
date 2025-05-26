export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'clients',
        title: 'Clients',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/clients',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'articles',
        title: 'Articles',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/articles',
        icon: 'shopping',
        breadcrumbs: false
      },
      {
        id: 'services',
        title: 'Services',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/services',
        icon: 'tool',
        breadcrumbs: false
      },
      {
        id: 'revendeurs',
        title: 'Revendeurs',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/revendeurs',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'techniciens',
        title: 'Techniciens',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/techniciens',
        icon: 'tool',
        breadcrumbs: false
      },
      {
        id: 'reclamations',
        title: 'Réclamations',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/reclamations',
        icon: 'warning',
        breadcrumbs: false
      }
    ]
  }
];
