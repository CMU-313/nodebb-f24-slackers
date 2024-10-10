# User Guide
In this project, we added two new features:

1. A search bar that can search for topics within a category.
2. A system to tag questions as answered/closed and tag answers as verified by a teacher (similar to Piazza) 

The front-end components of these new features are implemented using our custom theme: `nodebb-theme-slackers`. 

## Using our custom theme
Here is how to set up and use our custom theme.

#### Add it to node_modules
1. Make sure the directory `nodebb-theme-slackers` is located in the root directory  (along with `public`, `src` for example)  
2. Navigate to `nodebb-theme-slackers` (run `cd nodebb-theme-slackers/` from the root directory)
3. Run `npm link`
4. Navigate back to the root directory (run `cd ..`)
5. Run `npm link nodebb-theme-slackers`

#### Use the new custom theme
1. After making sure NodeBB is not running (run `./nodebb stop`), run `./nodebb reset -t nodebb-theme-slackers`. Now our new custom theme will be used when NodeBB is relaunched.
2. Make sure `redis-server` is running so that we can launch our project. 
3. Launch NodeBB in your preferred way:
```
./nodebb reset -t nodebb-theme-slackers && ./nodebb build && ./nodebb start
```
4. Go to http://localhost:4567/ to see the new theme in action!

## Search bar
### How to use
Our search bar component is found under any category. After launching the local NodeBB app, **navigate to a category** (such as General Discussion or Announcements).

If you set up the theme properly, you should see a search bar in between the title and the tags/filters. Simply click on this search bar and type a search query. If there are existing topics within this category that contain that search query, they will be displayed. You can still click on any of these topics after being filtered and it will properly navigate you to within the topic.

### Automated testing
TODO (include file location of automated tests)

## Tags
### How to use
TODO
### Automated testing
TODO (include file location of automated tests)


## Verify Message
### How to use
Our verify message component is found under the dropdown beside a post. Notice how there is a cross beside the post/comment. This indicates that the post/comment is not yet verified. If you are an administrator or moderator, you can click verify message to verify the post/comment. Refresh the page to notice that the cross has now been changed to a tick. 

### Automated testing
Automated tests for permissions and for backend APIs for verify/unverify message can be found in `tests/posts.js`.
