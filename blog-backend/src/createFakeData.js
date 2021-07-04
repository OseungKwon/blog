import Post from './models/post';
export default function createFakeData() {
    const posts = [...Array(40).keys()].map(i => ({
        title: `포스트 #${i}`,
        body:
            'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil eligendi quisquam libero minima dolores aut optio reiciendis obcaecati quae, at nemo earum quo repellendus iste aspernatur ipsum officiis eum veritatis aperiam laboriosam ab ut molestias. Delectus hic id veniam ipsa provident eaque aliquam laboriosam quidem, nesciunt facere. Culpa, voluptatibus itaque! Praesentium obcaecati, distinctio maiores, nulla suscipit ipsa minus, amet laudantium a quis reiciendis harum officiis sapiente qui dolores nobis voluptas? Repellendus, quaerat quod! Rerum voluptatem, temporibus similique nesciunt consequatur tempora tempore quos dolor reiciendis doloremque eligendi, accusantium mollitia deleniti sint? Suscipit impedit expedita hic pariatur, ab assumenda fugiat atque corrupti!',
        tags: ['가짜', '데이터'],
    }));
    /*
    Post.insertMany(posts, (err, docs) => {
        console.log(docs);
    });
    */
}