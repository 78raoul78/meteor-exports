# Simple web app allowing to manage exports and based on [meteor.js](https://www.meteor.com/)

## How to run it ?

1. Run the following command line at the root directory level

> meteor run

2. Open your browser on the url **http://localhost:3000/** (subject to change if your port is not 3000)

3. If your redirected to the login page, please use the following account

> username : meteorite  
> password : password

You can add others accounts [here](./server/main.js) in the accounts array

4. Once your connected, you can :

- start an export by clicking on the button **export**
- show/hide completed exports by clicking on the button **show all/hide completed**
- delete any export by clicking on the delete icon present on the same line

The export progresses by 5% every second, but you can adjust these settings [here](./imports/api/exportsMethods.js)
Once the export reaches 100%, it displays an url randomly picked amount the elements declared here [here](./imports/api/exportsMethods.js) in the urls array

5. Possible errors :

When installing/running meteor, you can have an error with a message like :

> 'Error: incorrect data check

    at Zlib.zlibOnError [as onerror] (zlib.js:187:17)'

Just follow the workaround suggested [here](https://github.com/meteor/meteor/pull/12752/files)

6. Next steps

- Improve the user interface by using a grid to display exports for example
- Use a internationalization library to support several languages
- Add a logging library for both front and back ends.
