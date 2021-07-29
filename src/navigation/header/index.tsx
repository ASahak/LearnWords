import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Entypo';
import IconEvil from 'react-native-vector-icons/EvilIcons';
import { Logo } from '@components/shared';
import { StylesConstants } from '@static/styles/StylesConstants';
import { User } from '@core/models';
import { Globals, Languages } from '@core/enums';
import Firebase from '@services/Firebase';

interface SelectItem {
  title: string;
  value: string | number;
  method: string;
}

const CustomHeader: React.FC<{
  previous: any;
  indicator: boolean;
  lang: string;
  navigation: any;
  user: User;
  emitLangChange: Function;
}> = ({ lang, indicator, user, navigation, emitLangChange }) => {
  const [checkedLang, setCheckedLang] = useState<null | string>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('main');
  const [userLanguages, setUserLanguages] = useState<Array<string>>([]);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [radioLanguages, setRadioLanguages] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [userSelectOptions, setUserSelectOptions] = useState<Array<SelectItem>>(
    [],
  );

  const addWord = () => {
    navigation.navigate('add-word');
  };

  const generateName = (fName: string) => {
    return fName.split(' ').reduce((acc, item) => {
      acc += item.charAt(0).toUpperCase();
      return acc;
    }, '');
  };

  const switchLanguage = () => {
    emitLangChange(checkedLang);
    closeDialog();
  };

  const addLanguage = async () => {
    try {
      setIsLoading(true);
      const data = await Firebase.addLanguage(user.uid, checkedLang as string);
      if (data?.error) {
        throw data?.error;
      }
      Toast.show({
        type: 'success',
        text2: 'Language was added.',
      });
      setUserLanguages(prevState => [
        ...prevState.filter(e => e !== checkedLang),
        checkedLang as string,
      ]);
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: err.message,
      });
    } finally {
      setIsLoading(false);
      closeDialog();
    }
  };

  const openModal = () => {
    setCheckedLang(null);
    setModalVisible(true);
    setDialogContent('main');
  };

  const closeDialog = () => {
    setModalVisible(false);
  };

  const optionMethods = {
    async logOut() {
      try {
        await Firebase.logOut();
        setModalVisible(false);
        DeviceEventEmitter.emit('userEmit', null);
      } catch (err) {
        Toast.show({
          type: 'error',
          text2: err.message,
        });
      }
    },
    addLanguages() {
      setDialogContent('add-lang');
    },
    switchLanguages() {
      setDialogContent('switch-lang');
    },
  };

  useEffect(() => {
    (async () => {
      if (user.displayName) {
        try {
          const languages: string[] & { error: string } =
            await Firebase.getLanguages(user.uid);
          if (languages.error) {
            throw languages.error;
          }
          setUserLanguages(languages);
        } catch (err) {
          Toast.show({
            type: 'error',
            text2: "Can't get languages(",
          });
        }
      }
    })();
  }, [user]);

  useEffect(() => {
    const options = [{ title: 'Log out', value: 'log-out', method: 'logOut' }];
    if (userLanguages.length > 1) {
      options.unshift({
        title: 'Switch language',
        value: 'switch-language',
        method: 'switchLanguages',
      });
    }
    if (userLanguages.length < Object.keys(Languages).length) {
      options.unshift({
        title: 'Add language',
        value: 'add-language',
        method: 'addLanguages',
      });
    }
    setUserSelectOptions(options);
  }, [userLanguages, modalVisible]);

  useEffect(() => {
    if (modalVisible) {
      if (dialogContent === 'add-lang') {
        setRadioLanguages(
          Object.keys(Languages)
            .filter(e => userLanguages.indexOf(e) === -1)
            .map(lng => ({
              label: Languages[lng as keyof typeof Languages],
              value: lng,
            })),
        );
      } else if (dialogContent === 'switch-lang') {
        setCheckedLang(lang);
        setRadioLanguages(
          userLanguages.map(lng => ({
            label: Languages[lng as keyof typeof Languages],
            value: lng,
          })),
        );
      }
    }
    setDialogTitle(
      dialogContent === 'main'
        ? generateName(user.displayName || '')
        : dialogContent === 'add-lang'
        ? 'Add language'
        : dialogContent === 'switch-lang'
        ? 'Switch language'
        : '',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogContent, modalVisible, userLanguages]);

  return indicator ? null : (
    <>
      <View style={styles.headerContainer}>
        <View>
          <View>
            {user.displayName ? (
              <>
                <Text style={styles.avatar} onPress={openModal}>
                  {generateName(user.displayName)}
                </Text>
                <Portal theme={{}}>
                  <Dialog visible={modalVisible} onDismiss={closeDialog}>
                    <Dialog.Title>{dialogTitle}</Dialog.Title>
                    <Dialog.Content>
                      {dialogContent === 'main'
                        ? userSelectOptions.map(item => (
                            <Paragraph
                              style={styles.userModalItems}
                              key={item.value}
                              onPress={() =>
                                optionMethods[
                                  item.method as keyof typeof optionMethods
                                ]()
                              }
                            >
                              {item.title}
                            </Paragraph>
                          ))
                        : dialogContent === 'add-lang' ||
                          dialogContent === 'switch-lang'
                        ? radioLanguages.map((obj, i) => (
                            <RadioButton
                              labelHorizontal
                              key={obj.value}
                              style={{ marginBottom: 10 }}
                            >
                              <RadioButtonInput
                                obj={obj}
                                index={i}
                                isSelected={checkedLang === obj.value}
                                onPress={() => setCheckedLang(obj.value)}
                                buttonInnerColor={StylesConstants.MAIN_COLOR}
                                buttonOuterColor={
                                  checkedLang === obj.value
                                    ? StylesConstants.MAIN_COLOR
                                    : '#6d6c6c'
                                }
                                buttonSize={12}
                                buttonOuterSize={20}
                                buttonStyle={{ borderWidth: 2 }}
                                buttonWrapStyle={{ marginLeft: 10 }}
                              />
                              <RadioButtonLabel
                                obj={obj}
                                index={i}
                                labelHorizontal
                                onPress={() => setCheckedLang(obj.value)}
                                labelStyle={{ fontSize: 15, color: '#000' }}
                                labelWrapStyle={{}}
                              />
                            </RadioButton>
                          ))
                        : null}
                    </Dialog.Content>
                    <Dialog.Actions>
                      <Button onPress={closeDialog} color="#000">
                        Cancel
                      </Button>
                      {dialogContent === 'add-lang' ||
                      dialogContent === 'switch-lang' ? (
                        <>
                          {!isLoading ? (
                            <Button
                              onPress={
                                dialogContent === 'switch-lang'
                                  ? switchLanguage
                                  : addLanguage
                              }
                              dark
                              style={{ marginLeft: 10 }}
                              labelStyle={{ fontSize: 12 }}
                              uppercase={false}
                              mode="contained"
                              color={StylesConstants.MAIN_COLOR}
                            >
                              {dialogContent === 'switch-lang'
                                ? 'Switch'
                                : 'Add'}
                            </Button>
                          ) : (
                            <View
                              style={[
                                styles.indicatorBtn,
                                { backgroundColor: StylesConstants.MAIN_COLOR },
                              ]}
                            >
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          )}
                        </>
                      ) : null}
                    </Dialog.Actions>
                  </Dialog>
                </Portal>
              </>
            ) : (
              <IconEvil name="user" size={50} />
            )}
          </View>
        </View>
        <Logo />
        <Icon
          name="add-to-list"
          size={25}
          style={styles.addWordIcon}
          onPress={addWord}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  indicatorBtn: {
    marginLeft: 10,
    height: 35,
    borderRadius: 3,
    width: 64,
    backgroundColor: StylesConstants.MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    backgroundColor: '#8c928d',
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: Globals.HeaderHeight,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addWordIcon: {},
  avatar: {
    width: 40,
    height: 40,
    fontSize: 18,
    backgroundColor: StylesConstants.MAIN_COLOR,
    borderRadius: 50,
    color: '#fff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
  userModalItems: {
    marginBottom: 4,
    paddingBottom: 4,
  },
});

export default CustomHeader;
