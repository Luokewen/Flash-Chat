// 用户类型
export interface User {
  username: string;
  password: string;
}

//用户的返回值类型
export interface UserResponse {
  code: number;
  message: string;
  token: string;
  data: {
    id:string,
    username: string;
  };
}
