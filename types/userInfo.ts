export interface UserInfoRequest {
  userId: string;
  username?: string;
}

export interface UserInfo {
  code: number;
  success: boolean;
  message: string;
  data: {
    userId: string;
    gender: 'male' | 'female' | 'unknown'| 'other';
    avatar: string;
    nickname: string;
    bio: string;
    address: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
