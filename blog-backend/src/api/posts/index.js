import Router from 'koa-router';
import *as postsCtrl from './posts.ctrl';

const posts = new Router();


posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.read, postsCtrl.checkObjectId);
posts.delete('/:id', postsCtrl.remove, postsCtrl.checkObjectId);
posts.patch('/:id', postsCtrl.update, postsCtrl.checkObjectId);

export default posts;