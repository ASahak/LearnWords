import firebase from '@react-native-firebase/app';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FiltersModel, WordModel } from '@core/models';
import { Languages } from '@core/enums';

export default class Firebase {
  static getLoggedUser() {
    return <FirebaseAuthTypes.User>auth().currentUser;
  }

  static async logOut() {
    return await auth().signOut();
  }

  static async registerUser(email: string, password: string, name: string) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const ref = firestore().collection('users');
      await ref.doc(userCredential.user.uid).set({
        languages: ['en'],
        words: { en: [] },
      });
      await userCredential.user.updateProfile({
        displayName: name,
      });
      return {
        type: 'success',
        msg: 'User registered!',
      };
    } catch (err) {
      return {
        type: 'error',
        msg: err.message,
      };
    }
  }

  static async loginUser(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      return {
        error: undefined,
        user: userCredential?.user,
      };
    } catch (err) {
      return {
        error: {
          type: 'error',
          msg: err.message,
        },
      };
    }
  }

  static passwordReset(email: string) {
    return auth().sendPasswordResetEmail(email);
  }

  static async getLanguages(userId: string) {
    try {
      const result = await firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      return result.data()?.languages;
    } catch (err) {
      return { error: err.message };
    }
  }

  static async addLanguage(userId: string, lang: string) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          const largerArray: any = snapshot.get('languages');
          const wordsObj: any = snapshot.get('words');
          largerArray?.push(lang);
          wordsObj[lang] = [];
          transaction.update(docRef, 'languages', largerArray);
          transaction.update(docRef, 'words', wordsObj);
        });
      });
    } catch (err) {
      return { error: err.message };
    }
  }

  static async getList(userId: string, lang: string, filters: FiltersModel) {
    try {
      const wordsData = await firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      let words = wordsData.data()?.words?.[lang];

      if (filters?.isGroupBy) {
        words = words.filter(
          (e: WordModel) => e.groupName === filters.filterBy,
        );
      } else if (filters.filterBy === 'learned') {
        words = words.filter((e: WordModel) => e.isLearned);
      } else if (filters.filterBy === 'not-learned') {
        words = words.filter((e: WordModel) => !e.isLearned);
      } else if (filters.filterBy === 'z-a') {
        words = words.sort((a: any, b: any) => {
          if (a[lang] > b[lang]) {
            return -1;
          }
          if (a[lang] < b[lang]) {
            return 1;
          }
          return 0;
        });
      } else if (filters.filterBy === 'a-z') {
        words = words.sort((a: any, b: any) => {
          if (a[lang] < b[lang]) {
            return -1;
          }
          if (a[lang] > b[lang]) {
            return 1;
          }
          return 0;
        });
      } else if (filters.filterBy === 'increase-date') {
        words = words.sort((a: any, b: any) => {
          if (a.publication < b.publication) {
            return -1;
          }
          if (a.publication > b.publication) {
            return 1;
          }
          return 0;
        });
      } else if (filters.filterBy === 'decrease-date') {
        words = words.sort((a: any, b: any) => {
          if (a.publication > b.publication) {
            return -1;
          }
          if (a.publication < b.publication) {
            return 1;
          }
          return 0;
        });
      }
      if (filters.searchValue) {
        words = words.filter(
          (e: WordModel) =>
            (e[lang as keyof typeof Languages] || '')
              .toLowerCase()
              .indexOf((filters.searchValue || '').toLowerCase()) > -1 ||
            (e.arm || '')
              .toLowerCase()
              .indexOf((filters.searchValue || '').toLowerCase()) > -1,
        );
      }
      return { words };
    } catch (err) {
      return { error: err.message };
    }
  }

  static async checkExistingWord(lang: string, word1: string, userId: string) {
    try {
      const words = await firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      const wordsList = words.data()?.words?.[lang] || [];
      if (wordsList.length) {
        if (wordsList.some((e: any) => e[lang] === word1)) {
          return { error: 'This word already exist!' };
        }
      }
    } catch (err) {
      return { error: err };
    }
  }

  static async addGroup(lng: string, groupName: string, userId: string) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          let groups: any = snapshot.get('groups');
          if (groups) {
            if (!groups[lng]) {
              groups[lng] = [];
            }
            if (groups[lng].indexOf(groupName) > -1) {
              throw 'Group name already exist';
            }
            groups[lng].push(groupName);
          } else {
            groups = {
              [lng]: [groupName],
            };
          }
          transaction.update(docRef, 'groups', groups);
        });
      });
    } catch (err) {
      return { error: err };
    }
  }

  static async getGroups(lng: string, userId: string) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          const groups: any = snapshot.get('groups');
          if (groups?.hasOwnProperty(lng)) {
            return groups[lng];
          } else {
            return [];
          }
        });
      });
    } catch (err) {
      return { error: err };
    }
  }

  static async updateWord(
    lang: string,
    word1: string,
    word2: string,
    userId: string,
    isLearned: boolean,
    publication: number,
    groupName: string,
  ) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          const largerArray: any = snapshot.get('words');
          const itemIndex = largerArray?.[lang]?.findIndex(
            (e: WordModel) => e.publication === publication,
          );
          if (itemIndex > -1) {
            largerArray[lang][itemIndex] = {
              [lang]: word1,
              arm: word2,
              publication,
              isLearned,
              groupName: groupName || '',
            };
          }
          transaction.update(docRef, 'words', largerArray);
        });
      });
    } catch (err) {
      return { error: err.message };
    }
  }

  static async deleteWord(lang: string, userId: string, publication: number) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          const largerArray: any = snapshot.get('words');
          const findIndex = largerArray[lang].findIndex(
            (e: WordModel) => e.publication === publication,
          );
          if (findIndex > -1) {
            largerArray[lang].splice(findIndex, 1);
            transaction.update(docRef, 'words', largerArray);
          } else {
            throw "Can't find this word on cloud firestore";
          }
        });
      });
    } catch (err) {
      return { error: err.message };
    }
  }

  static async addWord(
    lang: string,
    word1: string,
    word2: string,
    userId: string,
    groupName: string,
  ) {
    try {
      const docRef = firebase.firestore().collection('users').doc(userId);
      return await firebase.firestore().runTransaction(transaction => {
        return transaction.get(docRef).then(snapshot => {
          const largerArray: any = snapshot.get('words');
          largerArray?.[lang]?.push({
            isLearned: false,
            publication: new Date().getTime(),
            [lang]: word1,
            groupName,
            arm: word2,
          } as WordModel);
          transaction.update(docRef, 'words', largerArray);
        });
      });
    } catch (err) {
      return { error: err.message };
    }
  }
}
