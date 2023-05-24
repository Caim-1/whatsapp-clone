import { createContext, useState } from "react";
import { Grid, GridItem, Tabs } from "@chakra-ui/react";
import useSocketSetup from "./useSocketSetup";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

export type User = {
  username: string,
  connected: boolean,
  userid: string,
}

export type Message = {
  to: string,
  from: string | null,
  content: string,
}

interface FriendContextProps {
  friendList: User[],
  setFriendList: (newSession: User[]) => void,
}

interface MessageContextProps {
  messages: Message[],
  setMessages: (newSession: Message[]) => void,
}

export const FriendContext = createContext<FriendContextProps>({
  friendList: [],
  setFriendList: () => [null],
});

export const MessagesContext = createContext<MessageContextProps>({
  messages: [],
  setMessages: () => [null],
});

export default function Home() {
  const [friendList, setFriendList] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendIndex, setFriendIndex] = useState(0);

  useSocketSetup(setFriendList, setMessages);

  const onTabIndexChange = (index: unknown) => {
    if (typeof(index) === "number") {
      setFriendIndex(index);
    }
  }

  return (
    <FriendContext.Provider value={{ friendList, setFriendList }}>
      <Grid
        h="100vh"
        as={Tabs}
        templateColumns="repeat(10, 1fr)"
        onChange={onTabIndexChange}
      >
        <GridItem colSpan={3} borderRight="1px solid gray">
          <Sidebar />
        </GridItem>
        <GridItem colSpan={7} maxH="100vh">
          <MessagesContext.Provider value={{ messages, setMessages }}>
            <Chat userid={friendList[friendIndex]?.userid} />
          </MessagesContext.Provider>
        </GridItem>
      </Grid>
    </FriendContext.Provider>
  );
}