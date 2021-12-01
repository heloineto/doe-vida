interface User {
  username: string;
  password?: string;
  name?: string;
  state?: string;
  city?: string;
  usertype?: number;
  receptor?: number;
}

interface PendingUser {
  name: string;
  city: string;
  state: string;
  username: string;
}
