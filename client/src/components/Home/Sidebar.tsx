import { useContext, useEffect } from "react";
import { ChatIcon } from "@chakra-ui/icons";
import { Button, Circle, Divider, HStack, Heading, Tab, TabList, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { FriendContext } from "./Home";
import AddFriendModal from "./AddFriendModal";
import socket from "../../socket";

const circleProps = {
  height: 15,
  width: 15,
}

export default function Sidebar() {
  const { friendList } = useContext(FriendContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    socket.emit("get_friendList");
  }, []);

  return (
    <>
      <VStack py="1.4rem">
        <HStack justify="space-evenly" w="100%">
          <Heading size="md">Add Friend</Heading>
          <Button onClick={onOpen}>
            <ChatIcon />
          </Button>
        </HStack>
        <Divider />
        <VStack as={TabList}>
          {friendList.map((friend, index) => (
            <HStack as={Tab} key={index}>
              <Circle
                background={friend.connected ? "green.500" : "red.500"}
                {...circleProps}
              />
              <Text>{friend.username}</Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      <AddFriendModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}