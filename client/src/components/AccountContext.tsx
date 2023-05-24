import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

type User = {
  loggedIn: boolean | null,
}

interface ContextProps {
  user: User,
  setUser: (newSession: User) => void,
}

export const AccountContext = createContext<ContextProps>({
  user: { loggedIn: null },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUser: () => {},
});

const UserContext = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({ loggedIn: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
      credentials: "include",
    })
    .catch(error => {
      setUser({ loggedIn: false });
      console.log(error.message);
      return;
    })
    .then(response => {
      if (!response || !response.ok || response.status >= 400) {
        setUser({ loggedIn: false });
        return;
      }
      return response.json();
    })
    .then(data => {
      if (!data) {
        setUser({ loggedIn: false });
        return;
      }
      
      setUser({ ...data });
      navigate("/home");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountContext.Provider value={{ user, setUser }}>
      {children}
    </AccountContext.Provider>
  );
};

export default UserContext;