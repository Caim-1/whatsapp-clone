import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, ButtonGroup, Heading, Text, VStack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { AccountContext } from "../AccountContext";
import * as Yup from 'yup';
import TextField from "../TextField";

const SignUp = () => {
  const { setUser } = useContext(AccountContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={Yup.object({
        username: Yup.string()
          .required('Username required!')
          .min(6, 'Username too short!')
          .max(28, 'Username too long!'),
        password: Yup.string()
          .required('Password required!')
          .min(6, 'Password too short!')
          .max(28, 'Password too long!'),
      })}
      onSubmit={(values, actions) => {
        const vals = { ...values };
        actions.resetForm();
        fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vals),
        })
        .catch(error => {
          console.log(error.message);
          return;
        })
        .then(res => {
          if (!res || !res.ok || res.status >= 400) return;
          
          return res.json();
        })
        .then(data => {
          if (!data) return;

          
          setUser({ ...data });

          if (data.status) {
            setError(data.status);
          } else if (data.loggedIn) {
            navigate("/home");
          }
        });
      }}
    >
      <VStack
        as={Form}
        m="auto"
        h="100vh"
        spacing="1rem"
        justify="center"
        w={{ base: "90%", md: "500px" }}
      >
        <Heading>Sign Up</Heading>
        <Text as="p" color="red.500">{error}</Text>
        <TextField
          name="username"
          label="Username"
          autoComplete="off"
          placeholder="Enter username"
        />

        <TextField
          type="password"
          name="password"
          label="Password"
          autoComplete="off"
          placeholder="Enter password"
        />

        <ButtonGroup pt="1rem">
          <Button type="submit" colorScheme="teal">Create Account</Button>
          <Button onClick={() => navigate("/")} leftIcon={<ArrowBackIcon />}>
            Back
          </Button>
        </ButtonGroup>
      </VStack>
    </Formik>
  );
};

export default SignUp;