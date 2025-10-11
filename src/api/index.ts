// 导入所有API模块
import * as userApi from './user';
import * as userInfoApi from './userInfo';
import * as friendApi from './friends';

// 统一导出API
export default {
  user: userApi,
  userInfo: userInfoApi,
  friend: friendApi
};
