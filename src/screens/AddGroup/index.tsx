import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UI from '@components/shared/UI';
import { StylesConstants } from '@static/styles/StylesConstants';
import { useForm } from 'react-hook-form';
import { ifFormIsValid } from '@utils/handlers';
import VALIDATORS from '@utils/validators';
import Firebase from '@services/Firebase';

const AddGroup: React.FC<{ route: { [x: string]: any }; navigation: any }> = ({
  navigation,
  route,
}) => {
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { handleSubmit, control, formState, getValues, reset } = useForm<{
    name: string;
  }>({
    mode: 'onChange',
  });

  const onSubmitAddGroup = async (dataForm: { name: string }) => {
    try {
      setIsLoading(true);
      const data = await Firebase.addGroup(
        route.params.lang,
        dataForm.name,
        route.params.userId,
      );
      if (data?.error) {
        throw data.error;
      } else {
        navigation.navigate('home', {
          getNewly: true,
        });
        Toast.show({
          type: 'success',
          text2: 'New group added!',
          visibilityTime: 1000,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: typeof err === 'string' ? err : err.message,
      });
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  useEffect(() => {
    setIsValidForm(ifFormIsValid(['name'], getValues(), formState.errors));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  return (
    <View style={styles.mainBody}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ ...styles.addGroupTitleView }}>
          <Text style={styles.addGroupTxt}>Add Group</Text>
          <Text style={styles.subTitle}>
            Add group to filtering words by their type
          </Text>
        </View>
        <View>
          <KeyboardAvoidingView enabled behavior="padding">
            <Icon name="group" style={{ ...styles.formIcon }} />
            <UI.Input
              marginBottom={30}
              label="Group name"
              control={control}
              error={formState.errors?.name?.message}
              rules={VALIDATORS.GROUP_NAME_VALIDATOR}
              name="name"
              placeholder="Write group name"
              inputProps={{ keyboardType: 'default' }}
            />
            {!isLoading ? (
              <TouchableOpacity
                onPress={handleSubmit(onSubmitAddGroup)}
                disabled={!isValidForm}
              >
                <Text
                  style={[
                    styles.button,
                    {
                      backgroundColor: isValidForm
                        ? StylesConstants.MAIN_COLOR
                        : StylesConstants.BTN_DISABLE_COLOR,
                    },
                  ]}
                >
                  Add Group
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.indicatorBtn,
                  {
                    backgroundColor: isValidForm
                      ? StylesConstants.MAIN_COLOR
                      : StylesConstants.BTN_DISABLE_COLOR,
                  },
                ]}
              >
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  addGroupTitleView: {
    marginTop: 60,
    marginBottom: 150,
  },
  addGroupTxt: {
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

export default AddGroup;
