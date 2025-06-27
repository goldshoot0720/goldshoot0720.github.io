const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const Home = {
    template: `<div><h2>首頁</h2></div>`
};

const Countdown = {
    template: `<div>
<h2>歷史倒數</h2>
{{new Date()}}
</div>`
};

const About = {
    template: `<div><h2>關於</h2></div>`
};

const routes = [
    { path: '/', component: Home },
    { path: '/countdown', component: Countdown },
    { path: '/about', component: About },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp({
    template: `
    <div>
      <nav>
        <router-link to="/">首頁</router-link> |
        <router-link to="/countdown">歷史倒數</router-link> |
        <router-link to="/about">關於</router-link>
      </nav>
      <router-view></router-view>
    </div>
  `
});

app.use(router);
app.mount('#app');
