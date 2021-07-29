import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Languages } from '@core/enums';

export interface User extends FirebaseAuthTypes.User {
  languages?: Array<string>;
}

export type RegisterInputs = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type AddWordFields = {
  groupName: string;
  isLearned: boolean,
};

export type LoginInputs = {
  text1: any;
  email: string;
  password: string;
};

export interface AddWordsInputs extends AddWordFields {
  text1: string;
  text2: string;
}

type LangKeyFields = { [key in keyof typeof Languages]?: string };
export interface WordModel extends LangKeyFields {
  isLearned: boolean;
  publication: number;
  arm: string;
  groupName: string;
}

export type InputProps = {
  label?: string;
  defaultValue?: string;
  name: string;
  control: any;
  rules: object;
  marginBottom?: number;
  inputProps?: object;
  icon?: { name: string; type?: string };
  placeholder?: string;
  error?: string;
};

export interface FiltersModel {
  filterBy?: string;
  searchValue?: string | undefined;
  isGroupBy?: boolean | undefined;
}
