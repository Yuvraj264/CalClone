export interface IUserBase {
  name: string;
  email: string;
}

export interface IUserDTO extends IUserBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}
