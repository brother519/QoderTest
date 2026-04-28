import { formatDate, parseJSON } from './helpers';

export class UserService {
  constructor() {
    this.users = [];
    console.log('UserService initialized');
  }

  addUser(name, email) {
    const user = { id: Date.now(), name, email, createdAt: new Date() };
    this.users.push(user);
    console.log('User added:', name);
    return user;
  }

  findUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.log('ERROR: User not found with id', id);
    }
    return user;
  }

  listUsers() {
    return this.users.map(u => ({
      ...u,
      createdAt: formatDate(u.createdAt)
    }));
  }
}

export default UserService;
