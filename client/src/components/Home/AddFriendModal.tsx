import { useCallback, useContext, useState } from "react";
import { Button, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import TextField from "../TextField";
import { Form, Formik } from "formik";
import socket from "../../socket";
import * as Yup from 'yup';
import { FriendContext, User } from "./Home";

export default function AddFriendModal({ isOpen, onClose } : { isOpen: boolean, onClose: () => void }) {
  const [error, setError] = useState("");
  const closeModal = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);
  const { friendList, setFriendList } = useContext(FriendContext);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a friend!</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={{ friendName: "" }}
          validationSchema={Yup.object({
            friendName: Yup.string()
              .required("Username required!")
              .min(6, "Invalid username!")
              .max(28, "Invalid username!"),
          })}
          onSubmit={(values) => {
            socket.emit(
              "add_friend",
              values.friendName,
              ({ errorMsg, done, newFriend }: {errorMsg: string, done: boolean, newFriend: User}) => {
                if (done) {
                  setFriendList([newFriend, ...friendList]);
                  closeModal();
                  return;
                }
                
                setError(errorMsg);
              }
            );
          }}
        >
          <Form>
            <ModalBody>
              <Heading fontSize="xl" color="red.500" textAlign="center">
                {error}
              </Heading>
              <TextField
                name="friendName"
                label="Friend's name"
                autoComplete="off"
                placeholder="Enter friend's username..."
              />
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue">
                Submit
              </Button>
            </ModalFooter>
          </Form>
        </Formik>
      </ModalContent>
    </Modal>
  );
}