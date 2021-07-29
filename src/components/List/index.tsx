import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  FlatList,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { WordModel, AddWordsInputs } from '@core/models';
import Firebase from '@services/Firebase';
import { Globals, Languages } from '@core/enums';
import { StylesConstants } from '@static/styles/StylesConstants';
import EditForm from './components/EditForm';
import Toast from 'react-native-toast-message';

function replaceAll(str: string, find: string) {
  const foundedIndexes: number[] = [];
  if (find.length > 0) {
    const matches = str.matchAll(new RegExp(find, 'g'));
    for (const match of matches) {
      let i = 0;
      while (i < find.length) {
        foundedIndexes.push((match.index || 0) + i);
        i++;
      }
    }
  }
  return str.split('').map((txt, index) => {
    const isBold = foundedIndexes.indexOf(index) > -1;
    return (
      <Text
        key={txt + index}
        style={{ fontWeight: isBold ? 'bold' : 'normal' }}
      >
        {txt}
      </Text>
    );
  });
}

const Item: React.FC<{
  item: WordModel;
  lang: string;
  emitPopUp: Function;
  searchValue: string;
}> = ({ emitPopUp, item, lang, searchValue }) => {
  return (
    <View style={styles.item}>
      <View style={styles.title}>
        {replaceAll(
          (item[lang as keyof typeof Languages] || '').toLowerCase(),
          searchValue.toLowerCase(),
        )}
      </View>
      <View style={[styles.title, { borderRightWidth: 0, paddingRight: 10 }]}>
        {replaceAll((item.arm || '').toLowerCase(), searchValue.toLowerCase())}
      </View>
      <View style={styles.moreItems}>
        <Icon name="more-vertical" size={20} onPress={() => emitPopUp(item)} />
      </View>
    </View>
  );
};

const List: React.FC<{
  data: Array<WordModel>;
  lang: string;
  loadNewWords: boolean;
  userId: string;
  searchValue: string;
  navigation: any;
  wordsCount: number;
  groups: string[];
}> = ({
  navigation,
  wordsCount,
  searchValue,
  data,
  lang,
  userId,
  loadNewWords,
  groups,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isGroupOpen, setIsGroupOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<WordModel | null>(null);
  const [editView, setEditView] = useState<boolean>(false);
  const [values, setValues] = useState<AddWordsInputs | null>(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const editViewDialog = (item: WordModel) => {
    setDialogContent(item);
    setModalVisible(true);
  };

  const groupOpen = () => {
    setIsGroupOpen(true);
  };

  const groupCancel = () => {
    setIsGroupOpen(false);
  };

  const editViewCancel = () => {
    setEditView(false);
  };

  const groupChanged = () => {
    setIsGroupOpen(false);
  };

  const goToEditView = () => {
    setEditView(true);
  };

  const deleteWord = async () => {
    try {
      setIsLoading(true);
      if (!dialogContent) {
        throw "There aren't any active word";
      }
      const res = await Firebase.deleteWord(
        lang,
        userId,
        dialogContent.publication,
      );
      if (res?.error) {
        throw res.error;
      } else {
        navigation.navigate('home', {
          getNewly: true,
        });
        Toast.show({
          type: 'success',
          text2: 'Word deleted!',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: err,
      });
    } finally {
      closeDialog();
      setIsLoading(false);
    }
  };

  const saveUpdates = async () => {
    try {
      if (!dialogContent) {
        throw "There aren't any active word";
      }
      if (!values) {
        throw 'Please fill mandatory fields';
      }
      setIsLoading(true);
      const res = await Firebase.updateWord(
        lang,
        values.text1,
        values.text2,
        userId,
        values.isLearned,
        dialogContent.publication,
        values.groupName,
      );
      if (res?.error) {
        throw res.error;
      } else {
        Toast.show({
          type: 'success',
          text2: 'Word updated!',
          onHide: () => {
            navigation.navigate('home', {
              getNewly: true,
            });
          },
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: err,
      });
    } finally {
      closeDialog();
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setIsLoading(false);
    setModalVisible(false);
    setEditView(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    DeviceEventEmitter.emit('hardRefresh');
  }, []);

  useEffect(() => {
    setRefreshing(loadNewWords);
  }, [loadNewWords]);

  return (
    <SafeAreaView style={styles.listView}>
      <Portal theme={{}}>
        <Dialog visible={modalVisible} onDismiss={closeDialog}>
          <Dialog.Content>
            {editView && dialogContent ? (
              <EditForm
                emitValues={(v: AddWordsInputs) => setValues(v)}
                emitIsValidForm={(v: boolean) => setIsValidForm(v)}
                radioValChanged={groupChanged}
                isGroupOpen={isGroupOpen}
                groupOpen={groupOpen}
                lang={lang}
                groups={groups}
                item={dialogContent}
              />
            ) : dialogContent ? (
              <>
                <View style={{ alignItems: 'flex-end' }}>
                  <Icon name="x" size={24} onPress={closeDialog} />
                </View>
                <Text>{dialogContent?.[lang as keyof typeof Languages]}</Text>
                <Text style={{ marginTop: 20 }}>{dialogContent?.arm}</Text>
              </>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions style={{ paddingRight: 15 }}>
            {isGroupOpen ? (
              <>
                <Button onPress={groupCancel} color={StylesConstants.DANGER}>
                  Cancel
                </Button>
              </>
            ) : editView && dialogContent ? (
              isLoading ? (
                <ActivityIndicator
                  style={{ height: 40 }}
                  size="small"
                  color={StylesConstants.SUCCESS}
                />
              ) : (
                <>
                  <Button
                    onPress={editViewCancel}
                    color={StylesConstants.DANGER}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={saveUpdates}
                    color={StylesConstants.SUCCESS}
                    disabled={!isValidForm}
                  >
                    Save
                  </Button>
                </>
              )
            ) : isLoading ? (
              <ActivityIndicator
                style={{ height: 40 }}
                size="small"
                color={StylesConstants.SUCCESS}
              />
            ) : (
              <>
                <Button onPress={deleteWord} color={StylesConstants.DANGER}>
                  Delete
                </Button>
                <Button onPress={goToEditView} color={StylesConstants.SUCCESS}>
                  Edit
                </Button>
              </>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FlatList
        style={{ flex: 1 }}
        data={data}
        initialNumToRender={wordsCount}
        renderItem={props => (
          <Item
            emitPopUp={editViewDialog}
            {...props}
            lang={lang}
            searchValue={searchValue}
          />
        )}
        keyExtractor={(item: WordModel) =>
          item.publication + (item?.[lang as keyof typeof Languages] || '')
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            style={{ zIndex: 9 }}
          />
        }
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  moreItems: {
    position: 'absolute',
    right: 4,
    top: 4,
    height: '100%',
    textAlignVertical: 'center',
  },
  listView: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    paddingVertical: 5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eae8e8',
    minHeight: Globals.ListItemHeight,
  },
  title: {
    flexDirection: 'row',
    textAlignVertical: 'center',
    flexWrap: 'wrap',
    paddingVertical: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingLeft: 10,
    fontSize: 13,
    width: '50%',
  },
});
export default List;
