import { useContext, useEffect, useRef } from "react";
import { TabPanels, TabPanel, VStack, Text } from "@chakra-ui/react";
import { FriendContext, MessagesContext } from "./Home";
import ChatBox from "./ChatBox";

export default function Chat({ userid }: { userid: string }) {
  const { friendList } = useContext(FriendContext);
  const { messages } = useContext(MessagesContext);
  const bottomDiv = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    bottomDiv.current?.scrollIntoView();
  });

  return friendList.length > 0 ? (
    <VStack h="100%" justify="end">
      <TabPanels overflowY="scroll">
        {friendList.map((friend) => (
          <VStack
            flexDir="column-reverse"
            w="100%"
            as={TabPanel}
            key={`chat:${friend.username}`}
          >
            <div ref={bottomDiv} />
            {messages.filter(
              (msg) => msg.to === friend.userid || msg.from === friend.userid
            ).map((message, index) => (
              <Text
                key={`msg:${friend.username}.${index}`}
                fontSize="lg"
                bg={message.to === friend.userid ? "blue.100" : "gray.100"}
                color="gray.800"
                borderRadius="10px"
                p="0.5rem 1rem"
                m={message.to === friend.userid ? "1rem 0 0 auto !important" : "1rem auto 0 0 auto !important"}
                maxWidth="50%"
              >
                {message.content}
              </Text>
            ))}
          </VStack>
        ))}
      </TabPanels>
      <ChatBox userid={userid} />
    </VStack>
  ) : (
    <VStack
      w="100%"
      pt="5rem"
      fontSize="lg"
      justify="center"
      textAlign="center"
    >
      <TabPanels>
        <TabPanel>
          <Text>No frens :( What a loser...</Text>
        </TabPanel>
      </TabPanels>
    </VStack>
  );
}