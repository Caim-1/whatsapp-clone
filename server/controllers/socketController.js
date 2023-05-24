const pool = require("../db");

module.exports.authorizeUser = (socket, next) => {
  if (!socket.request.session || !socket.request.session.user) {
    console.log("Bad request.");
    next(new Error("Not authorized!"));
  } else {
    socket.user = { ...socket.request.session.user };
    next();
  }
}

module.exports.initializeUser = async socket => {
  const currUser = socket.user.username;
  socket.join(socket.user.userid); // Don't know how this works.
  const relations = await getRelations(currUser);

  await setUserConnected(currUser);

  if (relations) {
    const friendArray = await getFriendList(currUser, relations);
    const friendRooms = friendArray.map((friend) => friend.userid);
    
    socket.to(friendRooms).emit("connected", true, currUser);
    socket.emit("friends", friendArray);

    friendRooms.forEach(async (friendId) => {
      const messages = await getMessages(socket.user.userid, friendId);
      // console.log(messages);

      if (typeof(messages) !== "undefined") {
        const parsedMessages = messages.map(msg => {
          return { to: msg.msgto, from: msg.msgfrom, content: msg.msgcontent }
        });

        parsedMessages.reverse();
        socket.emit("messages", parsedMessages);
      }
      
    })
  }
};

module.exports.addFriend = async (socket, friendName, callback) => {
  if (friendName === socket.user.username) {
    callback({ done: false, errorMsg: "Cannot add self as friend." });
    return;
  }
  
  const friendUserID = await findFriend(friendName);

  if (!friendUserID) {
    callback({ done: false, errorMsg: "User not found." });
    return;
  }

  await addFriend(socket.user.username, friendName);

  // Friend data for callback.
  const friendData = await getFriendData(friendName);

  const newFriend = {
    username: friendName,
    connected: friendData.connected,
    userid: friendData.userid,
  }

  callback({ done: true, newFriend });
}

const findFriend = async (friendName) => {
  const potentialFriend = await pool.query(
    "SELECT userid FROM users u WHERE u.username=$1",
    [friendName]
  );

  if (potentialFriend.rowCount > 0) {
    return potentialFriend.rows[0].userid;
  } 
}

const addFriend = async (username, friendName) => {
  await pool.query(
    "INSERT INTO friends (username, friendUsername) values($1,$2) RETURNING username, friendUsername",
    [username, friendName]
  );
}

const getFriendList = async (currUser, relations) => {
  const friendNames = relations.map(item => {
    return item.username !== currUser ? item.username : item.friendusername;
  });

  const friendArray = await Promise.all(friendNames.map(async (name) => {
    const friendData = await getFriendData(name);
    return { username: name, connected: friendData.connected, userid: friendData.userid };
  }));

  return friendArray;
}

const getFriendData = async (friendName) => {
  const friendData = await pool.query(
    "SELECT userid, connected FROM users u WHERE u.username=$1",
    [friendName]
  );

  return friendData.rows[0];
}

const getRelations = async (username) => {
  const potentialRelations = await pool.query(
    "SELECT * FROM friends WHERE username=$1 OR friendUsername=$1",
    [username]
  );

  if (potentialRelations.rowCount > 0) {
    return potentialRelations.rows;
  }
}

const setUserConnected = async (username) => {
  await pool.query(
    "UPDATE users u SET connected='true' WHERE u.username=$1",
    [username]
  );
}

const getMessages = async (userid, friendid) => {
  const potentialMessages = await pool.query(
    "SELECT msgFrom, msgTo, msgContent FROM messages WHERE (msgFrom=$1 AND msgTo=$2) OR (msgFrom=$2 AND msgTo=$1)",
    [userid, friendid]
  );

  if (potentialMessages.rowCount > 0) {
    return potentialMessages.rows;
  }
}

module.exports.dm = async (socket, message) => {
  const parsedMessage = { ...message, from: socket.user.userid }
  await pool.query(
    "INSERT INTO messages (msgFrom, msgTo, msgContent) values($1,$2,$3)",
    [socket.user.userid, message.to, message.content]
  );
  socket.to(message.to).emit("dm", parsedMessage);
}

module.exports.onDisconnect = async (socket) => {
  const currUser = socket.user.username;

  await pool.query(
    "UPDATE users u SET connected='false' WHERE u.username=$1",
    [currUser]
  );

  const relations = await getRelations(currUser);

  if (relations) {
    const friendArray = await getFriendList(currUser, relations);
    const friendRooms = friendArray.map((friend) => friend.userid);
    socket.to(friendRooms).emit("connected", false, socket.user.username);
  }
}