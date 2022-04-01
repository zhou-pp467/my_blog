export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
            exact: true
          },
          {
            path: "/user",
            redirect: "/user/login",
            exact: true
          },
          {
            name: 'register',
            path: '/user/register',
            component: './user/Register',
            exact: true
          },
          {
            name: 'register-result',
            path: '/user/register-result',
            component: './user/Register-result',
            exact: true
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },





  {
    path: '/home',
    name: 'blog',
    icon: 'snippets',
    component: './Home',
  },
  {
    path: '/center',
    name: "center",
    icon: "solution",
    component: "./Personal/account/center",
    hideInMenu: true
  },
  {
    path: '/blog-edit',
    name: "blog-edit",
    icon: "snippets",
    component: "./Personal/EditBlog",
    hideInMenu: true
  },
  {
    path: '/blogDetail',
    name: "blogDetail",
    icon: "snippets",
    component: "./BlogDetail",
    hideInMenu: true
  },
  {
    path: '/fork-detail',
    name: "fork-detail",
    icon: "snippets",
    component: "./ForkDetail",
    hideInMenu: true
  },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       icon: 'smile',
  //       component: './Welcome',
  //     },
  //     {
  //       component: './404',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    path: '/',
    redirect: '/Home',
  },
  {
    component: './404',
  },
];
