import { usersDefault } from "../../Context/defaultValues";
import { auth } from "../../firebase";

function getCurrentFirebaseUser() {
  const user = auth.currentUser;
  return user?.uid || usersDefault[0].accountID;
}

export default getCurrentFirebaseUser;
