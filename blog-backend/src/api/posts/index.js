import Router from 'koa-router';
import *as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts = new Router();


posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write);

const post = new Router();
post.get('/', postsCtrl.read);
post.delete('/', postsCtrl.remove, checkLoggedIn, postsCtrl.cehckOwnPost);
post.patch('/', postsCtrl.update, checkLoggedIn, postsCtrl.cehckOwnPost);
posts.use('/', postsCtrl.getPostById, post.routes());

export default posts;