import {Unauthenticated} from '../navigators/screenNames';
import rootReducer from '../redux/reducers';

export interface ResolverType {
  [resolver: string]: {
    [fnName: string]: (parent: any, args: any, context: any) => any;
  };
}

export interface Profile {
  id: string;
  username: string;
}

export interface ActionType {
  type: string;
  [key: string]: any;
}

export type RootState = ReturnType<typeof rootReducer>;

export type UnauthenticatedStackList = {
  [Unauthenticated.LOGIN]: undefined;
  [Unauthenticated.LANDING]: undefined;
  [Unauthenticated.REGISTER]: undefined;
};

export type PubKeyArray = {
  hash: Array<number>;
  hash_type: Array<number>;
};

export type PubKey = {
  hash: Uint8Array;
  hash_type: Uint8Array;
};
