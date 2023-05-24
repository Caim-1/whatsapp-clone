import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import socket from "../../socket";
import { AccountContext } from "../AccountContext";
import { User, Message } from "./Home";

const useSocketSetup = (setFriendList: Dispatch<SetStateAction<User[]>>, setMessages: Dispatch<SetStateAction<Message[]>>) => {
  const { setUser } = useContext(AccountContext);

  useEffect(() => {
    socket.connect(); // Connect to backend.
    
    socket.on("friends", (friendList) => {
      setFriendList(friendList);
    });

    socket.on("messages", (retrievedMessages) => {
      setMessages(retrievedMessages);
    });

    socket.on("dm", (message) => {
      console.log(message)
      setMessages(prevMsgs => [message, ...prevMsgs]);
    });

    socket.on("connect_error", () => {
      setUser({ loggedIn: false })
    });

    socket.on("connected", (status, username) => {
      console.log('user connected');
      setFriendList(prevFriends => {
        return [...prevFriends].map((friend) => {
          if (friend.username === username) {
            friend.connected = status;
          }

          return friend;
        });
      })
    });

    return () => {
      socket.off("connect_error");
      socket.off("connected");
      socket.off("friends");
      socket.off("messages");
      socket.off("dm");
    }
  }, [setUser, setFriendList, setMessages]);
}

export default useSocketSetup;