import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View, Text } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import UI from '@components/shared/UI';
import { StylesConstants } from '@static/styles/StylesConstants';
import { useForm } from 'react-hook-form';
import { AddWordsInputs, WordModel } from '@core/models';
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import { Languages } from '@core/enums';
import { ifFormIsValid } from '@utils/handlers';

const EditForm: React.FC<{
  groupOpen: Function;
  emitValues: Function;
  radioValChanged: Function;
  emitIsValidForm: Function;
  lang: string;
  isGroupOpen: boolean;
  item: WordModel;
  groups: string[];
}> = ({
  lang,
  emitIsValidForm,
  radioValChanged,
  emitValues,
  isGroupOpen,
  item,
  groups,
  groupOpen,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isLearned, setIsLearned] = useState<boolean>(item.isLearned);

  const { control, formState, getValues, watch } = useForm<AddWordsInputs>({
    mode: 'onChange',
  });

  const text1 = useRef({});
  const text2 = useRef({});
  text1.current = watch('text1', '');
  text2.current = watch('text2', '');

  const emitChangeGroup = (val: string) => {
    setSelectedGroup(val);
    setTimeout(() => {
      radioValChanged(val);
    });
  };

  const haveILearned = (v: boolean) => {
    setIsLearned(v);
  };

  const openGroupContainer = () => {
    groupOpen();
  };

  useEffect(() => {
    setSelectedGroup(item.groupName);
  }, [item.groupName]);

  useEffect(() => {
    emitIsValidForm(
      ifFormIsValid(['text1', 'text2'], getValues(), formState.errors),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues, formState]);

  useEffect(() => {
    emitValues({
      text1: text1.current,
      text2: text2.current,
      groupName: selectedGroup,
      isLearned,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text1.current, text2.current, selectedGroup, isLearned]);

  return (
    <View>
      <Text style={styles.title}>
        {isGroupOpen ? 'Choose group' : 'Update data'}
      </Text>
      {isGroupOpen ? (
        <View>
          {groups
            .map(e => ({ label: e, value: e }))
            .map((obj, i) => (
              <RadioButton
                labelHorizontal
                key={obj.value}
                style={{ marginBottom: 10 }}
              >
                <RadioButtonInput
                  obj={obj}
                  index={i}
                  isSelected={selectedGroup === obj.value}
                  onPress={() => emitChangeGroup(obj.value)}
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
                  onPress={() => emitChangeGroup(obj.value)}
                  labelStyle={{ fontSize: 15, color: '#000' }}
                  labelWrapStyle={{}}
                />
              </RadioButton>
            ))}
        </View>
      ) : (
        <View style={{ transform: [{ scale: isGroupOpen ? 0 : 1 }] }}>
          <KeyboardAvoidingView enabled behavior="padding">
            <UI.Input
              label={`Type ${lang}*`}
              control={control}
              defaultValue={item[lang as keyof typeof Languages]}
              error={formState.errors?.text1?.message}
              rules={{ required: 'Please complete this mandatory field' }}
              name="text1"
              placeholder={`Input ${lang} word`}
              inputProps={{ keyboardType: 'default' }}
            />
            <UI.Input
              defaultValue={item.arm}
              label={'Type arm*'}
              control={control}
              error={formState.errors?.text2?.message}
              rules={{ required: 'Please complete this mandatory field' }}
              name="text2"
              placeholder={'Input arm word'}
              inputProps={{ keyboardType: 'default' }}
            />
            {groups.length ? (
              <View style={styles.addToGroupView}>
                <Text style={styles.addToGroupLabel}>Change group</Text>
                <Text
                  onPress={openGroupContainer}
                  style={[
                    styles.addToGroupValue,
                    { color: !selectedGroup ? '#c6c6ca' : '#000' },
                  ]}
                >
                  {selectedGroup || 'Choose group name'}
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox
                disabled={false}
                value={isLearned}
                onValueChange={haveILearned}
                tintColors={{ true: StylesConstants.SUCCESS }}
                style={{}}
              />
              <Text onPress={() => haveILearned(!isLearned)}>
                I have learned
              </Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
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
  title: {
    fontSize: 20,
    marginBottom: 30,
    fontWeight: 'bold',
    color: StylesConstants.MAIN_COLOR,
  },
});
export default React.memo(EditForm);
