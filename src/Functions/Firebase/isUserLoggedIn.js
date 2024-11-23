import { auth } from "../../firebase";

function isUserLoggedIn() {
  const user = auth.currentUser;
  return user ? true : false;
}
export default isUserLoggedIn;
