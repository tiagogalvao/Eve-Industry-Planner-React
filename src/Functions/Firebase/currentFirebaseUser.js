import { usersDefault } from "../../Context/defaultValues";
import { auth } from "../../firebase";

export function getCurrentFirebaseUser() {
  const user = auth.currentUser;
  return user ? user.uid : usersDefault.accountID;
}

export default getCurrentFirebaseUser;
