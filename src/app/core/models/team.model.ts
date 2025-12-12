export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  projectIds: string[];
}

export interface TeamMember {
  userId: string;
  role: string;
  joinedAt: Date;
}
