export interface IChangeStatusServiceInput {
  isActive: boolean;
  id: string;
}

export interface IChangeRoleServiceInput {
  id: string;
  role: "user" | "organizer";
}
