export interface School {
  school_id: number; // Primary key, autoincrements
  name: string;
}

export interface User {
  user_id: number;  
  school_id?: number;  // can be null if admin
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;  
}