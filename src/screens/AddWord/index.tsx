import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UI from '@components/shared/UI';
import { StylesConstants } from '@static/styles/StylesConstants';
import { AddWordsInputs } from '@core/models';
import { ifFormIsValid } from '@utils/handlers';
import Firebase from '@services/Firebase';
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
const _ = require('lodash');
const { debounce } = _;

const AddWord: React.FC<{ route: { [x: string]: any }; navigation: any }> = ({
  navigation,
  route,
}) => {
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisibleGroup, setModalVisibleGroup] = useState<boolean>(false);
  const [sameWord, setSameWord] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const groups: string[] = route.params?.groups || [];

  const { handleSubmit, control, formState, getValues, reset, watch } =
    useForm<AddWordsInputs>({
      mode: 'onChange',
    });
  const text1 = useRef({});
  text1.current = watch('text1', '');

  const checkIfWordExist = async (text1?: string) => {
    try {
      if (!text1) {
        return;
      } else {
        setIsLoading(true);
        const data = await Firebase.checkExistingWord(
          route.params.lang,
          text1,
          route.params.userId,
        );
        setIsLoading(false);
        if (data?.error) {
          throw data.error;
        } else {
          setSameWord(false);
        }
      }
    } catch (err) {
      setSameWord(true);
      Toast.show({
        type: 'error',
        text2: err,
      });
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceLoadData = useCallback(debounce(checkIfWordExist, 500), [
    route.params,
    setIsValidForm,
    setSameWord,
    setIsLoading,
  ]);

  const onSubmitAddWord = async (dataForm: AddWordsInputs) => {
    try {
      setIsLoading(true);
      const data = await Firebase.addWord(
        route.params.lang,
        dataForm.text1,
        dataForm.text2,
        route.params.userId,
        selectedGroup,
      );
      if (data?.error) {
        throw data.error;
      } else {
        navigation.navigate('home', {
          getNewly: true,
        });
        Toast.show({
          type: 'success',
          text2: 'New word added!',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: err,
      });
    } finally {
      setSelectedGroup('');
      setIsLoading(false);
      reset();
    }
  };

  const closeDialog = (v?: string) => {
    setSelectedGroup(v || '');
    setModalVisibleGroup(false);
  };

  useEffect(() => {
    setIsValidForm(
      ifFormIsValid(['text1', 'text2'], getValues(), formState.errors),
    );
  }, [getValues, formState]);

  useEffect(() => {
    setSameWord(true);
    debounceLoadData(text1.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text1.current]);

  return (
    <View style={styles.mainBody}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ ...styles.addWordTitleView }}>
          <Text style={styles.addWordTxt}>Add word</Text>
          <Text style={styles.subTitle}>
            Add word and let's learn it together
          </Text>
        </View>
        <View>
          <KeyboardAvoidingView enabled behavior="padding">
            <Icon name="form-textbox" style={{ ...styles.formIcon }} />
            <UI.Input
              label={`Type ${route.params.lang}*`}
              control={control}
              error={formState.errors?.text1?.message}
              rules={{ required: 'Please complete this mandatory field' }}
              name="text1"
              placeholder={`Input ${route.params.lang} word`}
              inputProps={{ keyboardType: 'default' }}
            />
            <UI.Input
              label={'Type arm*'}
              control={control}
              error={formState.errors?.text2?.message}
              rules={{ required: 'Please complete this mandatory field' }}
              name="text2"
              placeholder={'Input arm word'}
              inputProps={{ keyboardType: 'default' }}
            />
            {groups?.length ? (
              <View style={styles.addToGroupView}>
                <Text style={styles.addToGroupLabel}>Add to group</Text>
                <Text
                  onPress={() => setModalVisibleGroup(true)}
                  style={[
                    styles.addToGroupValue,
                    { color: !selectedGroup ? '#c6c6ca' : '#000' },
                  ]}
                >
                  {selectedGroup || 'Choose group name'}
                </Text>
              </View>
            ) : null}
            {!isLoading ? (
              <TouchableOpacity
                onPress={handleSubmit(onSubmitAddWord)}
                disabled={!isValidForm && sameWord}
              >
                <Text
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        isValidForm && !sameWord
                          ? StylesConstants.MAIN_COLOR
                          : StylesConstants.BTN_DISABLE_COLOR,
                    },
                  ]}
                >
                  Add Word
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.indicatorBtn,
                  {
                    backgroundColor:
                      isValidForm && !sameWord
                        ? StylesConstants.MAIN_COLOR
                        : StylesConstants.BTN_DISABLE_COLOR,
                  },
                ]}
              >
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <Text
              style={styles.makeGroup}
              onPress={() => navigation.navigate('add-group')}
            >
              Do you want to {groups?.length ? 'add' : 'create'} a new group?
            </Text>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
      <Portal theme={{}}>
        <Dialog visible={modalVisibleGroup} onDismiss={closeDialog}>
          <Dialog.Title>Choose group</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 300 }} scrollEnabled={true}>
              {groups
                .map(e => ({ label: e, value: e }))
                .map((obj, i) => (
                  <RadioButton
                    labelHorizontal
                    key={obj.value}
                    style={{ marginBottom: 10, alignItems: 'center' }}
                  >
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={selectedGroup === obj.value}
                      onPress={() => closeDialog(obj.value)}
                      buttonInnerColor={StylesConstants.MAIN_COLOR}
                      buttonOuterColor={
                        selectedGroup === obj.value
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
                      onPress={() => closeDialog(obj.value)}
                      labelStyle={{ fontSize: 15, color: '#000' }}
                      labelWrapStyle={{}}
                    />
                  </RadioButton>
                ))}
            </ScrollView>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};
const styles = StyleSheet.create({
  addToGroupValue: {
    flex: 1,
    height: 55,
    textAlignVertical: 'center',
    borderWidth: 2,
    borderBottomColor: '#c6c6ca',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  addToGroupLabel: {
    position: 'absolute',
    top: -12,
    color: StylesConstants.MAIN_COLOR,
    fontSize: 12,
  },
  addToGroupView: {
    flexDirection: 'row',
    marginBottom: 30,
    position: 'relative',
    alignItems: 'center',
  },
  makeGroup: {
    color: '#888484',
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  addWordTitleView: {
    marginTop: 50,
    marginBottom: 100,
  },
  addWordTxt: {
    fontSize: 30,
    fontWeight: 'bold',
    color: StylesConstants.MAIN_COLOR,
  },
  subTitle: {
    fontSize: 12,
    color: '#888484',
  },
  mainBody: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    marginLeft: 35,
    marginRight: 35,
  },
  formIcon: {
    textAlign: 'center',
    fontSize: 50,
    marginBottom: 30,
    fontWeight: 'bold',
    color: StylesConstants.MAIN_COLOR,
  },
  sectionStyle: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 10,
    position: 'relative',
    alignItems: 'center',
  },
  inputTitle: {
    position: 'absolute',
    top: -12,
    color: StylesConstants.MAIN_COLOR,
    fontSize: 12,
  },
  inputStyle: {
    flex: 1,
    color: '#000',
    paddingLeft: 30,
    borderWidth: 2,
    borderBottomColor: '#c6c6ca',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  button: {
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: StylesConstants.MAIN_COLOR,
    padding: 10,
    height: 45,
    marginBottom: 10,
  },
  indicatorBtn: {
    marginBottom: 10,
    height: 45,
    backgroundColor: StylesConstants.MAIN_COLOR,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddWord;
